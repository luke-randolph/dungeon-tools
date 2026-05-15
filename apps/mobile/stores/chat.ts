import type {
  ChatRequestBody,
  ChatToolCall,
  ChatToolName,
} from '@dungeon-tools/shared';
import { fetch as expoFetch } from 'expo/fetch';
import { create } from 'zustand';

import {
  appendMessage,
  clearConversation,
  getOrCreateActiveConversation,
  listMessages,
  type ChatMessageRow,
} from '@/db/queries';
import { parseDataStream } from '@/utils/chatStream';
import { buildActiveCharacterSummary, runTool } from '@/utils/chatTools';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  toolCalls?: ChatToolCall[];
  toolCallId?: string;
  toolName?: ChatToolName;
  createdAt: number;
}

interface ChatStore {
  open: boolean;
  loaded: boolean;
  conversationId: number | null;
  messages: ChatMessage[];
  streaming: boolean;
  error: string | null;

  setOpen: (open: boolean) => void;
  setError: (error: string | null) => void;

  init: (characterId: number | null) => Promise<void>;
  clear: () => Promise<void>;

  send: (text: string) => Promise<void>;
  abort: () => void;
}

export function newMessageId(): string {
  // crypto.randomUUID is available in modern Hermes (RN 0.74+) and all browsers.
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }
  // Fallback for older runtimes — not collision-proof, but vastly better than nothing.
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

const MAX_STEPS = 5;

const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8787';

/** Single-flight: one in-flight send at a time per app instance. */
let activeAbort: AbortController | null = null;

function rowToMessage(row: ChatMessageRow): ChatMessage | null {
  if (row.role === 'system') return null;
  return {
    id: row.id,
    role: row.role,
    content: row.content,
    toolCalls: row.toolCalls ?? undefined,
    toolCallId: row.toolCallId ?? undefined,
    toolName: row.toolName ?? undefined,
    createdAt: row.createdAt,
  };
}

export const useChat = create<ChatStore>((set, get) => ({
  open: false,
  loaded: false,
  conversationId: null,
  messages: [],
  streaming: false,
  error: null,

  setOpen(open) {
    set({ open });
  },
  setError(error) {
    set({ error });
  },

  async init(characterId) {
    if (get().loaded) return;
    const conv = await getOrCreateActiveConversation(characterId);
    const rows = await listMessages(conv.id);
    const messages = rows
      .map(rowToMessage)
      .filter((m): m is ChatMessage => m !== null);
    set({ conversationId: conv.id, messages, loaded: true });
  },

  async clear() {
    const convId = get().conversationId;
    if (convId == null) {
      set({ messages: [] });
      return;
    }
    await clearConversation(convId);
    set({ messages: [] });
  },

  async send(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (get().streaming) return;

    set({ error: null, streaming: true });

    const userMsg: ChatMessage = {
      id: newMessageId(),
      role: 'user',
      content: trimmed,
      createdAt: Date.now(),
    };
    appendChatMessage(userMsg);
    await persistChatMessage(userMsg.id);

    activeAbort = new AbortController();
    try {
      for (let step = 0; step < MAX_STEPS; step += 1) {
        const continued = await runChatStep(activeAbort.signal);
        if (!continued) break;
      }
    } catch (err) {
      if (!activeAbort?.signal.aborted) {
        const msg = err instanceof Error ? err.message : String(err);
        set({ error: msg });
      }
    } finally {
      activeAbort = null;
      set({ streaming: false });
    }
  },

  abort() {
    activeAbort?.abort();
  },
}));

/**
 * Runs one POST → stream parse → (optional) tool execution.
 * Returns true if the goblin emitted tool calls (caller should run another step).
 */
async function runChatStep(signal: AbortSignal): Promise<boolean> {
  const body: ChatRequestBody = {
    messages: useChat.getState().messages,
    activeCharacterSummary: buildActiveCharacterSummary(),
  };

  const response = await expoFetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    throw new Error(await goblinErrorMessage(response));
  }
  if (!response.body) {
    throw new Error('chat response has no body');
  }

  const assistantId = newMessageId();
  appendChatMessage({
    id: assistantId,
    role: 'assistant',
    content: '',
    createdAt: Date.now(),
  });

  const toolCalls: ChatToolCall[] = [];
  let textBuffer = '';

  // Throttle React updates so a fast token stream doesn't thrash render. The
  // longer interval also slows the perceived typing speed of the goblin.
  let pendingFlush = false;
  const flush = () => {
    pendingFlush = false;
    patchChatMessage(assistantId, { content: textBuffer });
  };
  const scheduleFlush = () => {
    if (pendingFlush) return;
    pendingFlush = true;
    setTimeout(flush, 80);
  };

  try {
    for await (const chunk of parseDataStream(
      response.body as ReadableStream<Uint8Array>,
      signal,
    )) {
      switch (chunk.type) {
        case 'text-delta':
          textBuffer += chunk.delta;
          scheduleFlush();
          break;
        case 'tool-input-available':
          toolCalls.push({
            id: chunk.toolCallId,
            name: chunk.toolName as ChatToolName,
            input: chunk.input,
          });
          break;
        case 'error':
          throw new Error(chunk.errorText);
        default:
          break;
      }
    }
  } finally {
    if (pendingFlush) flush();
  }

  if (toolCalls.length > 0) {
    patchChatMessage(assistantId, { toolCalls });
  }
  await persistChatMessage(assistantId);

  if (toolCalls.length === 0) return false;

  for (const tc of toolCalls) {
    let output: unknown;
    try {
      output = await runTool(tc.name, tc.input);
    } catch (err) {
      output = { error: err instanceof Error ? err.message : String(err) };
    }
    const toolMsg: ChatMessage = {
      id: newMessageId(),
      role: 'tool',
      content: JSON.stringify(output),
      toolCallId: tc.id,
      toolName: tc.name,
      createdAt: Date.now(),
    };
    appendChatMessage(toolMsg);
    await persistChatMessage(toolMsg.id);
  }

  return true;
}

async function goblinErrorMessage(response: Response): Promise<string> {
  const detail = await response
    .json()
    .then((j: { error?: unknown }) =>
      typeof j?.error === 'string' ? j.error : '',
    )
    .catch(() => '');
  switch (response.status) {
    case 429:
      return 'slow down a bit, traveller';
    case 400:
      if (detail === 'message too long') {
        return 'that scroll is too long for me to read, friend';
      }
      return 'something about that message confused me';
    case 500:
    case 502:
    case 503:
      return 'i tripped on a rock — try me again in a moment';
    default:
      return `i am unwell, friend (${response.status})`;
  }
}

function appendChatMessage(message: ChatMessage): void {
  useChat.setState((s) => ({ messages: [...s.messages, message] }));
}

function patchChatMessage(id: string, patch: Partial<ChatMessage>): void {
  useChat.setState((s) => ({
    messages: s.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)),
  }));
}

async function persistChatMessage(id: string): Promise<void> {
  const state = useChat.getState();
  const message = state.messages.find((m) => m.id === id);
  if (!message || state.conversationId == null) return;
  await appendMessage({
    id: message.id,
    conversationId: state.conversationId,
    role: message.role,
    content: message.content,
    toolCalls: message.toolCalls,
    toolCallId: message.toolCallId,
    toolName: message.toolName,
    createdAt: message.createdAt,
  });
}

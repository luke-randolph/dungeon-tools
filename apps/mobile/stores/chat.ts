import type { ChatToolCall, ChatToolName } from '@dungeon-tools/shared';
import { create } from 'zustand';

import {
  clearConversation,
  getOrCreateActiveConversation,
  listMessages,
  type ChatMessageRow,
} from '@/db/queries';
import {
  appendChatMessage,
  persistChatMessage,
  runChatStep,
} from '@/utils/chatRunner';

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

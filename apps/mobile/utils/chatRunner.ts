import type {
  ChatRequestBody,
  ChatToolCall,
  ChatToolName,
} from '@dungeon-tools/shared';
import { fetch as expoFetch } from 'expo/fetch';

import { appendMessage } from '@/db/queries';
import { useChat, newMessageId, type ChatMessage } from '@/stores/chat';
import { parseDataStream } from '@/utils/chatStream';
import { buildActiveCharacterSummary, runTool } from '@/utils/chatTools';

const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8787';

/**
 * Runs one POST → stream parse → (optional) tool execution.
 * Returns true if the goblin emitted tool calls (caller should run another step).
 */
export async function runChatStep(signal: AbortSignal): Promise<boolean> {
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

export function appendChatMessage(message: ChatMessage): void {
  useChat.setState((s) => ({ messages: [...s.messages, message] }));
}

export function patchChatMessage(
  id: string,
  patch: Partial<ChatMessage>,
): void {
  useChat.setState((s) => ({
    messages: s.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)),
  }));
}

export async function persistChatMessage(id: string): Promise<void> {
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

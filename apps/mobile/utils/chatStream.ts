/**
 * Parser for AI SDK v6's UI Message Stream Protocol (SSE-encoded JSON chunks).
 *
 * The Worker returns `result.toUIMessageStreamResponse()`, which produces
 * Server-Sent Events of the shape:
 *   data: {"type": "text-delta", "id": "...", "delta": "..."}\n\n
 *
 * This iterates the stream and yields parsed `StreamChunk` objects.
 */

export type StreamChunk =
  | { type: 'start' }
  | { type: 'start-step' }
  | { type: 'text-start'; id: string }
  | { type: 'text-delta'; id: string; delta: string }
  | { type: 'text-end'; id: string }
  | { type: 'tool-input-start'; toolCallId: string; toolName: string }
  | { type: 'tool-input-delta'; toolCallId: string; inputTextDelta: string }
  | {
      type: 'tool-input-available';
      toolCallId: string;
      toolName: string;
      input: unknown;
    }
  | { type: 'finish-step' }
  | { type: 'finish' }
  | { type: 'error'; errorText: string }
  | { type: 'abort' }
  | { type: 'unknown'; raw: Record<string, unknown> };

export async function* parseDataStream(
  stream: ReadableStream<Uint8Array>,
  signal?: AbortSignal,
): AsyncGenerator<StreamChunk> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      if (signal?.aborted) break;

      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE messages are separated by a blank line (\n\n).
      let sep: number;
      while ((sep = buffer.indexOf('\n\n')) !== -1) {
        const message = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);

        for (const line of message.split('\n')) {
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (payload === '' || payload === '[DONE]') continue;

          let parsed: Record<string, unknown>;
          try {
            parsed = JSON.parse(payload) as Record<string, unknown>;
          } catch {
            continue;
          }

          yield toChunk(parsed);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

function toChunk(raw: Record<string, unknown>): StreamChunk {
  const type = raw.type as string | undefined;
  switch (type) {
    case 'start':
    case 'start-step':
    case 'finish-step':
    case 'finish':
    case 'abort':
      return { type } as StreamChunk;
    case 'text-start':
      return { type, id: String(raw.id) };
    case 'text-delta':
      return { type, id: String(raw.id), delta: String(raw.delta ?? '') };
    case 'text-end':
      return { type, id: String(raw.id) };
    case 'tool-input-start':
      return {
        type,
        toolCallId: String(raw.toolCallId),
        toolName: String(raw.toolName),
      };
    case 'tool-input-delta':
      return {
        type,
        toolCallId: String(raw.toolCallId),
        inputTextDelta: String(raw.inputTextDelta ?? ''),
      };
    case 'tool-input-available':
      return {
        type,
        toolCallId: String(raw.toolCallId),
        toolName: String(raw.toolName),
        input: raw.input,
      };
    case 'error':
      return { type, errorText: String(raw.errorText ?? 'unknown error') };
    default:
      return { type: 'unknown', raw };
  }
}

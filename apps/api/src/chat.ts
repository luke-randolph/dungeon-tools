import type {
  ChatRequestBody,
  ChatRequestMessage,
} from '@dungeon-tools/shared';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import {
  streamText,
  type AssistantModelMessage,
  type JSONValue,
  type ModelMessage,
  type ToolModelMessage,
} from 'ai';
import type { Context } from 'hono';

import type { Bindings } from './index';

const MODEL_ID = 'gemini-2.5-flash';
const MAX_HISTORY = 30;

export async function handleChat(
  c: Context<{ Bindings: Bindings }>,
): Promise<Response> {
  const apiKey = c.env.GEMINI_API_KEY;
  if (!apiKey) {
    return c.json({ error: 'GEMINI_API_KEY is not configured' }, 500);
  }

  let body: ChatRequestBody;
  try {
    body = (await c.req.json()) as ChatRequestBody;
  } catch {
    return c.json({ error: 'invalid JSON body' }, 400);
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return c.json({ error: 'messages must be a non-empty array' }, 400);
  }

  const trimmed = messages.slice(-MAX_HISTORY);
  const modelMessages = toModelMessages(trimmed);

  const google = createGoogleGenerativeAI({ apiKey });

  // DIAGNOSTIC: tools and tool-mentioning prompt removed to isolate whether
  // the tool schema is what makes Gemini return 0 tokens in prod.
  const result = streamText({
    model: google(MODEL_ID),
    system:
      'You are a friendly goblin sage helping with D&D 5th edition (2014) questions. Keep replies short and in character.',
    messages: modelMessages,
    onError({ error }) {
      console.error('streamText error', {
        message: error instanceof Error ? error.message : String(error),
        name: error instanceof Error ? error.name : undefined,
        cause: error instanceof Error ? error.cause : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });
    },
    onFinish({ usage, finishReason, text, toolCalls, warnings, providerMetadata }) {
      console.log(
        'chat finish',
        JSON.stringify(
          {
            finishReason,
            textLength: text?.length ?? 0,
            textPreview: text?.slice(0, 120) ?? '',
            toolCallCount: toolCalls?.length ?? 0,
            toolCallNames: toolCalls?.map((tc) => tc.toolName) ?? [],
            warnings: warnings ?? [],
            providerMetadata: providerMetadata ?? null,
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens,
            totalTokens: usage.totalTokens,
          },
          null,
          2,
        ),
      );
    },
  });

  return result.toUIMessageStreamResponse();
}

function toModelMessages(messages: ChatRequestMessage[]): ModelMessage[] {
  const out: ModelMessage[] = [];

  for (const m of messages) {
    if (m.role === 'user') {
      out.push({ role: 'user', content: m.content });
      continue;
    }

    if (m.role === 'assistant') {
      if (m.toolCalls && m.toolCalls.length > 0) {
        const parts: AssistantModelMessage['content'] = [];
        if (m.content && m.content.length > 0) {
          (parts as Array<{ type: 'text'; text: string }>).push({
            type: 'text',
            text: m.content,
          });
        }
        for (const tc of m.toolCalls) {
          (
            parts as Array<{
              type: 'tool-call';
              toolCallId: string;
              toolName: string;
              input: unknown;
            }>
          ).push({
            type: 'tool-call',
            toolCallId: tc.id,
            toolName: tc.name,
            input: tc.input,
          });
        }
        out.push({ role: 'assistant', content: parts });
      } else {
        out.push({ role: 'assistant', content: m.content });
      }
      continue;
    }

    if (m.role === 'tool') {
      if (!m.toolCallId || !m.toolName) continue;
      const toolMsg: ToolModelMessage = {
        role: 'tool',
        content: [
          {
            type: 'tool-result',
            toolCallId: m.toolCallId,
            toolName: m.toolName,
            output: { type: 'json', value: parseToolContent(m.content) },
          },
        ],
      };
      out.push(toolMsg);
      continue;
    }

    // 'system' on the wire is ignored — the worker injects its own.
  }

  return out;
}

function parseToolContent(content: string): JSONValue {
  if (!content) return null;
  try {
    return JSON.parse(content) as JSONValue;
  } catch {
    return content;
  }
}

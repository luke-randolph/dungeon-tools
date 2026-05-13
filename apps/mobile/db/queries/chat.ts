import type {
  ChatRole,
  ChatToolCall,
  ChatToolName,
} from '@dungeon-tools/shared';
import { getDb } from '../index';

export interface ChatConversation {
  id: number;
  characterId: number | null;
  title: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface ChatMessageRow {
  id: string;
  conversationId: number;
  role: ChatRole;
  content: string;
  toolCalls: ChatToolCall[] | null;
  toolCallId: string | null;
  toolName: ChatToolName | null;
  createdAt: number;
}

interface ChatConversationDbRow {
  id: number;
  character_id: number | null;
  title: string | null;
  created_at: number;
  updated_at: number;
}

interface ChatMessageDbRow {
  id: string;
  conversation_id: number;
  role: string;
  content: string;
  tool_calls: string | null;
  tool_call_id: string | null;
  tool_name: string | null;
  created_at: number;
}

function rowToConversation(row: ChatConversationDbRow): ChatConversation {
  return {
    id: row.id,
    characterId: row.character_id,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToMessage(row: ChatMessageDbRow): ChatMessageRow {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    role: row.role as ChatRole,
    content: row.content,
    toolCalls: row.tool_calls
      ? (JSON.parse(row.tool_calls) as ChatToolCall[])
      : null,
    toolCallId: row.tool_call_id,
    toolName: row.tool_name as ChatToolName | null,
    createdAt: row.created_at,
  };
}

export async function createConversation(
  characterId: number | null,
  title: string | null = null,
): Promise<ChatConversation> {
  const db = await getDb();
  const now = Date.now();
  const result = await db.runAsync(
    `INSERT INTO chat_conversations (character_id, title, created_at, updated_at)
     VALUES (?, ?, ?, ?)`,
    characterId,
    title,
    now,
    now,
  );
  return {
    id: result.lastInsertRowId,
    characterId,
    title,
    createdAt: now,
    updatedAt: now,
  };
}

export async function getMostRecentConversation(): Promise<ChatConversation | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<ChatConversationDbRow>(
    'SELECT * FROM chat_conversations ORDER BY updated_at DESC LIMIT 1',
  );
  return row ? rowToConversation(row) : null;
}

export async function getOrCreateActiveConversation(
  characterId: number | null,
): Promise<ChatConversation> {
  const existing = await getMostRecentConversation();
  if (existing) return existing;
  return createConversation(characterId);
}

export interface AppendMessageInput {
  id: string;
  conversationId: number;
  role: ChatRole;
  content?: string;
  toolCalls?: ChatToolCall[];
  toolCallId?: string;
  toolName?: ChatToolName;
  createdAt?: number;
}

export async function appendMessage(
  input: AppendMessageInput,
): Promise<ChatMessageRow> {
  const db = await getDb();
  const createdAt = input.createdAt ?? Date.now();
  await db.runAsync(
    `INSERT INTO chat_messages
       (id, conversation_id, role, content, tool_calls, tool_call_id, tool_name, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    input.id,
    input.conversationId,
    input.role,
    input.content ?? '',
    input.toolCalls ? JSON.stringify(input.toolCalls) : null,
    input.toolCallId ?? null,
    input.toolName ?? null,
    createdAt,
  );
  await db.runAsync(
    'UPDATE chat_conversations SET updated_at = ? WHERE id = ?',
    createdAt,
    input.conversationId,
  );
  return {
    id: input.id,
    conversationId: input.conversationId,
    role: input.role,
    content: input.content ?? '',
    toolCalls: input.toolCalls ?? null,
    toolCallId: input.toolCallId ?? null,
    toolName: input.toolName ?? null,
    createdAt,
  };
}

export async function listMessages(
  conversationId: number,
): Promise<ChatMessageRow[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ChatMessageDbRow>(
    'SELECT * FROM chat_messages WHERE conversation_id = ? ORDER BY created_at ASC, id ASC',
    conversationId,
  );
  return rows.map(rowToMessage);
}

export async function clearConversation(conversationId: number): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'DELETE FROM chat_messages WHERE conversation_id = ?',
    conversationId,
  );
  await db.runAsync(
    'UPDATE chat_conversations SET updated_at = ? WHERE id = ?',
    Date.now(),
    conversationId,
  );
}

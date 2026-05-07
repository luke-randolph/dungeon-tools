export type ChatRole = 'user' | 'assistant' | 'tool' | 'system';

export type ChatToolName =
  | 'searchSpells'
  | 'getActiveCharacter'
  | 'listCharacterSpells'
  | 'searchSRD';

export type SRDCategory =
  | 'rule-section'
  | 'condition'
  | 'skill'
  | 'class-feature'
  | 'racial-trait'
  | 'class'
  | 'race'
  | 'subclass';

export const SRD_CATEGORIES: readonly SRDCategory[] = [
  'rule-section',
  'condition',
  'skill',
  'class-feature',
  'racial-trait',
  'class',
  'race',
  'subclass',
] as const;

export interface SRDEntry {
  category: SRDCategory;
  index: string;
  name: string;
  body: string;
  /** Lower-cased tokens used for substring search (name, related class/race, etc.) */
  tags: string[];
}

export interface ChatToolCall {
  id: string;
  name: ChatToolName;
  input: unknown;
}

export interface ChatRequestMessage {
  role: ChatRole;
  content: string;
  toolCalls?: ChatToolCall[];
  toolCallId?: string;
  toolName?: ChatToolName;
}

export interface ChatRequestBody {
  messages: ChatRequestMessage[];
  activeCharacterSummary?: string;
}

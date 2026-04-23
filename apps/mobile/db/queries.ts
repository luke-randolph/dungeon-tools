import type {
  Character,
  CharacterClass,
  CharacterRace,
} from '@dungeon-tools/shared';
import { getDb } from './index';

interface CharacterRow {
  id: number;
  name: string;
  race: string;
  class: string;
  level: number;
  created_at: number;
  updated_at: number;
}

function rowToCharacter(row: CharacterRow): Character {
  return {
    id: row.id,
    name: row.name,
    race: row.race as CharacterRace,
    class: row.class as CharacterClass,
    level: row.level,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// --- meta ---

export async function getMeta(key: string): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM meta WHERE key = ?',
    key,
  );
  return row?.value ?? null;
}

export async function setMeta(key: string, value: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    key,
    value,
  );
}

export async function deleteMeta(key: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM meta WHERE key = ?', key);
}

// --- characters ---

export interface CharacterInput {
  name: string;
  race: CharacterRace;
  class: CharacterClass;
  level: number;
}

export async function listCharacters(): Promise<Character[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<CharacterRow>(
    'SELECT * FROM characters ORDER BY created_at ASC',
  );
  return rows.map(rowToCharacter);
}

export async function getCharacter(id: number): Promise<Character | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<CharacterRow>(
    'SELECT * FROM characters WHERE id = ?',
    id,
  );
  return row ? rowToCharacter(row) : null;
}

export async function createCharacter(input: CharacterInput): Promise<Character> {
  const db = await getDb();
  const now = Date.now();
  const result = await db.runAsync(
    `INSERT INTO characters (name, race, class, level, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    input.name,
    input.race,
    input.class,
    input.level,
    now,
    now,
  );
  return {
    id: result.lastInsertRowId,
    ...input,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateCharacter(
  id: number,
  input: CharacterInput,
): Promise<void> {
  const db = await getDb();
  const now = Date.now();
  await db.runAsync(
    `UPDATE characters SET name = ?, race = ?, class = ?, level = ?, updated_at = ?
     WHERE id = ?`,
    input.name,
    input.race,
    input.class,
    input.level,
    now,
    id,
  );
}

export async function deleteCharacter(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM characters WHERE id = ?', id);
}

// --- active character pointer ---

const ACTIVE_KEY = 'active_character_id';

export async function getActiveCharacterId(): Promise<number | null> {
  const v = await getMeta(ACTIVE_KEY);
  return v ? Number(v) : null;
}

export async function setActiveCharacterId(id: number | null): Promise<void> {
  if (id == null) {
    await deleteMeta(ACTIVE_KEY);
  } else {
    await setMeta(ACTIVE_KEY, String(id));
  }
}

// --- spell list ---

export async function listSpellListKeys(characterId: number): Promise<string[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ spell_key: string }>(
    'SELECT spell_key FROM spell_list WHERE character_id = ? ORDER BY added_at ASC',
    characterId,
  );
  return rows.map((r) => r.spell_key);
}

export async function addSpellToList(
  characterId: number,
  spellKey: string,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT OR IGNORE INTO spell_list (character_id, spell_key, added_at) VALUES (?, ?, ?)',
    characterId,
    spellKey,
    Date.now(),
  );
}

export async function removeSpellFromList(
  characterId: number,
  spellKey: string,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'DELETE FROM spell_list WHERE character_id = ? AND spell_key = ?',
    characterId,
    spellKey,
  );
}

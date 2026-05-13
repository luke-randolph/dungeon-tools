import { getDb } from '../index';

export async function listSpellListKeys(
  characterId: number,
): Promise<string[]> {
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

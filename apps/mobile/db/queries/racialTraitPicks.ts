import { getDb } from '../index';

export async function listRacialTraitPickKeys(
  characterId: number,
): Promise<string[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ trait_key: string }>(
    'SELECT trait_key FROM racial_trait_picks WHERE character_id = ? ORDER BY added_at ASC',
    characterId,
  );
  return rows.map((r) => r.trait_key);
}

export async function addRacialTraitPick(
  characterId: number,
  traitKey: string,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT OR IGNORE INTO racial_trait_picks (character_id, trait_key, added_at) VALUES (?, ?, ?)',
    characterId,
    traitKey,
    Date.now(),
  );
}

export async function removeRacialTraitPick(
  characterId: number,
  traitKey: string,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'DELETE FROM racial_trait_picks WHERE character_id = ? AND trait_key = ?',
    characterId,
    traitKey,
  );
}

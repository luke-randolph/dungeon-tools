import { getDb } from '../index';

export async function listClassFeatureKeys(characterId: number): Promise<string[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ feature_key: string }>(
    'SELECT feature_key FROM class_features WHERE character_id = ? ORDER BY added_at ASC',
    characterId,
  );
  return rows.map((r) => r.feature_key);
}

export async function addClassFeatureToList(
  characterId: number,
  featureKey: string,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT OR IGNORE INTO class_features (character_id, feature_key, added_at) VALUES (?, ?, ?)',
    characterId,
    featureKey,
    Date.now(),
  );
}

export async function removeClassFeatureFromList(
  characterId: number,
  featureKey: string,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'DELETE FROM class_features WHERE character_id = ? AND feature_key = ?',
    characterId,
    featureKey,
  );
}

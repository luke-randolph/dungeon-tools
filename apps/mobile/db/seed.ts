import type { SQLiteDatabase } from 'expo-sqlite';

const SEED_SPELL_KEYS = [
  'mage-hand',
  'prestidigitation',
  'fire-bolt',
  'minor-illusion',
  'detect-magic',
  'identify',
  'magic-missile',
  'shield',
  'find-familiar',
  'see-invisibility',
  'detect-thoughts',
  'mirror-image',
  'counterspell',
  'clairvoyance',
  'fireball',
];

// Wizard features that a level-5 wizard would have unlocked.
const SEED_FEATURE_KEYS = [
  'spellcasting-wizard',
  'arcane-recovery',
  'arcane-tradition',
  'wizard-ability-score-improvement-1',
];

export async function seedIfEmpty(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM characters',
  );
  if ((row?.count ?? 0) > 0) return;

  const now = Date.now();
  const result = await db.runAsync(
    `INSERT INTO characters (name, race, class, level, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    'Eldrin Moonwhisper',
    'elf',
    'wizard',
    5,
    now,
    now,
  );
  const characterId = result.lastInsertRowId;

  for (const key of SEED_SPELL_KEYS) {
    await db.runAsync(
      'INSERT OR IGNORE INTO spell_list (character_id, spell_key, added_at) VALUES (?, ?, ?)',
      characterId,
      key,
      now,
    );
  }

  for (const key of SEED_FEATURE_KEYS) {
    await db.runAsync(
      'INSERT OR IGNORE INTO class_features (character_id, feature_key, added_at) VALUES (?, ?, ?)',
      characterId,
      key,
      now,
    );
  }

  await db.runAsync(
    `INSERT INTO meta (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    'active_character_id',
    String(characterId),
  );
}

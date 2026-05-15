import * as SQLite from 'expo-sqlite';
import { SCHEMA_SQL } from './schema';
import { seedIfEmpty } from './seed';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('dungeon-tools.db');
  }
  return dbPromise;
}

export async function runMigrations(): Promise<void> {
  const db = await getDb();
  await db.execAsync(SCHEMA_SQL);
  await seedIfEmpty(db);
}

/**
 * On web the database lives in OPFS, whose sync access handles are exclusive
 * to a single tab. A second tab fails to open the same file with this error.
 */
export function isMultiTabError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return (
    err.name === 'NoModificationAllowedError' ||
    /access handle|createSyncAccessHandle/i.test(err.message)
  );
}

export async function resetDatabase(): Promise<void> {
  const db = await getDb();
  await db.execAsync(`
    DROP TABLE IF EXISTS chat_messages;
    DROP TABLE IF EXISTS chat_conversations;
    DROP TABLE IF EXISTS class_features;
    DROP TABLE IF EXISTS spell_list;
    DROP TABLE IF EXISTS characters;
    DROP TABLE IF EXISTS meta;
  `);
  await db.execAsync(SCHEMA_SQL);
  await seedIfEmpty(db);
}

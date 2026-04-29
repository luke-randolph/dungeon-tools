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

export async function resetDatabase(): Promise<void> {
  const db = await getDb();
  await db.execAsync(`
    DROP TABLE IF EXISTS spell_list;
    DROP TABLE IF EXISTS characters;
    DROP TABLE IF EXISTS meta;
  `);
  await db.execAsync(SCHEMA_SQL);
  await seedIfEmpty(db);
}

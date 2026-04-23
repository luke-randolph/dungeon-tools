export const SCHEMA_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS characters (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  race        TEXT NOT NULL,
  class       TEXT NOT NULL,
  level       INTEGER NOT NULL CHECK (level BETWEEN 1 AND 20),
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS spell_list (
  character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  spell_key    TEXT    NOT NULL,
  added_at     INTEGER NOT NULL,
  PRIMARY KEY (character_id, spell_key)
);
`;

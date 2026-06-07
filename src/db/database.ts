import * as SQLite from 'expo-sqlite';

const SCHEMA = `
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS pet (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    hunger REAL NOT NULL,
    joy REAL NOT NULL,
    energy REAL NOT NULL,
    last_seen_at INTEGER NOT NULL,
    born_at INTEGER NOT NULL
  );
`;

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('tamagotchi.db').then(async (db) => {
      await db.execAsync(SCHEMA);
      return db;
    });
  }
  return dbPromise;
}

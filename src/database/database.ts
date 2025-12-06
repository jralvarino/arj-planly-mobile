import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
   if (db) {
      return db;
   }

   db = await SQLite.openDatabaseAsync('planly.db');
   
   // Criar tabela de hábitos se não existir
   await db.execAsync(`
      CREATE TABLE IF NOT EXISTS habits (
         id TEXT PRIMARY KEY NOT NULL,
         title TEXT NOT NULL,
         amount TEXT NOT NULL,
         streakCount INTEGER NOT NULL DEFAULT 0,
         frequency TEXT NOT NULL,
         completed INTEGER NOT NULL DEFAULT 0,
         color TEXT NOT NULL,
         description TEXT,
         streak_count TEXT,
         emoji TEXT NOT NULL,
         time TEXT NOT NULL,
         date TEXT NOT NULL,
         created_at TEXT NOT NULL DEFAULT (datetime('now')),
         updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
   `);

   return db;
};

export const closeDatabase = async (): Promise<void> => {
   if (db) {
      await db.closeAsync();
      db = null;
   }
};


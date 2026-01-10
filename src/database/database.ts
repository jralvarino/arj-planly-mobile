import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

async function ensureCategoriesSchema(database: SQLite.SQLiteDatabase) {
   await database.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
         id TEXT PRIMARY KEY NOT NULL,
         name TEXT NOT NULL UNIQUE,
         color TEXT NOT NULL,
         created_at TEXT NOT NULL DEFAULT (datetime('now')),
         updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
   `);

   // Inserir categorias padrão se a tabela estiver vazia
   const existingCategories = await database.getAllAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM categories'
   );
   
   if (existingCategories[0]?.count === 0) {
      const defaultCategories = [
         { id: '1', name: 'English', color: '#f3eafe' },
         { id: '2', name: 'Health', color: '#d6fce9' },
         { id: '3', name: 'Home', color: '#ffe4e6' },
      ];

      for (const cat of defaultCategories) {
         await database.runAsync(
            'INSERT INTO categories (id, name, color) VALUES (?, ?, ?)',
            [cat.id, cat.name, cat.color]
         );
      }
   }
}

async function ensureHabitsSchema(database: SQLite.SQLiteDatabase) {
   // Create base table (fresh installs)
   await database.execAsync(`
      CREATE TABLE IF NOT EXISTS habits (
         id TEXT PRIMARY KEY NOT NULL,
         title TEXT NOT NULL,
         amount TEXT NOT NULL,
         streakCount INTEGER NOT NULL DEFAULT 0,
         frequency TEXT NOT NULL,
         completed INTEGER NOT NULL DEFAULT 0,
         skipped INTEGER NOT NULL DEFAULT 0,
         skip_reason TEXT,
         skipped_at TEXT,
         color TEXT NOT NULL,
         description TEXT,
         streak_count TEXT,
         emoji TEXT NOT NULL,
         time TEXT NOT NULL,
         date TEXT NOT NULL,
         period_type TEXT,
         period_config TEXT,
         notes TEXT,
         end_date TEXT,
         notification_time TEXT,
         created_at TEXT NOT NULL DEFAULT (datetime('now')),
         updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
   `);

   // Migrations for existing installs
   const columns = await database.getAllAsync<{ name: string }>(
      "PRAGMA table_info('habits')"
   );
   const names = new Set(columns.map((c) => c.name));

   const addColumn = async (sql: string, name: string) => {
      if (!names.has(name)) {
         await database.execAsync(sql);
      }
   };

   await addColumn(
      'ALTER TABLE habits ADD COLUMN skipped INTEGER NOT NULL DEFAULT 0;',
      'skipped'
   );
   await addColumn('ALTER TABLE habits ADD COLUMN skip_reason TEXT;', 'skip_reason');
   await addColumn('ALTER TABLE habits ADD COLUMN skipped_at TEXT;', 'skipped_at');
   await addColumn('ALTER TABLE habits ADD COLUMN period_type TEXT;', 'period_type');
   await addColumn('ALTER TABLE habits ADD COLUMN period_config TEXT;', 'period_config');
   await addColumn('ALTER TABLE habits ADD COLUMN notes TEXT;', 'notes');
   await addColumn('ALTER TABLE habits ADD COLUMN end_date TEXT;', 'end_date');
   await addColumn('ALTER TABLE habits ADD COLUMN notification_time TEXT;', 'notification_time');
}

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
   if (db) {
      return db;
   }

   db = await SQLite.openDatabaseAsync('planly.db');

   await ensureCategoriesSchema(db);
   await ensureHabitsSchema(db);

   return db;
};

export const closeDatabase = async (): Promise<void> => {
   if (db) {
      await db.closeAsync();
      db = null;
   }
};


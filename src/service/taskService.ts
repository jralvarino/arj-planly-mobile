import { getDatabase } from '../database/database';
import { Habit } from '../models/Habit';

// Dados iniciais para popular o banco na primeira vez
const initialHabits: Omit<Habit, 'id'>[] = [
   {
      title: 'Anki',
      amount: '0/50',
      streakCount: 1,
      frequency: 'English',
      completed: true,
      color: '#f3eafe',
      description: 'asdfg',
      streak_count: '1',
      emoji: 'book',
      time: '22:00',
      date: '2025-12-01',
   },
   {
      title: 'Serie com legendas em Inglês',
      amount: '0/1',
      streakCount: 3,
      frequency: 'English',
      completed: true,
      color: '#D8FFFB',
      description: 'arrewerwef',
      streak_count: '5',
      emoji: 'camera',
      time: 'night',
      date: '2025-12-02',
   },
   {
      title: 'Academia',
      amount: '0/1',
      streakCount: 3,
      frequency: 'Healthy',
      completed: false,
      color: '#d6fce9',
      description: 'arrewerwef',
      streak_count: '30',
      emoji: 'airplane',
      time: 'anytime',
      date: '2025-12-02',
   },
   {
      title: 'Kindle',
      amount: '0/3 pg',
      streakCount: 3,
      frequency: 'English',
      completed: true,
      color: '#ffe4e6',
      description: 'arrewerwef',
      streak_count: '100',
      emoji: 'tv',
      time: 'anytime',
      date: '2025-11-25',
   },
   {
      title: 'asdf',
      amount: '0/3 pg',
      streakCount: 3,
      frequency: 'Home',
      completed: false,
      color: '#ffe4e6',
      description: 'arrewerwef',
      streak_count: '100',
      emoji: 'tv',
      time: 'anytime',
      date: '2025-11-30',
   },
   {
      title: 'asdf 1',
      amount: '0/3 pg',
      streakCount: 3,
      frequency: 'Home',
      completed: true,
      color: '#ffe4e6',
      description: 'arrewerwef',
      streak_count: '100',
      emoji: 'tv',
      time: 'anytime',
      date: '2025-11-30',
   },
];

// Converter resultado do banco para Habit
const rowToHabit = (row: any): Habit => ({
   id: row.id,
   title: row.title,
   amount: row.amount,
   streakCount: row.streakCount,
   frequency: row.frequency,
   completed: Boolean(row.completed),
   color: row.color,
   description: row.description || '',
   streak_count: row.streak_count || '',
   emoji: row.emoji,
   time: row.time,
   date: row.date,
});

// Inicializar banco com dados padrão
const initializeDatabase = async (): Promise<void> => {
   const db = await getDatabase();

   // Verificar se já existem hábitos
   const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM habits'
   );

   if (result && result.count === 0) {
      // Inserir dados iniciais
      for (const habit of initialHabits) {
         const id = `h${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
         await db.runAsync(
            `INSERT INTO habits (
               id, title, amount, streakCount, frequency, completed, 
               color, description, streak_count, emoji, time, date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
               id,
               habit.title,
               habit.amount,
               habit.streakCount,
               habit.frequency,
               habit.completed ? 1 : 0,
               habit.color,
               habit.description,
               habit.streak_count,
               habit.emoji,
               habit.time,
               habit.date,
            ]
         );
      }
   }
};

// Garantir que o banco está inicializado
let initialized = false;
const ensureInitialized = async (): Promise<void> => {
   if (!initialized) {
      await initializeDatabase();
      initialized = true;
   }
};

export const getAllTasks = async (): Promise<Habit[]> => {
   await ensureInitialized();
   const db = await getDatabase();

   const result = await db.getAllAsync<any>(
      'SELECT * FROM habits ORDER BY date DESC, created_at DESC'
   );

   return result.map(rowToHabit);
};

export const getTaskById = async (id: string): Promise<Habit | null> => {
   await ensureInitialized();
   const db = await getDatabase();

   const result = await db.getFirstAsync<any>(
      'SELECT * FROM habits WHERE id = ?',
      [id]
   );

   return result ? rowToHabit(result) : null;
};

export const createTask = async (habit: Omit<Habit, 'id'>): Promise<Habit> => {
   await ensureInitialized();
   const db = await getDatabase();

   const id = `h${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

   await db.runAsync(
      `INSERT INTO habits (
         id, title, amount, streakCount, frequency, completed, 
         color, description, streak_count, emoji, time, date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
         id,
         habit.title,
         habit.amount,
         habit.streakCount,
         habit.frequency,
         habit.completed ? 1 : 0,
         habit.color,
         habit.description,
         habit.streak_count,
         habit.emoji,
         habit.time,
         habit.date,
      ]
   );

   const created = await getTaskById(id);
   if (!created) {
      throw new Error('Failed to create task');
   }
   return created;
};

export const updateTask = async (
   id: string,
   updates: Partial<Habit>
): Promise<Habit> => {
   await ensureInitialized();
   const db = await getDatabase();

   const fields: string[] = [];
   const values: any[] = [];

   if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
   }
   if (updates.amount !== undefined) {
      fields.push('amount = ?');
      values.push(updates.amount);
   }
   if (updates.streakCount !== undefined) {
      fields.push('streakCount = ?');
      values.push(updates.streakCount);
   }
   if (updates.frequency !== undefined) {
      fields.push('frequency = ?');
      values.push(updates.frequency);
   }
   if (updates.completed !== undefined) {
      fields.push('completed = ?');
      values.push(updates.completed ? 1 : 0);
   }
   if (updates.color !== undefined) {
      fields.push('color = ?');
      values.push(updates.color);
   }
   if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
   }
   if (updates.streak_count !== undefined) {
      fields.push('streak_count = ?');
      values.push(updates.streak_count);
   }
   if (updates.emoji !== undefined) {
      fields.push('emoji = ?');
      values.push(updates.emoji);
   }
   if (updates.time !== undefined) {
      fields.push('time = ?');
      values.push(updates.time);
   }
   if (updates.date !== undefined) {
      fields.push('date = ?');
      values.push(updates.date);
   }

   fields.push("updated_at = datetime('now')");
   values.push(id);

   await db.runAsync(
      `UPDATE habits SET ${fields.join(', ')} WHERE id = ?`,
      values
   );

   const updated = await getTaskById(id);
   if (!updated) {
      throw new Error('Failed to update task');
   }
   return updated;
};

export const deleteTask = async (id: string): Promise<void> => {
   await ensureInitialized();
   const db = await getDatabase();

   await db.runAsync('DELETE FROM habits WHERE id = ?', [id]);
};

export const getTasksByDate = async (date: string): Promise<Habit[]> => {
   await ensureInitialized();
   const db = await getDatabase();

   const result = await db.getAllAsync<any>(
      'SELECT * FROM habits WHERE date = ? ORDER BY created_at DESC',
      [date]
   );

   return result.map(rowToHabit);
};

export const toggleTaskCompletion = async (id: string): Promise<Habit> => {
   await ensureInitialized();
   const db = await getDatabase();

   // Buscar tarefa atual
   const task = await getTaskById(id);
   if (!task) {
      throw new Error('Task not found');
   }

   // Atualizar status
   return await updateTask(id, { completed: !task.completed });
};

import moment from 'moment';
import { getDatabase } from '../database/database';
import { Habit } from '../models/Habit';
import { scheduleHabitNotification } from './notificationService';

// Importar expo-notifications de forma segura
let Notifications: typeof import('expo-notifications') | null = null;
try {
   Notifications = require('expo-notifications');
} catch (error) {
   console.warn(
      'expo-notifications module not available. Please rebuild the app.'
   );
}

// Dados iniciais para popular o banco na primeira vez
const initialHabits: Omit<Habit, 'id'>[] = [];

// Converter resultado do banco para Habit
const rowToHabit = (row: any): Habit => ({
   id: row.id,
   title: row.title,
   amount: row.amount,
   streakCount: row.streakCount,
   frequency: row.frequency,
   completed: Boolean(row.completed),
   skipped: Boolean(row.skipped),
   skip_reason: row.skip_reason || '',
   skipped_at: row.skipped_at || '',
   color: row.color,
   description: row.description || '',
   streak_count: row.streak_count || '',
   emoji: row.emoji,
   time: row.time,
   date: row.date,
   period_type: row.period_type || undefined,
   period_config: row.period_config || undefined,
   notes: row.notes || undefined,
   end_date: row.end_date || undefined,
   notification_time: row.notification_time || undefined,
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
               color, description, streak_count, emoji, time, date,
               period_type, period_config
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
               habit.period_type || null,
               habit.period_config || null,
            ]
         );
      }
   }
};

// Função para gerar datas baseado no período
const generateHabitDates = (
   startDate: string,
   periodType: string | undefined,
   periodConfig: string | undefined,
   endDate: string | undefined
): string[] => {
   const start = moment(startDate);
   const end = endDate ? moment(endDate) : moment(startDate).add(3, 'months');
   const dates: string[] = [];

   if (!periodType || periodType === 'every_day') {
      // Every day: todos os dias até a data final
      let current = start.clone();
      while (current.isSameOrBefore(end, 'day')) {
         dates.push(current.format('YYYY-MM-DD'));
         current.add(1, 'day');
      }
   } else if (periodType === 'specific_days_week') {
      // Specific days of week: apenas nos dias da semana selecionados
      if (!periodConfig) return [startDate];
      const config = JSON.parse(periodConfig);
      const selectedDays = config.days || [];
      let current = start.clone();
      while (current.isSameOrBefore(end, 'day')) {
         const dayOfWeek = current.day();
         if (selectedDays.includes(dayOfWeek)) {
            dates.push(current.format('YYYY-MM-DD'));
         }
         current.add(1, 'day');
      }
   } else if (periodType === 'number_days_week') {
      // Number of days per week: X dias por semana
      if (!periodConfig) return [startDate];
      const config = JSON.parse(periodConfig);
      const numberDays = config.number || 3;
      let current = start.clone();

      while (current.isSameOrBefore(end, 'day')) {
         const weekStart = current.clone().startOf('week');
         const weekEnd = weekStart.clone().endOf('week');
         let daysThisWeek = 0;
         let temp = weekStart.clone();

         // Pegar os primeiros X dias da semana que estão no intervalo
         while (
            temp.isSameOrBefore(weekEnd, 'day') &&
            daysThisWeek < numberDays
         ) {
            if (
               temp.isSameOrAfter(start, 'day') &&
               temp.isSameOrBefore(end, 'day')
            ) {
               dates.push(temp.format('YYYY-MM-DD'));
               daysThisWeek++;
            }
            temp.add(1, 'day');
         }

         // Avançar para a próxima semana
         current = weekEnd.clone().add(1, 'day');
      }
   } else if (periodType === 'specific_days_month') {
      // Specific days of month: apenas nos dias do mês selecionados
      if (!periodConfig) return [startDate];
      const config = JSON.parse(periodConfig);
      const selectedDays = config.days || [];
      let current = start.clone();
      while (current.isSameOrBefore(end, 'day')) {
         const dayOfMonth = current.date();
         if (selectedDays.includes(dayOfMonth)) {
            dates.push(current.format('YYYY-MM-DD'));
         }
         current.add(1, 'day');
      }
   } else if (periodType === 'number_days_month') {
      // Number of days per month: X dias por mês
      if (!periodConfig) return [startDate];
      const config = JSON.parse(periodConfig);
      const numberDays = config.number || 10;
      let current = start.clone();

      while (current.isSameOrBefore(end, 'day')) {
         const monthStart = current.clone().startOf('month');
         const monthEnd = monthStart.clone().endOf('month');
         let daysThisMonth = 0;
         let temp = monthStart.clone();

         // Pegar os primeiros X dias do mês que estão no intervalo
         while (
            temp.isSameOrBefore(monthEnd, 'day') &&
            daysThisMonth < numberDays
         ) {
            if (
               temp.isSameOrAfter(start, 'day') &&
               temp.isSameOrBefore(end, 'day')
            ) {
               dates.push(temp.format('YYYY-MM-DD'));
               daysThisMonth++;
            }
            temp.add(1, 'day');
         }

         // Avançar para o próximo mês
         current = monthEnd.clone().add(1, 'day');
      }
   } else {
      // Fallback: apenas a data inicial
      return [startDate];
   }

   return dates;
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

   // Gerar datas baseado no período
   const dates = generateHabitDates(
      habit.date,
      habit.period_type,
      habit.period_config,
      habit.end_date
   );

   // Criar um hábito para cada data
   const createdHabits: Habit[] = [];
   for (const date of dates) {
      const id = `h${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      await db.runAsync(
         `INSERT INTO habits (
            id, title, amount, streakCount, frequency, completed, 
            color, description, streak_count, emoji, time, date,
            period_type, period_config, notes, end_date, notification_time
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
            date,
            habit.period_type || null,
            habit.period_config || null,
            habit.notes || null,
            habit.end_date || null,
            habit.notification_time || null,
         ]
      );

      const created = await getTaskById(id);
      if (created) {
         createdHabits.push(created);

         // Agendar notificação se houver horário configurado
         if (habit.notification_time && habit.notification_time.trim()) {
            await scheduleHabitNotification(
               created.id,
               created.title,
               date,
               habit.notification_time
            );
         }
      }
   }

   // Retornar o primeiro hábito criado (ou o único se não houver período)
   if (createdHabits.length === 0) {
      throw new Error('Failed to create task');
   }
   return createdHabits[0];
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
   if (updates.skipped !== undefined) {
      fields.push('skipped = ?');
      values.push(updates.skipped ? 1 : 0);
   }
   if (updates.skip_reason !== undefined) {
      fields.push('skip_reason = ?');
      values.push(updates.skip_reason);
   }
   if (updates.skipped_at !== undefined) {
      fields.push('skipped_at = ?');
      values.push(updates.skipped_at);
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
   if (updates.period_type !== undefined) {
      fields.push('period_type = ?');
      values.push(updates.period_type);
   }
   if (updates.period_config !== undefined) {
      fields.push('period_config = ?');
      values.push(updates.period_config);
   }
   if (updates.notes !== undefined) {
      fields.push('notes = ?');
      values.push(updates.notes);
   }
   if (updates.end_date !== undefined) {
      fields.push('end_date = ?');
      values.push(updates.end_date);
   }
   if (updates.notification_time !== undefined) {
      fields.push('notification_time = ?');
      values.push(updates.notification_time);
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

   // Se o horário de notificação foi alterado, reagendar notificações
   if (updates.notification_time !== undefined || updates.date !== undefined) {
      if (!Notifications) {
         console.warn('Notifications module not available');
      } else {
         try {
            // Cancelar notificações antigas para este hábito
            const scheduledNotifications =
               await Notifications.getAllScheduledNotificationsAsync();
            for (const notification of scheduledNotifications) {
               if (notification.content.data?.habitId === id) {
                  await Notifications.cancelScheduledNotificationAsync(
                     notification.identifier
                  );
               }
            }

            // Agendar nova notificação se houver horário configurado
            const notificationTime = updated.notification_time;
            if (notificationTime && notificationTime.trim()) {
               await scheduleHabitNotification(
                  updated.id,
                  updated.title,
                  updated.date,
                  notificationTime
               );
            }
         } catch (error) {
            console.error('Error rescheduling notification:', error);
            // Não falhar a atualização se houver erro ao reagendar notificação
         }
      }
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

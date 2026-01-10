export interface Habit {
   id: string;
   title: string;
   amount: string;
   streakCount: number;
   frequency: string;
   completed: boolean;
   skipped?: boolean;
   skip_reason?: string;
   skipped_at?: string;
   color: string;
   description: string;
   streak_count: string;
   emoji: string;
   time: string;
   date: string;
   period_type?: 'every_day' | 'specific_days_week' | 'number_days_week' | 'specific_days_month' | 'number_days_month';
   period_config?: string; // JSON string para armazenar configurações específicas
   notes?: string; // Campo de observações
   end_date?: string; // Data final do hábito
   notification_time?: string; // Horário da notificação (formato HH:mm)
}


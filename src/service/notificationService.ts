import moment from 'moment';
import { Habit } from '../models/Habit';

// Importar expo-notifications de forma segura
let Notifications: typeof import('expo-notifications') | null = null;
try {
   Notifications = require('expo-notifications');
   // Configurar como as notificações devem ser tratadas quando o app está em foreground
   if (Notifications) {
      Notifications.setNotificationHandler({
         handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
         }),
      });
   }
} catch (error) {
   console.warn('expo-notifications module not available. Please rebuild the app.');
}

// Solicitar permissões de notificação
export const requestNotificationPermissions = async (): Promise<boolean> => {
   if (!Notifications) {
      console.warn('Notifications module not available');
      return false;
   }

   try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
         const { status } = await Notifications.requestPermissionsAsync();
         finalStatus = status;
      }

      return finalStatus === 'granted';
   } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
   }
};

// Agendar notificação para um hábito específico
export const scheduleHabitNotification = async (
   habitId: string,
   title: string,
   date: string,
   notificationTime: string
): Promise<string | null> => {
   if (!Notifications) {
      console.warn('Notifications module not available');
      return null;
   }

   try {
      if (!notificationTime) {
         return null;
      }

      // Parse do horário (formato HH:mm)
      const [hours, minutes] = notificationTime.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) {
         console.error('Invalid notification time format:', notificationTime);
         return null;
      }

      // Criar data da notificação combinando a data do hábito com o horário
      const notificationDate = moment(date).set({ hour: hours, minute: minutes, second: 0 });

      // Se a data já passou, não agendar
      if (notificationDate.isBefore(moment())) {
         return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
         content: {
            title: 'Lembrete de Hábito',
            body: `Não esqueça: ${title}`,
            sound: true,
            data: { habitId, date },
         },
         trigger: notificationDate.toDate(),
      });

      return notificationId;
   } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
   }
};

// Cancelar notificação
export const cancelNotification = async (notificationId: string): Promise<void> => {
   if (!Notifications) {
      return;
   }

   try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
   } catch (error) {
      console.error('Error canceling notification:', error);
   }
};

// Agendar notificações para todos os hábitos do dia atual
export const scheduleTodayNotifications = async (habits: Habit[]): Promise<void> => {
   try {
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
         console.log('Notification permissions not granted');
         return;
      }

      const today = moment().format('YYYY-MM-DD');

      // Filtrar hábitos do dia atual que têm horário de notificação
      const todayHabits = habits.filter(
         (habit) =>
            habit.date === today &&
            habit.notification_time &&
            habit.notification_time.trim() &&
            !habit.completed
      );

      // Agendar notificação para cada hábito
      for (const habit of todayHabits) {
         if (habit.notification_time) {
            await scheduleHabitNotification(
               habit.id,
               habit.title,
               habit.date,
               habit.notification_time
            );
         }
      }
   } catch (error) {
      console.error('Error scheduling today notifications:', error);
   }
};

// Verificar e agendar notificações pendentes
export const checkAndScheduleNotifications = async (habits: Habit[]): Promise<void> => {
   try {
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
         return;
      }

      const today = moment().format('YYYY-MM-DD');

      // Buscar hábitos do dia atual com notificação configurada
      const habitsToNotify = habits.filter(
         (habit) =>
            habit.date === today &&
            habit.notification_time &&
            habit.notification_time.trim() &&
            !habit.completed
      );

      if (!Notifications) {
         return;
      }

      // Verificar notificações já agendadas
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const scheduledHabitIds = new Set(
         scheduledNotifications
            .map((n) => n.content.data?.habitId)
            .filter((id): id is string => Boolean(id))
      );

      // Agendar apenas para hábitos que ainda não têm notificação agendada
      for (const habit of habitsToNotify) {
         if (!scheduledHabitIds.has(habit.id) && habit.notification_time) {
            await scheduleHabitNotification(
               habit.id,
               habit.title,
               habit.date,
               habit.notification_time
            );
         }
      }
   } catch (error) {
      console.error('Error checking and scheduling notifications:', error);
   }
};


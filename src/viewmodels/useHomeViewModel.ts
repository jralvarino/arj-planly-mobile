import * as Haptics from 'expo-haptics';
import { useNavigation } from 'expo-router';
import moment from 'moment';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Habit } from '../models/Habit';
import { getAllTasks, toggleTaskCompletion } from '../service/taskService';
import { headerTitleComponent } from '../utils/dateUtils';

export function useHomeViewModel() {
   const [habits, setHabits] = useState<Habit[]>([]);
   const [loading, setLoading] = useState(true);
   const navigation = useNavigation();
   const [week, setWeek] = useState(0);
   const [value, setValue] = useState(new Date());
   const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

   const categories = useMemo(() => ['English', 'Health', 'Home'], []);

   // Carregar hábitos do banco de dados
   useEffect(() => {
      const loadHabits = async () => {
         try {
            const tasks = await getAllTasks();
            setHabits(tasks);
         } catch (error) {
            console.error('Error loading habits:', error);
         } finally {
            setLoading(false);
         }
      };
      loadHabits();
   }, []);

   const toggleHabit = useCallback(
      async (id: string) => {
         const habit = habits.find((h) => h.id === id);
         if (habit && !habit.completed) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
         }

         try {
            // Atualizar no banco de dados
            const updated = await toggleTaskCompletion(id);

            // Atualizar estado local
            setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
         } catch (error) {
            console.error('Error toggling habit:', error);
         }
      },
      [habits]
   );

   const selectDate = useCallback(
      (date: Date) => {
         setValue(date);
         navigation.setOptions({
            headerTitle: headerTitleComponent(
               moment(date).format('YYYY-MM-DD')
            ),
         });
      },
      [navigation]
   );

   const changeWeek = useCallback((index: number) => {
      setValue((prevValue) => moment(prevValue).add(index, 'week').toDate());
      setTimeout(() => {
         setWeek((w) => w + index);
      }, 10);
   }, []);

   const changeDay = useCallback(
      (index: number) => {
         setValue((prevValue) => {
            const nextValue = moment(prevValue).add(index, 'days').toDate();
            navigation.setOptions({
               headerTitle: headerTitleComponent(
                  moment(nextValue).format('YYYY-MM-DD')
               ),
            });
            return nextValue;
         });
      },
      [navigation]
   );

   const changeWeekFromDays = useCallback((delta: number) => {
      setWeek((w) => w + delta);
   }, []);

   const setFilter = useCallback((category: string | null) => {
      setSelectedFilter(category);
   }, []);

   return {
      // State
      habits,
      loading,
      week,
      value,
      selectedFilter,
      categories,
      // Actions
      toggleHabit,
      selectDate,
      changeWeek,
      changeDay,
      changeWeekFromDays,
      setFilter,
      // Refresh
      refreshHabits: async () => {
         try {
            const tasks = await getAllTasks();
            setHabits(tasks);
         } catch (error) {
            console.error('Error refreshing habits:', error);
         }
      },
   };
}

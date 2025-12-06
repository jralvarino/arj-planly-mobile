import moment from 'moment';
import React, { useRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Swiper from 'react-native-swiper';
import { Habit } from '../models/Habit';
import EmptyState from './EmptyState';
import HabitCard from './HabitCard';

interface HabitsListProps {
   value: Date;
   habits: Habit[];
   selectedFilter: string | null;
   onToggle: (id: string) => void;
   onDayChange: (index: number) => void;
   onWeekChange: (delta: number) => void;
}

export default function HabitsList({
   value,
   habits,
   selectedFilter,
   onToggle,
   onDayChange,
   onWeekChange,
}: HabitsListProps) {
   const contentSwiper = useRef<any>(null);

   const days = React.useMemo(() => {
      return [
         moment(value).subtract(1, 'day').toDate(),
         value,
         moment(value).add(1, 'day').toDate(),
      ];
   }, [value]);

   return (
      <Swiper
         index={1}
         ref={contentSwiper}
         loop={false}
         showsPagination={false}
         onIndexChanged={(ind) => {
            if (ind === 1) return;
            setTimeout(() => {
               const nextValue = moment(value).add(ind - 1, 'days');
               if (moment(value).week() !== nextValue.week()) {
                  const delta = moment(value).isBefore(nextValue) ? 1 : -1;
                  onWeekChange(delta);
               }
               onDayChange(ind - 1);
               contentSwiper.current?.scrollTo(1, false);
            }, 10);
         }}
      >
         {days.map((day, index) => {
            const dayString = moment(day).format('YYYY-MM-DD');
            const dayHabits = habits
               .filter((h) => h.date === dayString)
               .filter(
                  (h) => !selectedFilter || h.frequency === selectedFilter
               );

            return (
               <View key={index} style={styles.page}>
                  <ScrollView
                     showsVerticalScrollIndicator={false}
                     contentContainerStyle={
                        dayHabits.length === 0 ? styles.emptyContainer : undefined
                     }
                  >
                     {dayHabits.length === 0 ? (
                        <EmptyState
                           message="Nenhum hábito para este dia!"
                           icon="calendar-blank-outline"
                        />
                     ) : (
                        dayHabits.map((habit) => (
                           <HabitCard
                              key={habit.id}
                              habit={habit}
                              onToggle={onToggle}
                           />
                        ))
                     )}
                  </ScrollView>
               </View>
            );
         })}
      </Swiper>
   );
}

const styles = StyleSheet.create({
   page: {
      flex: 1,
      paddingHorizontal: 8,
      paddingVertical: 18,
   },
   emptyContainer: {
      flexGrow: 1,
   },
});


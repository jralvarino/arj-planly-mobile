import { useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import CalendarWeekView from '../../components/CalendarWeekView';
import CategoryFilters from '../../components/CategoryFilters';
import HabitsList from '../../components/HabitsList';
import { useHomeViewModel } from '../../viewmodels/useHomeViewModel';

export default function HomeScreen() {
   const {
      habits,
      week,
      value,
      selectedFilter,
      categories,
      toggleHabit,
      selectDate,
      changeWeek,
      changeDay,
      changeWeekFromDays,
      setFilter,
      refreshHabits,
   } = useHomeViewModel();

   // Recarregar hábitos quando a tela receber foco (ex: após criar novo hábito)
   useFocusEffect(
      useCallback(() => {
         refreshHabits();
      }, [refreshHabits])
   );

   return (
      <SafeAreaView style={{ flex: 1 }}>
         <View style={styles.container}>
            <CalendarWeekView
               week={week}
               value={value}
               habits={habits}
               onDateSelect={selectDate}
               onWeekChange={changeWeek}
            />

            <CategoryFilters
               categories={categories}
               selectedFilter={selectedFilter}
               onFilterChange={setFilter}
            />

            <HabitsList
               value={value}
               habits={habits}
               selectedFilter={selectedFilter}
               onToggle={toggleHabit}
               onDayChange={changeDay}
               onWeekChange={changeWeekFromDays}
            />
         </View>
      </SafeAreaView>
   );
}
const styles = StyleSheet.create({
   container: {
      flex: 1,
      paddingVertical: 1,
      backgroundColor: 'white',
   },
});

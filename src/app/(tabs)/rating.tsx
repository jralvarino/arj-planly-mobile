import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import moment from 'moment';
import React, { useCallback, useMemo, useState } from 'react';
import {
   Dimensions,
   Platform,
   ScrollView,
   StyleSheet,
   TouchableOpacity,
   View,
} from 'react-native';
import { Text } from 'react-native-paper';
import CategoryFilters from '../../components/CategoryFilters';
import CircularProgress from '../../components/CircularProgress';
import { Habit } from '../../models/Habit';
import { getAllCategories } from '../../service/categoryService';
import { getAllTasks } from '../../service/taskService';
import { colors } from '../../theme/colors';
import { getCalendarColorByHabits } from '../../utils/colorUtils';

const { width } = Dimensions.get('window');
const DAYS_IN_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function RatingScreen() {
   const [habits, setHabits] = useState<Habit[]>([]);
   const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
   const [currentMonth, setCurrentMonth] = useState(moment());
   const [categories, setCategories] = useState<string[]>(['Todas']);
   const [selectedDate, setSelectedDate] = useState(
      moment().format('YYYY-MM-DD')
   );

   // Carregar categorias e hábitos
   useFocusEffect(
      useCallback(() => {
         const loadData = async () => {
            try {
               const [tasks, cats] = await Promise.all([
                  getAllTasks(),
                  getAllCategories(),
               ]);
               setHabits(tasks);
               setCategories(['Todas', ...cats.map((c) => c.name)]);
            } catch (error) {
               console.error('Error loading data:', error);
            }
         };
         loadData();
      }, [])
   );

   // Filtrar hábitos por categoria
   const filteredHabits = useMemo(() => {
      if (!selectedFilter || selectedFilter === 'Todas') {
         return habits;
      }
      return habits.filter((h) => h.frequency === selectedFilter);
   }, [habits, selectedFilter]);

   // Obter todos os dias do mês atual
   const monthDays = useMemo(() => {
      const start = currentMonth.clone().startOf('month');
      const end = currentMonth.clone().endOf('month');
      const days: Array<{ date: moment.Moment; isCurrentMonth: boolean }> = [];

      // Adicionar dias do mês anterior para completar a primeira semana
      const firstDayOfWeek = start.day();
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
         days.push({
            date: start.clone().subtract(i + 1, 'days'),
            isCurrentMonth: false,
         });
      }

      // Adicionar todos os dias do mês atual
      let current = start.clone();
      while (current.isSameOrBefore(end, 'day')) {
         days.push({ date: current.clone(), isCurrentMonth: true });
         current.add(1, 'day');
      }

      // Adicionar dias do próximo mês para completar a última semana
      const lastDayOfWeek = end.day();
      const daysToAdd = 6 - lastDayOfWeek;
      for (let i = 1; i <= daysToAdd; i++) {
         days.push({
            date: end.clone().add(i, 'days'),
            isCurrentMonth: false,
         });
      }

      return days;
   }, [currentMonth]);

   // Verificar se um dia está completo
   const isDayComplete = useCallback(
      (date: moment.Moment) => {
         const dateStr = date.format('YYYY-MM-DD');
         const habitsOfDay = filteredHabits.filter(
            (h) => moment(h.date).format('YYYY-MM-DD') === dateStr
         );

         if (habitsOfDay.length === 0) return false;

         // Se há filtro de categoria específica, verificar se todos os hábitos daquela categoria estão completos
         if (selectedFilter && selectedFilter !== 'Todas') {
            return habitsOfDay.every((h) => h.completed);
         }

         // Se não há filtro (ou "Todas"), verificar se todos os hábitos do dia estão completos
         // Isso significa que todas as categorias presentes no dia devem estar completas
         return habitsOfDay.every((h) => h.completed);
      },
      [filteredHabits, selectedFilter]
   );

   // Obter cor do dia
   const getDayColor = useCallback(
      (date: moment.Moment) => {
         const dateStr = date.format('YYYY-MM-DD');
         const habitsOfDay = filteredHabits.filter(
            (h) => moment(h.date).format('YYYY-MM-DD') === dateStr
         );

         if (habitsOfDay.length === 0) return 'white';

         const completed = habitsOfDay.filter((h) => h.completed).length;
         const total = habitsOfDay.length;

         return getCalendarColorByHabits('#F4E9FF', completed, total);
      },
      [filteredHabits]
   );

   // Calcular métricas
   const metrics = useMemo(() => {
      const now = moment();
      const monthStart = now.clone().startOf('month');
      const monthEnd = now.clone().endOf('month');

      // Filtrar hábitos do mês atual
      const monthHabits = filteredHabits.filter((h) => {
         const habitDate = moment(h.date);
         return (
            habitDate.isSameOrAfter(monthStart, 'day') &&
            habitDate.isSameOrBefore(monthEnd, 'day')
         );
      });

      // Monthly Rate: porcentagem de hábitos completados no mês
      const totalHabits = monthHabits.length;
      const completedHabits = monthHabits.filter((h) => h.completed).length;
      const monthlyRate =
         totalHabits > 0
            ? Math.round((completedHabits / totalHabits) * 100)
            : 0;

      // Streaks: dias consecutivos completados (até hoje, contando apenas dias com hábitos)
      let currentStreak = 0;
      let checkDate = now.clone();
      let foundFirstDay = false;

      while (checkDate.isSameOrAfter(monthStart, 'day')) {
         const dateStr = checkDate.format('YYYY-MM-DD');
         const habitsOfDay = filteredHabits.filter(
            (h) => moment(h.date).format('YYYY-MM-DD') === dateStr
         );

         if (habitsOfDay.length === 0) {
            // Se não há hábitos no dia e já encontramos pelo menos um dia, quebra o streak
            if (foundFirstDay) {
               break;
            }
            // Se ainda não encontramos o primeiro dia, continua procurando
            checkDate.subtract(1, 'day');
            continue;
         }

         foundFirstDay = true;
         // Verificar se todos os hábitos do dia estão completos
         const allComplete = habitsOfDay.every((h) => h.completed);
         if (allComplete) {
            currentStreak++;
            checkDate.subtract(1, 'day');
         } else {
            break;
         }
      }

      // Perfect Days: dias onde todos os hábitos foram completados
      let perfectDays = 0;
      let checkDate2 = monthStart.clone();
      while (checkDate2.isSameOrBefore(monthEnd, 'day')) {
         const dateStr = checkDate2.format('YYYY-MM-DD');
         const habitsOfDay = filteredHabits.filter(
            (h) => moment(h.date).format('YYYY-MM-DD') === dateStr
         );

         if (habitsOfDay.length > 0) {
            const allComplete = habitsOfDay.every((h) => h.completed);
            if (allComplete) {
               perfectDays++;
            }
         }
         checkDate2.add(1, 'day');
      }

      // Habits Done: total de hábitos completados no mês
      const habitsDone = completedHabits;

      // Daily Average: média de hábitos completados por dia
      const daysWithHabits = new Set(
         monthHabits.map((h) => moment(h.date).format('YYYY-MM-DD'))
      ).size;
      const dailyAverage =
         daysWithHabits > 0
            ? (completedHabits / daysWithHabits).toFixed(1)
            : '0.0';

      // Totais: completos, missed e skipped
      const totalCompleted = completedHabits;
      const totalSkipped = monthHabits.filter((h) => h.skipped).length;
      const totalMissed = monthHabits.filter(
         (h) => !h.completed && !h.skipped
      ).length;

      return {
         monthlyRate,
         currentStreak,
         perfectDays,
         habitsDone,
         dailyAverage,
         totalCompleted,
         totalSkipped,
         totalMissed,
      };
   }, [filteredHabits]);

   const navigateMonth = (direction: 'prev' | 'next') => {
      setCurrentMonth((prev) =>
         direction === 'prev'
            ? prev.clone().subtract(1, 'month')
            : prev.clone().add(1, 'month')
      );
   };

   return (
      <ScrollView
         style={styles.container}
         contentContainerStyle={styles.scrollContent}
         showsVerticalScrollIndicator={false}
      >
         <View style={styles.content}>
            {/* Categoria Filters */}
            <View style={styles.section}>
               <CategoryFilters
                  categories={categories}
                  selectedFilter={selectedFilter}
                  onFilterChange={setSelectedFilter}
               />
            </View>

            {/* Calendário Mensal */}
            <View style={styles.section}>
               <View style={styles.calendarCard}>
                  <View style={styles.calendarHeader}>
                     <TouchableOpacity
                        onPress={() => navigateMonth('prev')}
                        style={styles.monthNavButton}
                     >
                        <MaterialCommunityIcons
                           name="chevron-left"
                           size={24}
                           color={colors.primary}
                        />
                     </TouchableOpacity>
                     <Text style={styles.monthTitle}>
                        {currentMonth.format('MMMM YYYY')}
                     </Text>
                     <TouchableOpacity
                        onPress={() => navigateMonth('next')}
                        style={styles.monthNavButton}
                     >
                        <MaterialCommunityIcons
                           name="chevron-right"
                           size={24}
                           color={colors.primary}
                        />
                     </TouchableOpacity>
                  </View>

                  {/* Dias da semana */}
                  <View style={styles.weekDaysRow}>
                     {DAYS_IN_WEEK.map((day) => (
                        <View key={day} style={styles.weekDayHeader}>
                           <Text style={styles.weekDayText}>{day}</Text>
                        </View>
                     ))}
                  </View>

                  {/* Grid de dias */}
                  <View style={styles.calendarGrid}>
                     {monthDays.map((day, index) => {
                        const isComplete = isDayComplete(day.date);
                        const dayColor = getDayColor(day.date);
                        const isToday = day.date.isSame(moment(), 'day');

                        const dayString = day.date.format('YYYY-MM-DD');
                        const isSelected = dayString === selectedDate;

                        return (
                           <TouchableOpacity
                              key={index}
                              onPress={() => setSelectedDate(dayString)}
                              style={[
                                 styles.calendarDay,
                                 !day.isCurrentMonth &&
                                    styles.calendarDayOtherMonth,
                              ]}
                           >
                              {isComplete && (
                                 <MaterialCommunityIcons
                                    name="trophy"
                                    size={12}
                                    color="orange"
                                    style={styles.trophyIcon}
                                 />
                              )}
                              <View
                                 style={[
                                    styles.dayContent,
                                    {
                                       backgroundColor: dayColor,
                                       borderColor: isSelected
                                          ? colors.primary
                                          : isComplete
                                            ? colors.primary
                                            : colors.gray[200],
                                       borderWidth:
                                          isSelected || isComplete ? 2 : 1,
                                    },
                                 ]}
                              >
                                 <Text
                                    style={[
                                       styles.dayNumber,
                                       !day.isCurrentMonth &&
                                          styles.dayNumberOtherMonth,
                                       isComplete && styles.dayNumberComplete,
                                    ]}
                                 >
                                    {day.date.date()}
                                 </Text>
                              </View>
                              {isToday && (
                                 <View style={styles.todayIndicator} />
                              )}
                           </TouchableOpacity>
                        );
                     })}
                  </View>
               </View>
            </View>

            {/* Métricas */}
            <View style={styles.metricsContainer}>
               <View style={styles.metricsRow}>
                  <View style={styles.metricCard}>
                     <View style={styles.circularProgressContainer}>
                        <CircularProgress
                           percentage={metrics.monthlyRate}
                           size={100}
                           strokeWidth={8}
                           showLabel={true}
                        />
                     </View>
                     <Text style={styles.metricLabel}>Monthly Rate</Text>
                  </View>
                  <View style={styles.metricCard}>
                     <MaterialCommunityIcons
                        name="fire"
                        size={40}
                        color={colors.primary}
                        style={styles.metricIcon}
                     />
                     <Text style={styles.metricValue}>
                        {metrics.currentStreak}
                     </Text>
                     <Text style={styles.metricLabel}>Streaks</Text>
                  </View>
               </View>

               <View style={styles.metricsRow}>
                  <View style={styles.metricCard}>
                     <MaterialCommunityIcons
                        name="trophy"
                        size={40}
                        color={colors.primary}
                        style={styles.metricIcon}
                     />
                     <Text style={styles.metricValue}>
                        {metrics.perfectDays}
                     </Text>
                     <Text style={styles.metricLabel}>Perfect Days</Text>
                  </View>
                  <View style={styles.metricCard}>
                     <MaterialCommunityIcons
                        name="check-circle"
                        size={40}
                        color={colors.primary}
                        style={styles.metricIcon}
                     />
                     <Text style={styles.metricValue}>
                        {metrics.habitsDone}
                     </Text>
                     <Text style={styles.metricLabel}>Habits Done</Text>
                  </View>
               </View>

               <View style={styles.metricsRow}>
                  <View style={[styles.metricCard, styles.metricCardFull]}>
                     <View style={styles.dailyAverageSection}>
                        <MaterialCommunityIcons
                           name="chart-line"
                           size={40}
                           color={colors.primary}
                           style={styles.metricIcon}
                        />
                        <Text style={styles.metricValue}>
                           {metrics.dailyAverage}
                        </Text>
                        <Text style={styles.metricLabel}>Daily Average</Text>
                     </View>
                     <View style={styles.totalsContainer}>
                        <View style={styles.totalItem}>
                           <View style={styles.totalBadgeDone}>
                              <Text style={styles.totalBadgeText}>
                                 {metrics.totalCompleted}
                              </Text>
                           </View>
                           <Text style={styles.totalLabel}>Done</Text>
                        </View>
                        <View style={styles.totalItem}>
                           <View style={styles.totalBadgeMissed}>
                              <Text style={styles.totalBadgeText}>
                                 {metrics.totalMissed}
                              </Text>
                           </View>
                           <Text style={styles.totalLabel}>Missed</Text>
                        </View>
                        <View style={styles.totalItem}>
                           <View style={styles.totalBadgeSkipped}>
                              <Text
                                 style={[
                                    styles.totalBadgeText,
                                    styles.totalBadgeTextDark,
                                 ]}
                              >
                                 {metrics.totalSkipped}
                              </Text>
                           </View>
                           <Text style={styles.totalLabel}>Skipped</Text>
                        </View>
                     </View>
                  </View>
               </View>
            </View>

            {/* Hábitos do Dia Selecionado */}
            <View style={styles.section}>
               <View style={styles.habitsCard}>
                  <Text style={styles.habitsSectionTitle}>
                     Hábitos do dia {moment(selectedDate).format('DD/MM/YYYY')}
                  </Text>
                  {(() => {
                     const dayHabits = filteredHabits.filter(
                        (h) =>
                           moment(h.date).format('YYYY-MM-DD') === selectedDate
                     );

                     if (dayHabits.length === 0) {
                        return (
                           <View style={styles.emptyHabitsContainer}>
                              <MaterialCommunityIcons
                                 name="calendar-blank-outline"
                                 size={48}
                                 color={colors.gray[300]}
                              />
                              <Text style={styles.emptyHabitsText}>
                                 Nenhum hábito para este dia
                              </Text>
                           </View>
                        );
                     }

                     return (
                        <View style={styles.habitsList}>
                           {dayHabits.map((habit) => {
                              let statusTag = null;
                              if (habit.completed) {
                                 statusTag = (
                                    <View style={styles.statusTagDone}>
                                       <Text style={styles.statusTagTextDone}>
                                          Done
                                       </Text>
                                    </View>
                                 );
                              } else if (habit.skipped) {
                                 statusTag = (
                                    <View style={styles.statusTagSkipped}>
                                       <Text
                                          style={styles.statusTagTextSkipped}
                                       >
                                          Skipped
                                       </Text>
                                    </View>
                                 );
                              } else {
                                 statusTag = (
                                    <View style={styles.statusTagMissed}>
                                       <Text style={styles.statusTagTextMissed}>
                                          Missed
                                       </Text>
                                    </View>
                                 );
                              }

                              return (
                                 <View key={habit.id} style={styles.habitItem}>
                                    <View
                                       style={[
                                          styles.habitColorIndicator,
                                          { backgroundColor: habit.color },
                                       ]}
                                    />
                                    <View style={styles.habitInfo}>
                                       <View style={styles.habitHeader}>
                                          <Text style={styles.habitTitle}>
                                             {habit.title}
                                          </Text>
                                          {statusTag}
                                       </View>
                                       {habit.amount && (
                                          <Text style={styles.habitAmount}>
                                             {habit.amount}
                                          </Text>
                                       )}
                                       {habit.notes && (
                                          <View
                                             style={styles.habitNotesContainer}
                                          >
                                             <MaterialCommunityIcons
                                                name="note-text-outline"
                                                size={14}
                                                color={colors.primary}
                                             />
                                             <Text style={styles.habitNotes}>
                                                {habit.notes}
                                             </Text>
                                          </View>
                                       )}
                                    </View>
                                 </View>
                              );
                           })}
                        </View>
                     );
                  })()}
               </View>
            </View>
         </View>
      </ScrollView>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: colors.background,
   },
   scrollContent: {
      paddingBottom: 100, // Espaço para o botão de adicionar na tab bar
   },
   content: {
      padding: 16,
   },
   section: {
      marginBottom: 24,
   },
   calendarCard: {
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 16,
      ...Platform.select({
         ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
         },
         android: {
            elevation: 4,
         },
      }),
   },
   calendarHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
      paddingHorizontal: 8,
   },
   monthNavButton: {
      padding: 8,
   },
   monthTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text.title,
      textTransform: 'capitalize',
   },
   weekDaysRow: {
      flexDirection: 'row',
      marginBottom: 8,
   },
   weekDayHeader: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 8,
   },
   weekDayText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text.body,
   },
   calendarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
   },
   calendarDay: {
      width: width / 7 - 12,
      aspectRatio: 1,
      padding: 6,
      position: 'relative',
   },
   calendarDayOtherMonth: {
      opacity: 0.3,
   },
   dayContent: {
      flex: 1,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
   },
   trophyIcon: {
      position: 'absolute',
      top: -2,
      alignSelf: 'center',
      zIndex: 10,
      elevation: 5,
   },
   todayIndicator: {
      position: 'absolute',
      bottom: 2,
      alignSelf: 'center',
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#ff4444',
   },
   dayNumber: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.title,
   },
   dayNumberOtherMonth: {
      color: colors.gray[300],
   },
   dayNumberComplete: {
      color: 'white',
   },
   metricsContainer: {
      marginTop: 8,
   },
   metricsRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 12,
   },
   metricCard: {
      flex: 1,
      backgroundColor: colors.gray[100],
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
   },
   metricCardFull: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
   },
   dailyAverageSection: {
      flex: 1,
      alignItems: 'center',
   },
   circularProgressContainer: {
      marginBottom: 8,
   },
   metricIcon: {
      marginBottom: 8,
   },
   metricValue: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.primary,
      marginBottom: 4,
   },
   metricLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text.body,
      textTransform: 'uppercase',
   },
   habitsCard: {
      backgroundColor: colors.gray[100],
      borderRadius: 12,
      padding: 16,
   },
   habitsSectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.title,
      marginBottom: 16,
   },
   habitsList: {
      gap: 12,
   },
   habitItem: {
      flexDirection: 'row',
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 12,
      alignItems: 'flex-start',
   },
   habitColorIndicator: {
      width: 4,
      borderRadius: 2,
      marginRight: 12,
      alignSelf: 'stretch',
   },
   habitInfo: {
      flex: 1,
   },
   habitHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
   },
   habitTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.title,
      flex: 1,
   },
   habitAmount: {
      fontSize: 14,
      color: colors.text.body,
      marginTop: 4,
   },
   habitNotesContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: 8,
      padding: 8,
      backgroundColor: colors.gray[100],
      borderRadius: 6,
      gap: 6,
   },
   habitNotes: {
      fontSize: 12,
      color: colors.text.body,
      flex: 1,
      lineHeight: 16,
   },
   emptyHabitsContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 32,
   },
   emptyHabitsText: {
      fontSize: 14,
      color: colors.text.body,
      marginTop: 12,
   },
   statusTagDone: {
      backgroundColor: '#4CAF50',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
   },
   statusTagTextDone: {
      fontSize: 11,
      fontWeight: '600',
      color: 'white',
      textTransform: 'uppercase',
   },
   statusTagSkipped: {
      backgroundColor: '#FFC107',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
   },
   statusTagTextSkipped: {
      fontSize: 11,
      fontWeight: '600',
      color: '#333',
      textTransform: 'uppercase',
   },
   statusTagMissed: {
      backgroundColor: '#F44336',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
   },
   statusTagTextMissed: {
      fontSize: 11,
      fontWeight: '600',
      color: 'white',
      textTransform: 'uppercase',
   },
   totalsContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
   },
   totalItem: {
      alignItems: 'center',
      gap: 6,
   },
   totalBadgeDone: {
      backgroundColor: '#4CAF50',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      minWidth: 40,
      alignItems: 'center',
   },
   totalBadgeMissed: {
      backgroundColor: '#F44336',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      minWidth: 40,
      alignItems: 'center',
   },
   totalBadgeSkipped: {
      backgroundColor: '#FFC107',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      minWidth: 40,
      alignItems: 'center',
   },
   totalBadgeText: {
      fontSize: 16,
      fontWeight: '700',
      color: 'white',
   },
   totalBadgeTextDark: {
      color: '#333',
   },
   totalLabel: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.text.body,
      textTransform: 'uppercase',
   },
});

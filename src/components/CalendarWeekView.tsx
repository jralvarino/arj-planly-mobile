import { MaterialCommunityIcons } from '@expo/vector-icons';
import moment from 'moment';
import React, { useRef } from 'react';
import {
   Dimensions,
   StyleSheet,
   TouchableWithoutFeedback,
   View,
} from 'react-native';
import { Text } from 'react-native-paper';
import Swiper from 'react-native-swiper';
import { Habit } from '../models/Habit';
import { getCalendarColorByHabits } from '../utils/colorUtils';

const { width } = Dimensions.get('window');

interface CalendarWeekViewProps {
   week: number;
   value: Date;
   habits: Habit[];
   onDateSelect: (date: Date) => void;
   onWeekChange: (index: number) => void;
}

export default function CalendarWeekView({
   week,
   value,
   habits,
   onDateSelect,
   onWeekChange,
}: CalendarWeekViewProps) {
   const swiper = useRef<any>(null);

   const weeks = React.useMemo(() => {
      const start = moment().add(week, 'weeks').startOf('week');
      return [-1, 0, 1].map((adj) =>
         Array.from({ length: 7 }).map((_, index) => {
            const date = moment(start).add(adj, 'week').add(index, 'day');
            return { weekday: date.format('ddd'), date: date.toDate() };
         })
      );
   }, [week]);

   const isDayComplete = (date: Date) => {
      const selectedDay = moment(date).format('YYYY-MM-DD');
      const habitsOfDay = habits.filter(
         (h) => moment(h.date).format('YYYY-MM-DD') === selectedDay
      );
      if (habitsOfDay.length === 0) return false;
      return habitsOfDay.every((h) => h.completed);
   };

   const isToday = (day: Date) => moment(day).isSame(moment(), 'day');

   const getDayColor = (date: Date) => {
      const selectedDay = moment(date).format('YYYY-MM-DD');
      const habitsOfDay = habits.filter(
         (h) => moment(h.date).format('YYYY-MM-DD') === selectedDay
      );
      const habitsCompletedToday = habitsOfDay.filter(
         (h) => h.completed === true
      );

      const colorOfTheDay = getCalendarColorByHabits(
         '#F4E9FF',
         habitsCompletedToday.length,
         habitsOfDay.length
      );

      return colorOfTheDay;
   };

   return (
      <View style={styles.picker}>
         <Swiper
            index={1}
            ref={swiper}
            loop={false}
            showsPagination={false}
            onIndexChanged={(ind) => {
               if (ind === 1) return;
               const index = ind - 1;
               onWeekChange(index);
               setTimeout(() => {
                  swiper.current?.scrollTo(1, false);
               }, 10);
            }}
         >
            {weeks.map((dates, index) => (
               <View style={styles.itemRow} key={index}>
                  {dates.map((item, dateIndex) => {
                     const isActive =
                        value.toDateString() === item.date.toDateString();
                     return (
                        <TouchableWithoutFeedback
                           key={dateIndex}
                           onPress={() => onDateSelect(item.date)}
                        >
                           <View style={styles.itemContainer}>
                              <View
                                 style={[
                                    styles.item,
                                    {
                                       backgroundColor: getDayColor(item.date),
                                       borderColor: isActive
                                          ? '#59008c'
                                          : isDayComplete(item.date)
                                            ? '#59008c'
                                            : 'lightgrey',
                                    },
                                 ]}
                              >
                                 {isDayComplete(item.date) && (
                                    <MaterialCommunityIcons
                                       name="crown"
                                       size={10}
                                       color="yellow"
                                       style={{
                                          position: 'absolute',
                                          top: 0,
                                          right: 1,
                                       }}
                                    />
                                 )}

                                 <Text
                                    style={[
                                       styles.itemWeekday,
                                       {
                                          color: isDayComplete(item.date)
                                             ? 'white'
                                             : 'black',
                                       },
                                    ]}
                                 >
                                    {item.weekday}
                                 </Text>

                                 <Text
                                    style={[
                                       styles.itemDate,
                                       {
                                          color: isDayComplete(item.date)
                                             ? 'white'
                                             : 'black',
                                       },
                                    ]}
                                 >
                                    {item.date.getDate()}
                                 </Text>
                              </View>
                              {isToday(item.date) && (
                                 <View style={styles.todayIndicator} />
                              )}
                           </View>
                        </TouchableWithoutFeedback>
                     );
                  })}
               </View>
            ))}
         </Swiper>
      </View>
   );
}

const styles = StyleSheet.create({
   picker: {
      flex: 1,
      maxHeight: 74,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
   },
   itemContainer: {
      position: 'relative',
      width: (width - 56) / 7, // (largura total - padding horizontal - margens) / 7 dias
      alignItems: 'center',
      height: 50,
   },
   item: {
      position: 'relative',
      width: '100%',
      height: 50,
      paddingVertical: 6,
      paddingHorizontal: 4,
      borderWidth: 1,
      borderRadius: 8,
      borderColor: '#e3e3e3',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
   },
   todayIndicator: {
      position: 'absolute',
      bottom: -2,
      alignSelf: 'center',
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#ff4444',
   },
   itemRow: {
      width: width,
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      paddingHorizontal: 3,
      gap: 4,
   },
   itemWeekday: {
      fontSize: 13,
      fontWeight: '500',
      color: '#737373',
      marginBottom: 4,
   },
   itemDate: {
      fontSize: 15,
      fontWeight: '600',
      color: '#111',
   },
});

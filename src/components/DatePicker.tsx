import { MaterialCommunityIcons } from '@expo/vector-icons';
import moment from 'moment';
import React, { useState } from 'react';
import {
   Modal,
   Pressable,
   ScrollView,
   StyleSheet,
   TouchableOpacity,
   View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../theme/colors';

interface DatePickerProps {
   value: string; // formato YYYY-MM-DD
   onChange: (date: string) => void;
   placeholder?: string;
   minimumDate?: string; // formato YYYY-MM-DD
   maximumDate?: string; // formato YYYY-MM-DD
}

export default function DatePicker({
   value,
   onChange,
   placeholder = 'Selecione a data',
   minimumDate,
   maximumDate,
}: DatePickerProps) {
   const [modalVisible, setModalVisible] = useState(false);
   const [selectedMonth, setSelectedMonth] = useState(
      value ? moment(value) : moment()
   );
   const [selectedDay, setSelectedDay] = useState<number | null>(
      value ? moment(value).date() : null
   );

   const currentMonth = selectedMonth.clone();
   const startOfMonth = currentMonth.clone().startOf('month');
   const endOfMonth = currentMonth.clone().endOf('month');
   const daysInMonth = endOfMonth.date();
   const firstDayOfWeek = startOfMonth.day();

   const monthDays: Array<{ day: number; date: moment.Moment; disabled: boolean }> = [];

   // Adicionar dias do mês anterior para completar a primeira semana
   const prevMonth = startOfMonth.clone().subtract(1, 'month');
   const daysInPrevMonth = prevMonth.daysInMonth();
   for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = prevMonth.clone().date(daysInPrevMonth - i);
      monthDays.push({
         day: date.date(),
         date: date.clone(),
         disabled: true,
      });
   }

   // Adicionar todos os dias do mês atual
   for (let day = 1; day <= daysInMonth; day++) {
      const date = currentMonth.clone().date(day);
      let disabled = false;

      if (minimumDate && date.isBefore(moment(minimumDate), 'day')) {
         disabled = true;
      }
      if (maximumDate && date.isAfter(moment(maximumDate), 'day')) {
         disabled = true;
      }

      monthDays.push({
         day,
         date: date.clone(),
         disabled,
      });
   }

   // Adicionar dias do próximo mês para completar a última semana
   const daysToAdd = 42 - monthDays.length; // 6 semanas * 7 dias = 42
   const nextMonth = startOfMonth.clone().add(1, 'month');
   for (let day = 1; day <= daysToAdd; day++) {
      const date = nextMonth.clone().date(day);
      monthDays.push({
         day: date.date(),
         date: date.clone(),
         disabled: true,
      });
   }

   const handleDaySelect = (date: moment.Moment) => {
      if (date.isBefore(startOfMonth, 'month') || date.isAfter(endOfMonth, 'month')) {
         return; // Não permitir seleção de dias de outros meses
      }

      const dateString = date.format('YYYY-MM-DD');
      setSelectedDay(date.date());
      onChange(dateString);
      setModalVisible(false);
   };

   const handleClear = () => {
      onChange('');
      setSelectedDay(null);
      setModalVisible(false);
   };

   const openModal = () => {
      if (value) {
         const date = moment(value);
         setSelectedMonth(date);
         setSelectedDay(date.date());
      } else {
         setSelectedMonth(moment());
         setSelectedDay(null);
      }
      setModalVisible(true);
   };

   const navigateMonth = (direction: 'prev' | 'next') => {
      setSelectedMonth((prev) =>
         direction === 'prev'
            ? prev.clone().subtract(1, 'month')
            : prev.clone().add(1, 'month')
      );
      setSelectedDay(null);
   };

   const isToday = (date: moment.Moment) => date.isSame(moment(), 'day');
   const isSelected = (date: moment.Moment) =>
      value && date.isSame(moment(value), 'day');

   return (
      <>
         <TouchableOpacity onPress={openModal} style={styles.input}>
            <Text style={[styles.inputText, !value && styles.placeholderText]}>
               {value ? moment(value).format('DD/MM/YYYY') : placeholder}
            </Text>
            <MaterialCommunityIcons
               name="calendar-outline"
               size={20}
               color={colors.text.body}
            />
         </TouchableOpacity>

         <Modal
            visible={modalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}
         >
            <Pressable
               style={styles.modalOverlay}
               onPress={() => setModalVisible(false)}
            >
               <Pressable
                  style={styles.modalContent}
                  onPress={(e) => e.stopPropagation()}
               >
                  <View style={styles.modalHeader}>
                     <Text style={styles.modalTitle}>Selecionar Data</Text>
                     <TouchableOpacity
                        onPress={() => setModalVisible(false)}
                        style={styles.closeButton}
                     >
                        <MaterialCommunityIcons
                           name="close"
                           size={24}
                           color={colors.text.title}
                        />
                     </TouchableOpacity>
                  </View>

                  <View style={styles.calendarContainer}>
                     <View style={styles.monthHeader}>
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

                     <View style={styles.weekDaysRow}>
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(
                           (day) => (
                              <View key={day} style={styles.weekDayHeader}>
                                 <Text style={styles.weekDayText}>{day}</Text>
                              </View>
                           )
                        )}
                     </View>

                     <View style={styles.calendarGrid}>
                        {monthDays.map((item, index) => {
                           const isCurrentMonth =
                              item.date.isSame(currentMonth, 'month');
                           const isSelectedDate = isSelected(item.date);
                           const isTodayDate = isToday(item.date);

                           return (
                              <TouchableOpacity
                                 key={index}
                                 onPress={() =>
                                    !item.disabled && handleDaySelect(item.date)
                                 }
                                 disabled={item.disabled}
                                 style={[
                                    styles.calendarDay,
                                    !isCurrentMonth && styles.calendarDayOtherMonth,
                                    item.disabled && styles.calendarDayDisabled,
                                    isSelectedDate && styles.calendarDaySelected,
                                    isTodayDate && styles.calendarDayToday,
                                 ]}
                              >
                                 <Text
                                    style={[
                                       styles.dayText,
                                       !isCurrentMonth &&
                                          styles.dayTextOtherMonth,
                                       item.disabled && styles.dayTextDisabled,
                                       isSelectedDate && styles.dayTextSelected,
                                       isTodayDate && styles.dayTextToday,
                                    ]}
                                 >
                                    {item.day}
                                 </Text>
                              </TouchableOpacity>
                           );
                        })}
                     </View>
                  </View>

                  <View style={styles.modalActions}>
                     <TouchableOpacity
                        onPress={handleClear}
                        style={styles.clearButton}
                     >
                        <Text style={styles.clearButtonText}>Limpar</Text>
                     </TouchableOpacity>
                     <TouchableOpacity
                        onPress={() => setModalVisible(false)}
                        style={styles.cancelButton}
                     >
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                     </TouchableOpacity>
                  </View>
               </Pressable>
            </Pressable>
         </Modal>
      </>
   );
}

const styles = StyleSheet.create({
   input: {
      backgroundColor: colors.gray[100],
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: colors.text.title,
      borderWidth: 1,
      borderColor: colors.gray[200],
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
   },
   inputText: {
      fontSize: 16,
      color: colors.text.title,
   },
   placeholderText: {
      color: colors.gray[300],
   },
   modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
   },
   modalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: 32,
      maxHeight: '80%',
   },
   modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.gray[200],
   },
   modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text.title,
   },
   closeButton: {
      padding: 4,
   },
   calendarContainer: {
      padding: 16,
   },
   monthHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
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
      width: '14.28%',
      aspectRatio: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      margin: 2,
   },
   calendarDayOtherMonth: {
      opacity: 0.3,
   },
   calendarDayDisabled: {
      opacity: 0.2,
   },
   calendarDaySelected: {
      backgroundColor: colors.primary,
   },
   calendarDayToday: {
      borderWidth: 2,
      borderColor: colors.primary,
   },
   dayText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.title,
   },
   dayTextOtherMonth: {
      color: colors.gray[300],
   },
   dayTextDisabled: {
      color: colors.gray[300],
   },
   dayTextSelected: {
      color: 'white',
   },
   dayTextToday: {
      color: colors.primary,
      fontWeight: '700',
   },
   modalActions: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      gap: 12,
   },
   clearButton: {
      flex: 1,
      padding: 14,
      borderRadius: 8,
      backgroundColor: colors.gray[100],
      alignItems: 'center',
   },
   clearButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.title,
   },
   cancelButton: {
      flex: 1,
      padding: 14,
      borderRadius: 8,
      backgroundColor: colors.primary,
      alignItems: 'center',
   },
   cancelButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: 'white',
   },
});


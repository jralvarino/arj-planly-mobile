import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../theme/colors';

interface MonthCalendarPickerProps {
   selectedDays: number[];
   onDaysChange: (days: number[]) => void;
}

export default function MonthCalendarPicker({
   selectedDays,
   onDaysChange,
}: MonthCalendarPickerProps) {
   // Array com todos os dias possíveis do mês (1-31)
   const allDays = Array.from({ length: 31 }, (_, i) => i + 1);

   const toggleDay = (day: number) => {
      if (selectedDays.includes(day)) {
         onDaysChange(selectedDays.filter((d) => d !== day));
      } else {
         onDaysChange([...selectedDays, day].sort((a, b) => a - b));
      }
   };

   return (
      <View style={styles.container}>
         <Text style={styles.title}>Selecione os dias do mês:</Text>
         
         {/* Grid de dias */}
         <View style={styles.daysGrid}>
            {allDays.map((day) => {
               const isSelected = selectedDays.includes(day);
               return (
                  <TouchableOpacity
                     key={day}
                     style={[
                        styles.dayButton,
                        isSelected && styles.daySelected,
                     ]}
                     onPress={() => toggleDay(day)}
                  >
                     <Text
                        style={[
                           styles.dayText,
                           isSelected && styles.dayTextSelected,
                        ]}
                     >
                        {day}
                     </Text>
                  </TouchableOpacity>
               );
            })}
         </View>

         {/* Resumo dos dias selecionados */}
         {selectedDays.length > 0 && (
            <View style={styles.summary}>
               <Text style={styles.summaryText}>
                  {selectedDays.length} dia{selectedDays.length > 1 ? 's' : ''}{' '}
                  selecionado{selectedDays.length > 1 ? 's' : ''}:{' '}
                  {selectedDays.join(', ')}
               </Text>
            </View>
         )}
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.gray[200],
   },
   title: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.title,
      marginBottom: 16,
   },
   daysGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
   },
   dayButton: {
      width: '11%',
      aspectRatio: 1,
      minWidth: 40,
      maxWidth: 50,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
      backgroundColor: colors.gray[100],
      borderWidth: 1,
      borderColor: colors.gray[200],
   },
   daySelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
   },
   dayText: {
      fontSize: 14,
      color: colors.text.title,
      fontWeight: '500',
   },
   dayTextSelected: {
      color: 'white',
      fontWeight: '600',
   },
   summary: {
      marginTop: 16,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.gray[200],
   },
   summaryText: {
      fontSize: 12,
      color: colors.text.body,
      textAlign: 'center',
   },
});


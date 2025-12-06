import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Emoji from 'react-native-emoji';
import { Text } from 'react-native-paper';
import { Habit } from '../models/Habit';
import { colors } from '../theme/colors';
import { makeColorStronger } from '../utils/colorUtils';

interface HabitCardProps {
   habit: Habit;
   onToggle: (id: string) => void;
}

export default function HabitCard({ habit, onToggle }: HabitCardProps) {
   const initialColor = habit.color;
   const checkedColor = makeColorStronger(habit.color);

   // Calcular progresso do amount (ex: "0/50", "0/1", "0/3 pg")
   const parseProgress = (amount: string) => {
      const match = amount.match(/(\d+)\/(\d+)/);
      if (match) {
         const current = parseInt(match[1], 10);
         const total = parseInt(match[2], 10);
         return {
            current,
            total,
            percentage: total > 0 ? (current / total) * 100 : 0,
         };
      }
      return { current: 0, total: 1, percentage: 0 };
   };

   const progress = parseProgress(habit.amount);
   const showProgress = progress.total > 1;

   return (
      <View style={styles.container}>
         <View
            style={[
               styles.card,
               {
                  backgroundColor: habit.completed
                     ? checkedColor
                     : initialColor,
               },
            ]}
         >
            {/* Emoji */}
            <View style={styles.colEmoji}>
               <Emoji style={styles.emoji} name={habit.emoji} />
            </View>

            {/* Título + Tags + Progresso */}
            <View style={styles.colText}>
               <Text style={styles.title}>{habit.title}</Text>

               <View style={styles.tagsRow}>
                  <View style={styles.tag}>
                     <Text style={styles.tagText}>{habit.amount}</Text>
                  </View>

                  <View style={styles.tag}>
                     <Text style={styles.tagText}>{habit.time}</Text>
                  </View>
               </View>

               {/* Barra de Progresso */}
               {showProgress && (
                  <View style={styles.progressContainer}>
                     <View style={styles.progressBar}>
                        <View
                           style={[
                              styles.progressFill,
                              {
                                 width: `${progress.percentage}%`,
                                 backgroundColor: habit.completed
                                    ? '#4CAF50'
                                    : colors.primary,
                              },
                           ]}
                        />
                     </View>

                  </View>
               )}
            </View>

            {/* BOTÃO DE CHECK */}
            <TouchableOpacity
               style={styles.colButton}
               onPress={() => onToggle(habit.id)}
            >
               <View
                  style={[
                     styles.checkButton,
                     habit.completed && styles.checkButtonOn,
                  ]}
               >
                  {habit.completed && (
                     <MaterialCommunityIcons
                        name="check"
                        size={16}
                        color="#FFF"
                     />
                  )}
               </View>
            </TouchableOpacity>
         </View>
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      paddingHorizontal: 2,
   },
   card: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 7,
      borderRadius: 12,
      gap: 7,
      marginBottom: 12,
      elevation: 4,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 5,
      shadowOffset: { width: 0, height: 2 },
   },
   colEmoji: {
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.6)',
      borderRadius: 12,
   },
   emoji: {
      fontSize: 22,
   },
   colText: {
      flex: 1,
   },
   title: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 6,
      color: colors.text.title,
   },
   tagsRow: {
      flexDirection: 'row',
      gap: 4,
   },
   tag: {
      backgroundColor: 'rgba(0,0,0,0.06)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
   },
   tagText: {
      fontSize: 9,
      color: colors.text.body,
      fontWeight: '500',
   },
   progressContainer: {
      marginTop: 5,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 1,
   },
   progressBar: {
      flex: 1,
      height: 5,
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
      borderRadius: 3,
      overflow: 'hidden',
   },
   progressFill: {
      height: '100%',
      borderRadius: 3,
   },
   colButton: {
      padding: 6,
   },
   checkButton: {
      width: 22,
      height: 22,
      borderRadius: 13,
      borderWidth: 2,
      borderColor: '#4CAF50',
      justifyContent: 'center',
      alignItems: 'center',
   },
   checkButtonOn: {
      backgroundColor: '#4CAF50',
      borderColor: '#4CAF50',
   },
});


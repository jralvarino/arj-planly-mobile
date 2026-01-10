import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
   Animated,
   Pressable,
   StyleSheet,
   TouchableOpacity,
   View,
} from 'react-native';
import Emoji from 'react-native-emoji';
import { Swipeable } from 'react-native-gesture-handler';
import { Text } from 'react-native-paper';
import { Habit } from '../models/Habit';
import { colors } from '../theme/colors';
import { makeColorStronger } from '../utils/colorUtils';
import HabitProgressModal from './HabitProgressModal';
import HabitSkipModal from './HabitSkipModal';

interface HabitCardProps {
   habit: Habit;
   onToggle: (id: string) => void;
   onUpdateAmount?: (habitId: string, newAmount: string) => Promise<void>;
   onSkip?: (habitId: string, reason: string) => Promise<void>;
}

export default function HabitCard({
   habit,
   onToggle,
   onUpdateAmount,
   onSkip,
}: HabitCardProps) {
   const router = useRouter();
   const [modalVisible, setModalVisible] = useState(false);
   const [skipModalVisible, setSkipModalVisible] = useState(false);
   const initialColor = habit.color;
   const checkedColor = makeColorStronger(habit.color);

   // Calcular progresso do amount (ex: "0/50", "0/1", "0/3 pg")
   const ratioMatch = habit.amount.match(/(\d+)\s*\/\s*(\d+)/);
   const progress = ratioMatch
      ? {
           current: parseInt(ratioMatch[1], 10),
           total: parseInt(ratioMatch[2], 10),
        }
      : { current: 0, total: 1 };
   const percentage =
      progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

   // Todos os cards podem abrir o modal, desde que a tela passe onUpdateAmount
   const canOpenModal = Boolean(onUpdateAmount);
   const showProgressBar = Boolean(ratioMatch);
   const isSkipped = Boolean(habit.skipped);
   const hasNotes = Boolean(habit.notes && habit.notes.trim());

   const handleCardPress = () => {
      // Abre o modal se tiver onUpdateAmount (para editar progresso) ou se tiver observações
      if (canOpenModal || hasNotes) {
         setModalVisible(true);
      }
   };

   const handleSaveAmount = async (habitId: string, newAmount: string) => {
      if (onUpdateAmount) {
         await onUpdateAmount(habitId, newAmount);
      }
   };

   const handleOpenEdit = () => {
      // rota fora de tabs: /habit/[id]
      router.push(`/habit/${habit.id}` as any);
   };

   const handleSkipConfirm = async (reason: string) => {
      if (onSkip) {
         await onSkip(habit.id, reason);
      }
   };

   const renderRightActions = (
      progress: Animated.AnimatedInterpolation<string | number>,
      dragX: Animated.AnimatedInterpolation<string | number>
   ) => {
      const scale = dragX.interpolate({
         inputRange: [-172, 0],
         outputRange: [1, 0.95],
         extrapolate: 'clamp',
      });

      const opacity = dragX.interpolate({
         inputRange: [-172, -86, 0],
         outputRange: [1, 0.7, 0],
         extrapolate: 'clamp',
      });

      return (
         <View style={styles.actionsWrap}>
            <Animated.View
               style={[
                  styles.actionBtnContainer,
                  {
                     transform: [{ scale }],
                     opacity,
                  },
               ]}
            >
               <Pressable
                  style={({ pressed }) => [
                     styles.actionBtn,
                     styles.actionSkip,
                     pressed && styles.actionPressed,
                  ]}
                  onPress={() => setSkipModalVisible(true)}
                  disabled={!onSkip}
               >
                  <View style={styles.actionIconContainer}>
                     <MaterialCommunityIcons
                        name="skip-next"
                        size={24}
                        color="#3a2b00"
                     />
                  </View>
                  <Text style={styles.actionTextDark}>Skip</Text>
               </Pressable>
            </Animated.View>

            <Animated.View
               style={[
                  styles.actionBtnContainer,
                  {
                     transform: [{ scale }],
                     opacity,
                  },
               ]}
            >
               <Pressable
                  style={({ pressed }) => [
                     styles.actionBtn,
                     styles.actionEdit,
                     pressed && styles.actionPressed,
                  ]}
                  onPress={handleOpenEdit}
               >
                  <View style={styles.actionIconContainer}>
                     <MaterialCommunityIcons
                        name="pencil"
                        size={24}
                        color="white"
                     />
                  </View>
                  <Text style={styles.actionTextLight}>Edit</Text>
               </Pressable>
            </Animated.View>
         </View>
      );
   };

   return (
      <View style={styles.container}>
         <Swipeable
            renderRightActions={renderRightActions}
            overshootRight={false}
            rightThreshold={40}
            friction={2}
            overshootFriction={8}
         >
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
               {/* Área clicável do card (não inclui o botão de check) */}
               <Pressable
                  style={({ pressed }) => [
                     styles.cardMain,
                     canOpenModal && pressed && styles.cardMainPressed,
                  ]}
                  onPress={handleCardPress}
                  disabled={!canOpenModal && !hasNotes}
               >
                  <View style={styles.colEmoji}>
                     <Emoji style={styles.emoji} name={habit.emoji} />
                  </View>

                  <View style={styles.colText}>
                     <View style={styles.titleRow}>
                        <View style={styles.titleContainer}>
                           <Text
                              style={[
                                 styles.title,
                                 isSkipped && styles.titleSkipped,
                              ]}
                           >
                              {habit.title}
                           </Text>
                           {habit.notes && habit.notes.trim() && (
                              <MaterialCommunityIcons
                                 name="message-text-outline"
                                 size={14}
                                 color="#2196F3"
                                 style={styles.notesIcon}
                              />
                           )}
                        </View>
                        {isSkipped && (
                           <View style={styles.skippedTag}>
                              <Text style={styles.skippedTagText}>skiped</Text>
                           </View>
                        )}
                     </View>

                     <View style={styles.tagsRow}>
                        <View style={styles.tag}>
                           <Text style={styles.tagText}>{habit.amount}</Text>
                        </View>

                        <View style={styles.tag}>
                           <Text style={styles.tagText}>{habit.time}</Text>
                        </View>
                     </View>

                     {showProgressBar && (
                        <View style={styles.progressContainer}>
                           <View style={styles.progressBar}>
                              <View
                                 style={[
                                    styles.progressFill,
                                    {
                                       width: `${Math.max(
                                          0,
                                          Math.min(100, percentage)
                                       )}%`,
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
               </Pressable>

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
         </Swipeable>

         {(canOpenModal || hasNotes) && (
            <HabitProgressModal
               visible={modalVisible}
               habit={habit}
               onClose={() => setModalVisible(false)}
               onSave={handleSaveAmount}
            />
         )}

         {onSkip && (
            <HabitSkipModal
               visible={skipModalVisible}
               habitTitle={habit.title}
               initialReason={habit.skip_reason || ''}
               onClose={() => setSkipModalVisible(false)}
               onConfirm={handleSkipConfirm}
            />
         )}
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
      borderRadius: 12,
      marginBottom: 12,
      elevation: 4,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 5,
      shadowOffset: { width: 0, height: 2 },
      overflow: 'hidden',
   },
   cardMain: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 7,
      gap: 7,
   },
   cardMainPressed: {
      opacity: 0.85,
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
   titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
   },
   titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flex: 1,
   },
   title: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 6,
      color: colors.text.title,
      flex: 1,
   },
   notesIcon: {
      marginBottom: 6,
   },
   titleSkipped: {
      textDecorationLine: 'line-through',
      opacity: 0.7,
   },
   skippedTag: {
      backgroundColor: '#f5c542',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
   },
   skippedTagText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#3a2b00',
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
      marginTop: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
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
   progressText: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.text.body,
      minWidth: 35,
      textAlign: 'right',
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
   actionsWrap: {
      height: '85%',
      flexDirection: 'row',
      alignItems: 'stretch',
      marginBottom: 12,
      borderRadius: 12,
      overflow: 'hidden',
      width: 172,
   },
   actionBtnContainer: {
      height: '100%',
      width: 86,
   },
   actionBtn: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 12,
   },
   actionIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
   },
   actionSkip: {
      backgroundColor: '#FFC107',
   },
   actionEdit: {
      backgroundColor: colors.primary,
   },
   actionPressed: {
      opacity: 0.8,
      transform: [{ scale: 0.95 }],
   },
   actionTextDark: {
      fontSize: 11,
      fontWeight: '700',
      color: '#3a2b00',
      letterSpacing: 0.5,
   },
   actionTextLight: {
      fontSize: 11,
      fontWeight: '700',
      color: 'white',
      letterSpacing: 0.5,
   },
});

import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, View } from 'react-native';
import Emoji from 'react-native-emoji';
import { Text } from 'react-native-paper';
import { Habit } from '../models/Habit';
import { colors } from '../theme/colors';

interface HabitProgressModalProps {
   visible: boolean;
   habit: Habit | null;
   onClose: () => void;
   onSave?: (habitId: string, newAmount: string) => Promise<void>;
}

export default function HabitProgressModal({
   visible,
   habit,
   onClose,
   onSave,
}: HabitProgressModalProps) {
   const [current, setCurrent] = useState(0);
   const [total, setTotal] = useState(1);
   const [suffix, setSuffix] = useState('');
   const [loading, setLoading] = useState(false);

   useEffect(() => {
      if (!habit || !visible) {
         setCurrent(0);
         setTotal(1);
         setSuffix('');
         return;
      }

      // Captura: 2/5 pg | 1/10 min | 3/4
      const match = habit.amount.match(/^(\d+)\s*\/\s*(\d+)(.*)$/);

      if (match) {
         setCurrent(Number(match[1]) || 0);
         setTotal(Number(match[2]) || 1);
         setSuffix(match?.[3]?.trim() ? match[3].trim() : '');
      } else {
         setCurrent(0);
         setTotal(1);
         setSuffix('');
      }
   }, [habit, visible]);

   const hasValidAmount = Boolean(habit?.amount.match(/^(\d+)\s*\/\s*(\d+)/));
   const showCounter = hasValidAmount && Boolean(onSave);

   if (!habit) return null;

   const handleIncrement = () => {
      setCurrent((prev) => Math.min(prev + 1, total));
   };

   const handleDecrement = () => {
      setCurrent((prev) => Math.max(prev - 1, 0));
   };

   const handleSave = async () => {
      if (!onSave) {
         // Se não houver onSave, apenas fecha o modal (caso de apenas visualizar observações)
         onClose();
         return;
      }

      setLoading(true);
      try {
         const newAmount = `${current}/${total}${suffix ? ` ${suffix}` : ''}`;

         await onSave(habit.id, newAmount);
         onClose();
      } catch (error) {
         console.error('Error saving progress:', error);
         Alert.alert('Erro', 'Não foi possível salvar o progresso.');
      } finally {
         setLoading(false);
      }
   };

   const percentage = total > 0 ? Math.min(100, (current / total) * 100) : 0;

   const isComplete = current >= total;

   return (
      <Modal
         visible={visible}
         transparent
         animationType="fade"
         onRequestClose={onClose}
         statusBarTranslucent
         presentationStyle="overFullScreen"
      >
         <View style={styles.overlay}>
            {/* Backdrop (fora do modal fecha) */}
            <Pressable style={styles.backdrop} onPress={onClose} />

            {/* Card do modal */}
            <View style={styles.modalCard}>
               <View style={styles.topRow}>
                  <View style={styles.headerLeft}>
                     <View style={styles.emojiContainer}>
                        <Emoji name={habit.emoji} style={styles.emoji} />
                     </View>
                     <View style={styles.headerText}>
                        <Text style={styles.title}>{habit.title}</Text>
                        {hasValidAmount && (
                           <Text style={styles.subtitle}>
                              Progresso: {current}/{total}
                              {suffix ? ` ${suffix}` : ''}
                           </Text>
                        )}
                     </View>
                  </View>

                  <Pressable
                     onPress={onClose}
                     hitSlop={12}
                     style={styles.closeBtn}
                  >
                     <MaterialCommunityIcons
                        name="close"
                        size={22}
                        color={colors.text.body}
                     />
                  </Pressable>
               </View>

               {/* Notes Section */}
               {habit.notes && habit.notes.trim() && (
                  <View style={styles.notesSection}>
                     <View style={styles.notesHeader}>
                        <MaterialCommunityIcons
                           name="message-text-outline"
                           size={18}
                           color="#2196F3"
                        />
                        <Text style={styles.notesTitle}>Observações</Text>
                     </View>
                     <Text style={styles.notesText}>{habit.notes}</Text>
                  </View>
               )}

               {/* Counter - só mostra se tiver amount válido e onSave */}
               {showCounter && (
                  <>
                     <View style={styles.counterContainer}>
                        <Pressable
                           style={({ pressed }) => [
                              styles.counterButton,
                              current === 0 && styles.counterButtonDisabled,
                              pressed && current !== 0 && styles.counterButtonPressed,
                           ]}
                           disabled={current === 0}
                           onPress={handleDecrement}
                           hitSlop={10}
                        >
                           <MaterialCommunityIcons
                              name="minus"
                              size={22}
                              color={
                                 current === 0 ? colors.gray[300] : colors.primary
                              }
                           />
                        </Pressable>

                        <View style={styles.counterDisplay}>
                           <Text style={styles.counterNumber}>{current}</Text>
                           <Text style={styles.counterSeparator}>/</Text>
                           <Text style={styles.counterTotal}>{total}</Text>
                        </View>

                        <Pressable
                           style={({ pressed }) => [
                              styles.counterButton,
                              current >= total && styles.counterButtonDisabled,
                              pressed &&
                                 current < total &&
                                 styles.counterButtonPressed,
                           ]}
                           disabled={current >= total}
                           onPress={handleIncrement}
                           hitSlop={10}
                        >
                           <MaterialCommunityIcons
                              name="plus"
                              size={22}
                              color={
                                 current >= total ? colors.gray[300] : colors.primary
                              }
                           />
                        </Pressable>
                     </View>

                     {/* Progress */}
                     <View style={styles.progressSection}>
                        <View style={styles.progressBar}>
                           <View
                              style={[
                                 styles.progressFill,
                                 {
                                    width: `${percentage}%`,
                                    backgroundColor: isComplete
                                       ? '#4CAF50'
                                       : colors.primary,
                                 },
                              ]}
                           />
                        </View>
                        <Text style={styles.progressText}>
                           {Math.round(percentage)}%
                        </Text>
                     </View>
                  </>
               )}

               {/* Actions */}
               <View style={styles.actions}>
                  {onSave ? (
                     <>
                        <Pressable
                           style={({ pressed }) => [
                              styles.cancelButton,
                              pressed && styles.secondaryPressed,
                           ]}
                           onPress={onClose}
                        >
                           <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </Pressable>

                        <Pressable
                           style={({ pressed }) => [
                              styles.saveButton,
                              loading && styles.saveButtonDisabled,
                              pressed && !loading && styles.primaryPressed,
                           ]}
                           disabled={loading}
                           onPress={handleSave}
                        >
                           <Text style={styles.saveButtonText}>
                              {loading ? 'Salvando...' : 'Salvar'}
                           </Text>
                        </Pressable>
                     </>
                  ) : (
                     <Pressable
                        style={({ pressed }) => [
                           styles.saveButton,
                           pressed && styles.primaryPressed,
                        ]}
                        onPress={onClose}
                     >
                        <Text style={styles.saveButtonText}>Fechar</Text>
                     </Pressable>
                  )}
               </View>
            </View>
         </View>
      </Modal>
   );
}

const styles = StyleSheet.create({
   overlay: {
      flex: 1,
      position: 'relative',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
   },
   backdrop: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 1,
   },
   modalCard: {
      position: 'relative',
      zIndex: 2,
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 24,
      width: '100%',
      maxWidth: 400,
      elevation: 20,
      shadowColor: '#000',
      shadowOpacity: 0.3,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 5 },
   },
   topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 18,
      gap: 12,
   },
   headerLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
   },
   headerText: {
      flex: 1,
   },
   closeBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.gray[100],
      alignItems: 'center',
      justifyContent: 'center',
   },
   emoji: {
      fontSize: 32,
   },
   emojiContainer: {
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor: colors.gray[100],
      alignItems: 'center',
      justifyContent: 'center',
   },
   title: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text.title,
   },
   subtitle: {
      marginTop: 4,
      fontSize: 12,
      color: colors.text.body,
   },
   counterContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 18,
      gap: 20,
   },
   counterButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.gray[100],
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.primary,
   },
   counterButtonPressed: {
      transform: [{ scale: 0.98 }],
      opacity: 0.9,
   },
   counterButtonDisabled: {
      opacity: 0.4,
      borderColor: colors.gray[300],
   },
   counterDisplay: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 8,
      minWidth: 120,
      justifyContent: 'center',
   },
   counterNumber: {
      fontSize: 48,
      fontWeight: '700',
      color: colors.primary,
   },
   counterSeparator: {
      fontSize: 32,
      fontWeight: '600',
      color: colors.text.body,
   },
   counterTotal: {
      fontSize: 32,
      fontWeight: '600',
      color: colors.text.body,
   },
   progressSection: {
      marginBottom: 18,
   },
   progressBar: {
      height: 12,
      backgroundColor: colors.gray[200],
      borderRadius: 6,
      overflow: 'hidden',
      marginBottom: 8,
   },
   progressFill: {
      height: '100%',
      borderRadius: 6,
   },
   progressText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.body,
      textAlign: 'center',
   },
   actions: {
      flexDirection: 'row',
      gap: 12,
   },
   cancelButton: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      backgroundColor: colors.gray[100],
      alignItems: 'center',
   },
   secondaryPressed: {
      opacity: 0.85,
   },
   cancelButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.body,
   },
   notesSection: {
      marginBottom: 24,
      padding: 16,
      backgroundColor: '#E3F2FD',
      borderRadius: 12,
      borderLeftWidth: 4,
      borderLeftColor: '#2196F3',
   },
   notesHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
   },
   notesTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: '#2196F3',
   },
   notesText: {
      fontSize: 14,
      color: colors.text.body,
      lineHeight: 20,
   },
   saveButton: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      backgroundColor: colors.primary,
      alignItems: 'center',
   },
   primaryPressed: {
      opacity: 0.9,
   },
   saveButtonDisabled: {
      opacity: 0.6,
   },
   saveButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: 'white',
   },
});

import { MaterialCommunityIcons } from '@expo/vector-icons';
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

interface TimePickerProps {
   value: string; // formato HH:mm
   onChange: (time: string) => void;
   placeholder?: string;
}

export default function TimePicker({
   value,
   onChange,
   placeholder = 'Selecione o horário',
}: TimePickerProps) {
   const [modalVisible, setModalVisible] = useState(false);
   const [selectedHour, setSelectedHour] = useState<number>(
      value ? parseInt(value.split(':')[0]) : 9
   );
   const [selectedMinute, setSelectedMinute] = useState<number>(
      value ? parseInt(value.split(':')[1]) : 0
   );

   const hours = Array.from({ length: 24 }, (_, i) => i);
   const minutes = Array.from({ length: 60 }, (_, i) => i);

   const handleConfirm = () => {
      const timeString = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
      onChange(timeString);
      setModalVisible(false);
   };

   const handleClear = () => {
      onChange('');
      setModalVisible(false);
   };

   const openModal = () => {
      if (value) {
         const [hour, minute] = value.split(':');
         setSelectedHour(parseInt(hour));
         setSelectedMinute(parseInt(minute));
      }
      setModalVisible(true);
   };

   return (
      <>
         <TouchableOpacity onPress={openModal} style={styles.input}>
            <Text style={[styles.inputText, !value && styles.placeholderText]}>
               {value || placeholder}
            </Text>
            <MaterialCommunityIcons
               name="clock-outline"
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
                     <Text style={styles.modalTitle}>Selecionar Horário</Text>
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

                  <View style={styles.pickerContainer}>
                     <View style={styles.pickerColumn}>
                        <Text style={styles.pickerLabel}>Hora</Text>
                        <ScrollView
                           style={styles.scrollView}
                           showsVerticalScrollIndicator={false}
                           contentContainerStyle={styles.scrollContent}
                        >
                           {hours.map((hour) => (
                              <TouchableOpacity
                                 key={hour}
                                 onPress={() => setSelectedHour(hour)}
                                 style={[
                                    styles.pickerItem,
                                    selectedHour === hour &&
                                       styles.pickerItemSelected,
                                 ]}
                              >
                                 <Text
                                    style={[
                                       styles.pickerItemText,
                                       selectedHour === hour &&
                                          styles.pickerItemTextSelected,
                                    ]}
                                 >
                                    {hour.toString().padStart(2, '0')}
                                 </Text>
                              </TouchableOpacity>
                           ))}
                        </ScrollView>
                     </View>

                     <Text style={styles.separator}>:</Text>

                     <View style={styles.pickerColumn}>
                        <Text style={styles.pickerLabel}>Minuto</Text>
                        <ScrollView
                           style={styles.scrollView}
                           showsVerticalScrollIndicator={false}
                           contentContainerStyle={styles.scrollContent}
                        >
                           {minutes.map((minute) => (
                              <TouchableOpacity
                                 key={minute}
                                 onPress={() => setSelectedMinute(minute)}
                                 style={[
                                    styles.pickerItem,
                                    selectedMinute === minute &&
                                       styles.pickerItemSelected,
                                 ]}
                              >
                                 <Text
                                    style={[
                                       styles.pickerItemText,
                                       selectedMinute === minute &&
                                          styles.pickerItemTextSelected,
                                    ]}
                                 >
                                    {minute.toString().padStart(2, '0')}
                                 </Text>
                              </TouchableOpacity>
                           ))}
                        </ScrollView>
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
                        onPress={handleConfirm}
                        style={styles.confirmButton}
                     >
                        <Text style={styles.confirmButtonText}>Confirmar</Text>
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
      maxHeight: '70%',
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
   pickerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 24,
      paddingHorizontal: 16,
   },
   pickerColumn: {
      flex: 1,
      alignItems: 'center',
   },
   pickerLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.body,
      marginBottom: 12,
   },
   scrollView: {
      maxHeight: 200,
   },
   scrollContent: {
      paddingVertical: 80,
   },
   pickerItem: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginVertical: 2,
      borderRadius: 8,
      minWidth: 60,
      alignItems: 'center',
   },
   pickerItemSelected: {
      backgroundColor: colors.primary,
   },
   pickerItemText: {
      fontSize: 18,
      fontWeight: '500',
      color: colors.text.title,
   },
   pickerItemTextSelected: {
      color: 'white',
      fontWeight: '600',
   },
   separator: {
      fontSize: 24,
      fontWeight: '600',
      color: colors.text.title,
      marginHorizontal: 8,
      marginTop: 40,
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
   confirmButton: {
      flex: 1,
      padding: 14,
      borderRadius: 8,
      backgroundColor: colors.primary,
      alignItems: 'center',
   },
   confirmButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: 'white',
   },
});

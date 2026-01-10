import React, { useEffect, useState } from 'react';
import {
   Modal,
   Pressable,
   StyleSheet,
   TextInput,
   View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../theme/colors';

interface HabitSkipModalProps {
   visible: boolean;
   habitTitle: string;
   initialReason?: string;
   onClose: () => void;
   onConfirm: (reason: string) => Promise<void> | void;
}

export default function HabitSkipModal({
   visible,
   habitTitle,
   initialReason = '',
   onClose,
   onConfirm,
}: HabitSkipModalProps) {
   const [reason, setReason] = useState(initialReason);
   const [loading, setLoading] = useState(false);

   useEffect(() => {
      if (visible) {
         setReason(initialReason);
      }
   }, [visible, initialReason]);

   const handleConfirm = async () => {
      if (!reason.trim()) return;
      setLoading(true);
      try {
         await onConfirm(reason.trim());
         onClose();
      } finally {
         setLoading(false);
      }
   };

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
            <Pressable style={styles.backdrop} onPress={onClose} />

            <View style={styles.card}>
               <Text style={styles.title}>Pular hábito?</Text>
               <Text style={styles.subtitle}>
                  Informe o motivo para pular: <Text style={styles.bold}>{habitTitle}</Text>
               </Text>

               <TextInput
                  style={styles.input}
                  placeholder="Ex: doente, viagem, sem tempo..."
                  placeholderTextColor={colors.gray[300]}
                  value={reason}
                  onChangeText={setReason}
                  multiline
                  numberOfLines={3}
                  maxLength={240}
               />

               <View style={styles.actions}>
                  <Pressable
                     style={({ pressed }) => [
                        styles.secondaryBtn,
                        pressed && styles.pressed,
                     ]}
                     onPress={onClose}
                     disabled={loading}
                  >
                     <Text style={styles.secondaryText}>Cancelar</Text>
                  </Pressable>

                  <Pressable
                     style={({ pressed }) => [
                        styles.primaryBtn,
                        (!reason.trim() || loading) && styles.disabled,
                        pressed && !loading && reason.trim() && styles.pressed,
                     ]}
                     onPress={handleConfirm}
                     disabled={!reason.trim() || loading}
                  >
                     <Text style={styles.primaryText}>
                        {loading ? 'Salvando...' : 'Confirmar'}
                     </Text>
                  </Pressable>
               </View>
            </View>
         </View>
      </Modal>
   );
}

const styles = StyleSheet.create({
   overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
   },
   backdrop: {
      ...StyleSheet.absoluteFillObject,
   },
   card: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 18,
      elevation: 12,
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
   },
   title: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text.title,
      marginBottom: 6,
   },
   subtitle: {
      fontSize: 13,
      color: colors.text.body,
      marginBottom: 12,
      lineHeight: 18,
   },
   bold: {
      fontWeight: '700',
      color: colors.text.title,
   },
   input: {
      borderWidth: 1,
      borderColor: colors.gray[200],
      borderRadius: 12,
      padding: 12,
      minHeight: 86,
      textAlignVertical: 'top',
      color: colors.text.title,
      backgroundColor: colors.gray[100],
      marginBottom: 14,
   },
   actions: {
      flexDirection: 'row',
      gap: 10,
   },
   secondaryBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: colors.gray[100],
      alignItems: 'center',
      justifyContent: 'center',
   },
   secondaryText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text.body,
   },
   primaryBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: '#f5c542',
      alignItems: 'center',
      justifyContent: 'center',
   },
   primaryText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#3a2b00',
   },
   disabled: {
      opacity: 0.5,
   },
   pressed: {
      opacity: 0.9,
   },
});



import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../theme/colors';

interface EmptyStateProps {
   message?: string;
   icon?: string;
}

export default function EmptyState({
   message = 'Nenhum hábito para hoje!',
   icon = 'check-circle-outline',
}: EmptyStateProps) {
   return (
      <View style={styles.container}>
         <View style={styles.iconContainer}>
            <MaterialCommunityIcons
               name={icon}
               size={64}
               color={colors.gray[300]}
            />
         </View>
         <Text style={styles.message}>{message}</Text>
         <Text style={styles.subtitle}>
            Adicione novos hábitos para começar sua jornada!
         </Text>
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
      paddingHorizontal: 32,
   },
   iconContainer: {
      marginBottom: 16,
      opacity: 0.5,
   },
   message: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text.title,
      marginBottom: 8,
      textAlign: 'center',
   },
   subtitle: {
      fontSize: 14,
      color: colors.text.body,
      textAlign: 'center',
      lineHeight: 20,
   },
});


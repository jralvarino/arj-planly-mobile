import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
   Alert,
   KeyboardAvoidingView,
   Platform,
   ScrollView,
   StyleSheet,
   TextInput,
   TouchableOpacity,
   View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { createCategory } from '../../service/categoryService';
import { colors } from '../../theme/colors';

export default function NewCategoryScreen() {
   const router = useRouter();
   const [name, setName] = useState('');

   const handleSave = async () => {
      if (!name.trim()) {
         Alert.alert('Erro', 'Por favor, informe o nome da categoria');
         return;
      }

      try {
         await createCategory(name.trim());
         router.back();
      } catch (error) {
         Alert.alert('Erro', 'Não foi possível criar a categoria');
         console.error('Error creating category:', error);
      }
   };

   return (
      <KeyboardAvoidingView
         style={styles.container}
         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
         <ScrollView style={styles.content}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
               style={styles.input}
               value={name}
               onChangeText={setName}
               placeholder="Ex: Trabalho, Estudos, etc."
               placeholderTextColor={colors.gray[300]}
            />

            {/* Save Button */}
            <TouchableOpacity
               style={styles.saveButton}
               onPress={handleSave}
            >
               <Text style={styles.saveButtonText}>Salvar Categoria</Text>
            </TouchableOpacity>
         </ScrollView>
      </KeyboardAvoidingView>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: colors.background,
   },
   saveButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 24,
      elevation: 2,
      shadowColor: colors.primary,
      shadowOpacity: 0.3,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
   },
   saveButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
   },
   content: {
      flex: 1,
      padding: 16,
   },
   label: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.title,
      marginBottom: 8,
      marginTop: 16,
   },
   input: {
      backgroundColor: colors.gray[100],
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: colors.text.title,
      borderWidth: 1,
      borderColor: colors.gray[200],
   },
});


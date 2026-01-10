import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
   Alert,
   ScrollView,
   StyleSheet,
   TouchableOpacity,
   View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Category } from '../../models/Category';
import {
   deleteCategory,
   getAllCategories,
} from '../../service/categoryService';
import { colors } from '../../theme/colors';

export default function CategoriesScreen() {
   const router = useRouter();
   const [categories, setCategories] = useState<Category[]>([]);

   const loadCategories = useCallback(async () => {
      try {
         const cats = await getAllCategories();
         setCategories(cats);
      } catch (error) {
         console.error('Error loading categories:', error);
      }
   }, []);

   useFocusEffect(
      useCallback(() => {
         loadCategories();
      }, [loadCategories])
   );

   const handleDelete = (category: Category) => {
      Alert.alert(
         'Deletar Categoria',
         `Tem certeza que deseja deletar a categoria "${category.name}"?`,
         [
            { text: 'Cancelar', style: 'cancel' },
            {
               text: 'Deletar',
               style: 'destructive',
               onPress: async () => {
                  try {
                     await deleteCategory(category.id);
                     loadCategories();
                  } catch (error) {
                     Alert.alert('Erro', 'Não foi possível deletar a categoria');
                     console.error('Error deleting category:', error);
                  }
               },
            },
         ]
      );
   };

   return (
      <View style={styles.container}>
         <ScrollView style={styles.content}>
            {categories.length === 0 ? (
               <View style={styles.emptyState}>
                  <MaterialCommunityIcons
                     name="folder-outline"
                     size={64}
                     color={colors.gray[300]}
                  />
                  <Text style={styles.emptyText}>
                     Nenhuma categoria cadastrada
                  </Text>
                  <TouchableOpacity
                     onPress={() => router.push('/categories/new')}
                     style={styles.emptyButton}
                  >
                     <Text style={styles.emptyButtonText}>
                        Criar primeira categoria
                     </Text>
                  </TouchableOpacity>
               </View>
            ) : (
               categories.map((category) => (
                  <View key={category.id} style={styles.categoryCard}>
                     <View style={styles.categoryInfo}>
                        <View style={styles.categoryDetails}>
                           <Text style={styles.categoryName}>
                              {category.name}
                           </Text>
                        </View>
                     </View>
                     <View style={styles.actions}>
                        <TouchableOpacity
                           onPress={() =>
                              router.push(`/categories/${category.id}`)
                           }
                           style={styles.actionButton}
                        >
                           <MaterialCommunityIcons
                              name="pencil"
                              size={20}
                              color={colors.primary}
                           />
                        </TouchableOpacity>
                        <TouchableOpacity
                           onPress={() => handleDelete(category)}
                           style={styles.actionButton}
                        >
                           <MaterialCommunityIcons
                              name="delete"
                              size={20}
                              color="#ff4444"
                           />
                        </TouchableOpacity>
                     </View>
                  </View>
               ))
            )}
         </ScrollView>
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: colors.background,
   },
   content: {
      flex: 1,
      padding: 16,
   },
   emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 64,
   },
   emptyText: {
      fontSize: 16,
      color: colors.text.body,
      marginTop: 16,
      marginBottom: 24,
   },
   emptyButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
   },
   emptyButtonText: {
      color: 'white',
      fontWeight: '600',
   },
   categoryCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.gray[100],
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
   },
   categoryInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
   },
   categoryDetails: {
      flex: 1,
   },
   categoryName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.title,
   },
   actions: {
      flexDirection: 'row',
      gap: 8,
   },
   actionButton: {
      padding: 8,
   },
});


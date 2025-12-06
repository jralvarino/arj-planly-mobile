import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../theme/colors';

interface CategoryFiltersProps {
   categories: string[];
   selectedFilter: string | null;
   onFilterChange: (category: string | null) => void;
}

export default function CategoryFilters({
   categories,
   selectedFilter,
   onFilterChange,
}: CategoryFiltersProps) {
   return (
      <View>
         <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.scrollView}
         >
            <View style={styles.container}>
               {categories.map((cat) => {
                  const isActive = selectedFilter === cat;
                  return (
                     <TouchableOpacity
                        key={cat}
                        onPress={() => onFilterChange(isActive ? null : cat)}
                        style={[styles.tag, isActive && styles.tagActive]}
                     >
                        <Text
                           style={[
                              styles.tagText,
                              isActive && styles.tagTextActive,
                           ]}
                        >
                           {cat}
                        </Text>
                     </TouchableOpacity>
                  );
               })}
            </View>
         </ScrollView>
      </View>
   );
}

const styles = StyleSheet.create({
   scrollView: {
      paddingHorizontal: 12,
      marginTop: 5,
   },
   container: {
      flexDirection: 'row',
      gap: 8,
   },
   tag: {
      backgroundColor: colors.gray[100],
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      alignSelf: 'center',
      borderColor: colors.gray[200],
   },
   tagActive: {
      backgroundColor: colors.primary,
   },
   tagText: {
      fontSize: 10,
      color: colors.text.body,
      fontWeight: '500',
   },
   tagTextActive: {
      color: 'white',
      fontWeight: '600',
   },
});

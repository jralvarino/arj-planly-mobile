import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import moment from 'moment';
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
import Emoji from 'react-native-emoji';
import { Text } from 'react-native-paper';
import { createTask } from '../../service/taskService';
import { colors } from '../../theme/colors';

const EMOJIS = [
   'book',
   'camera',
   'airplane',
   'tv',
   'musical_note',
   'basketball',
   'soccer',
   'swimmer',
   'bicyclist',
   'runner',
   'weight_lifter',
   'meditation',
   'yoga',
   'pencil',
   'paintbrush',
   'guitar',
   'piano',
   'headphones',
   'movie_camera',
   'game_die',
   'video_game',
   'computer',
   'mobile_phone',
   'coffee',
   'apple',
   'green_salad',
   'water',
   'pill',
   'hospital',
   'bed',
   'alarm_clock',
   'sunny',
   'moon',
   'star',
   'heart',
   'fire',
   'trophy',
   'medal',
   'checkered_flag',
   'rocket',
];

const COLORS = [
   '#f3eafe',
   '#D8FFFB',
   '#d6fce9',
   '#ffe4e6',
   '#fff4e6',
   '#e6f3ff',
   '#f0e6ff',
   '#ffe6f0',
   '#e6ffe6',
   '#fff9e6',
];

const CATEGORIES = ['English', 'Health', 'Home'];

const TIMES = ['morning', 'afternoon', 'night', 'anytime'];

export default function AddScreen() {
   const router = useRouter();
   const [title, setTitle] = useState('');
   const [description, setDescription] = useState('');
   const [amount, setAmount] = useState('0/1');
   const [selectedEmoji, setSelectedEmoji] = useState('book');
   const [selectedColor, setSelectedColor] = useState(COLORS[0]);
   const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
   const [selectedTime, setSelectedTime] = useState(TIMES[0]);
   const [selectedDate, setSelectedDate] = useState(
      moment().format('YYYY-MM-DD')
   );
   const [loading, setLoading] = useState(false);

   const handleSave = async () => {
      if (!title.trim()) {
         Alert.alert('Erro', 'Por favor, preencha o título do hábito');
         return;
      }

      setLoading(true);
      try {
         await createTask({
            title: title.trim(),
            amount,
            streakCount: 0,
            frequency: selectedCategory,
            completed: false,
            color: selectedColor,
            description: description.trim(),
            streak_count: '0',
            emoji: selectedEmoji,
            time: selectedTime,
            date: selectedDate,
         });

         Alert.alert('Sucesso', 'Hábito criado com sucesso!', [
            {
               text: 'OK',
               onPress: () => router.back(),
            },
         ]);
      } catch (error) {
         console.error('Error creating habit:', error);
         Alert.alert(
            'Erro',
            'Não foi possível criar o hábito. Tente novamente.'
         );
      } finally {
         setLoading(false);
      }
   };

   return (
      <KeyboardAvoidingView
         style={styles.container}
         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
         <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
         >
            {/* Header */}
            <View style={styles.header}>
               <Text style={styles.headerTitle}>Novo Hábito</Text>
            </View>

            {/* Emoji Selector */}
            <View style={styles.section}>
               <Text style={styles.sectionTitle}>Emoji</Text>
               <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.emojiScroll}
               >
                  {EMOJIS.map((emoji) => (
                     <TouchableOpacity
                        key={emoji}
                        style={[
                           styles.emojiOption,
                           selectedEmoji === emoji &&
                              styles.emojiOptionSelected,
                        ]}
                        onPress={() => setSelectedEmoji(emoji)}
                     >
                        <Emoji name={emoji} style={styles.emojiIcon} />
                     </TouchableOpacity>
                  ))}
               </ScrollView>
            </View>

            {/* Color Selector */}
            <View style={styles.section}>
               <Text style={styles.sectionTitle}>Cor</Text>
               <View style={styles.colorRow}>
                  {COLORS.map((color) => (
                     <TouchableOpacity
                        key={color}
                        style={[
                           styles.colorOption,
                           { backgroundColor: color },
                           selectedColor === color &&
                              styles.colorOptionSelected,
                        ]}
                        onPress={() => setSelectedColor(color)}
                     >
                        {selectedColor === color && (
                           <MaterialCommunityIcons
                              name="check"
                              size={20}
                              color="#333"
                           />
                        )}
                     </TouchableOpacity>
                  ))}
               </View>
            </View>

            {/* Title Input */}
            <View style={styles.section}>
               <Text style={styles.sectionTitle}>Título *</Text>
               <TextInput
                  style={styles.input}
                  placeholder="Ex: Ler 30 minutos"
                  value={title}
                  onChangeText={setTitle}
                  maxLength={100}
               />
            </View>

            {/* Description Input */}
            <View style={styles.section}>
               <Text style={styles.sectionTitle}>Descrição</Text>
               <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Adicione uma descrição (opcional)"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                  maxLength={500}
               />
            </View>

            {/* Amount Input */}
            <View style={styles.section}>
               <Text style={styles.sectionTitle}>Quantidade</Text>
               <TextInput
                  style={styles.input}
                  placeholder="Ex: 0/50, 0/1, 0/3 pg"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="default"
               />
               <Text style={styles.hint}>
                  Formato: atual/total (ex: 0/50 ou 0/3 pg)
               </Text>
            </View>

            {/* Category Selector */}
            <View style={styles.section}>
               <Text style={styles.sectionTitle}>Categoria</Text>
               <View style={styles.categoryRow}>
                  {CATEGORIES.map((cat) => (
                     <TouchableOpacity
                        key={cat}
                        style={[
                           styles.categoryOption,
                           selectedCategory === cat &&
                              styles.categoryOptionSelected,
                        ]}
                        onPress={() => setSelectedCategory(cat)}
                     >
                        <Text
                           style={[
                              styles.categoryText,
                              selectedCategory === cat &&
                                 styles.categoryTextSelected,
                           ]}
                        >
                           {cat}
                        </Text>
                     </TouchableOpacity>
                  ))}
               </View>
            </View>

            {/* Time Selector */}
            <View style={styles.section}>
               <Text style={styles.sectionTitle}>Horário</Text>
               <View style={styles.categoryRow}>
                  {TIMES.map((time) => (
                     <TouchableOpacity
                        key={time}
                        style={[
                           styles.categoryOption,
                           selectedTime === time &&
                              styles.categoryOptionSelected,
                        ]}
                        onPress={() => setSelectedTime(time)}
                     >
                        <Text
                           style={[
                              styles.categoryText,
                              selectedTime === time &&
                                 styles.categoryTextSelected,
                           ]}
                        >
                           {time === 'morning'
                              ? 'Manhã'
                              : time === 'afternoon'
                                ? 'Tarde'
                                : time === 'night'
                                  ? 'Noite'
                                  : 'Qualquer hora'}
                        </Text>
                     </TouchableOpacity>
                  ))}
               </View>
            </View>

            {/* Date Input */}
            <View style={styles.section}>
               <Text style={styles.sectionTitle}>Data</Text>
               <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={selectedDate}
                  onChangeText={setSelectedDate}
                  keyboardType="default"
               />
               <Text style={styles.hint}>
                  Formato: YYYY-MM-DD (ex: {moment().format('YYYY-MM-DD')})
               </Text>
            </View>

            {/* Save Button */}
            <TouchableOpacity
               style={[styles.saveButton, loading && styles.saveButtonDisabled]}
               onPress={handleSave}
               disabled={loading}
            >
               <Text style={styles.saveButtonText}>
                  {loading ? 'Salvando...' : 'Salvar Hábito'}
               </Text>
            </TouchableOpacity>
         </ScrollView>
      </KeyboardAvoidingView>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: '#FAFAFA',
   },
   scrollView: {
      flex: 1,
   },
   scrollContent: {
      padding: 16,
      paddingBottom: 32,
   },
   header: {
      marginBottom: 24,
   },
   headerTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text.title,
   },
   section: {
      marginBottom: 24,
   },
   sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.title,
      marginBottom: 12,
   },
   emojiScroll: {
      marginHorizontal: -16,
      paddingHorizontal: 16,
   },
   emojiOption: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.gray[100],
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      borderWidth: 2,
      borderColor: 'transparent',
   },
   emojiOptionSelected: {
      borderColor: colors.primary,
      backgroundColor: '#F4E9FF',
   },
   emojiIcon: {
      fontSize: 24,
   },
   colorRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
   },
   colorOption: {
      width: 50,
      height: 50,
      borderRadius: 25,
      borderWidth: 2,
      borderColor: colors.gray[200],
      alignItems: 'center',
      justifyContent: 'center',
   },
   colorOptionSelected: {
      borderColor: colors.primary,
      borderWidth: 3,
   },
   input: {
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: colors.text.title,
      borderWidth: 1,
      borderColor: colors.gray[200],
   },
   textArea: {
      height: 100,
      textAlignVertical: 'top',
   },
   hint: {
      fontSize: 12,
      color: colors.text.body,
      marginTop: 6,
      fontStyle: 'italic',
   },
   categoryRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
   },
   categoryOption: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: colors.gray[100],
      borderWidth: 1,
      borderColor: colors.gray[200],
   },
   categoryOptionSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
   },
   categoryText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text.body,
   },
   categoryTextSelected: {
      color: 'white',
      fontWeight: '600',
   },
   saveButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
      elevation: 2,
      shadowColor: colors.primary,
      shadowOpacity: 0.3,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
   },
   saveButtonDisabled: {
      opacity: 0.6,
   },
   saveButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
   },
});

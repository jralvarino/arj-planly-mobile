import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { Habit } from '../../models/Habit';
import DatePicker from '../../components/DatePicker';
import MonthCalendarPicker from '../../components/MonthCalendarPicker';
import TimePicker from '../../components/TimePicker';
import { getAllCategories } from '../../service/categoryService';
import { getTaskById, updateTask } from '../../service/taskService';
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

const TIMES = ['morning', 'afternoon', 'night', 'anytime'];

const PERIOD_TYPES = [
   { value: 'every_day', label: 'Every Day' },
   { value: 'specific_days_week', label: 'Specific days of week' },
   { value: 'specific_days_month', label: 'Specific days of the month' },
];

const WEEK_DAYS = [
   { value: 0, label: 'Dom' },
   { value: 1, label: 'Seg' },
   { value: 2, label: 'Ter' },
   { value: 3, label: 'Qua' },
   { value: 4, label: 'Qui' },
   { value: 5, label: 'Sex' },
   { value: 6, label: 'Sáb' },
];

export default function HabitEditScreen() {
   const router = useRouter();
   const { id } = useLocalSearchParams<{ id: string }>();

   const [habit, setHabit] = useState<Habit | null>(null);
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);

   const habitId = useMemo(() => (id ? String(id) : ''), [id]);

   // Form state
   const [title, setTitle] = useState('');
   const [description, setDescription] = useState('');
   const [amount, setAmount] = useState('0/1');
   const [selectedEmoji, setSelectedEmoji] = useState('book');
   const [selectedColor, setSelectedColor] = useState(COLORS[0]);
   const [categories, setCategories] = useState<string[]>([]);
   const [selectedCategory, setSelectedCategory] = useState<string>('');
   const [selectedTime, setSelectedTime] = useState(TIMES[0]);
   const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
   const [notes, setNotes] = useState('');
   const [endDate, setEndDate] = useState('');
   const [notificationTime, setNotificationTime] = useState('');
   const [periodType, setPeriodType] = useState<'every_day' | 'specific_days_week' | 'specific_days_month'>('every_day');
   const [selectedWeekDays, setSelectedWeekDays] = useState<number[]>([]);
   const [selectedMonthDays, setSelectedMonthDays] = useState<number[]>([]);

   // Carregar categorias do banco de dados
   useFocusEffect(
      useCallback(() => {
         const loadCategories = async () => {
            try {
               const cats = await getAllCategories();
               const categoryNames = cats.map((c) => c.name);
               setCategories(categoryNames);
            } catch (error) {
               console.error('Error loading categories:', error);
            }
         };
         loadCategories();
      }, [])
   );

   useEffect(() => {
      const load = async () => {
         if (!habitId) return;
         setLoading(true);
         try {
            const h = await getTaskById(habitId);
            if (!h) {
               Alert.alert('Erro', 'Hábito não encontrado.');
               router.back();
               return;
            }
            setHabit(h);
            setTitle(h.title);
            setDescription(h.description || '');
            setAmount(h.amount || '0/1');
            setSelectedEmoji(h.emoji || 'book');
            setSelectedColor(h.color || COLORS[0]);
            setSelectedCategory(h.frequency || (categories.length > 0 ? categories[0] : ''));
            setSelectedTime(h.time || TIMES[0]);
            setSelectedDate(h.date || moment().format('YYYY-MM-DD'));
            setNotes(h.notes || '');
            setEndDate(h.end_date || '');
            setNotificationTime(h.notification_time || '');
            
            // Carregar período
            if (h.period_type) {
               setPeriodType(h.period_type);
               if (h.period_config) {
                  try {
                     const config = JSON.parse(h.period_config);
                     if (h.period_type === 'specific_days_week') {
                        setSelectedWeekDays(config.days || []);
                     } else if (h.period_type === 'specific_days_month') {
                        setSelectedMonthDays(config.days || []);
                     }
                  } catch (e) {
                     console.error('Error parsing period_config:', e);
                  }
               }
            }
         } catch (e) {
            console.error(e);
            Alert.alert('Erro', 'Falha ao carregar hábito.');
         } finally {
            setLoading(false);
         }
      };
      load();
   }, [habitId, router, categories]);

   const computeCompletedFromAmount = (nextAmount: string) => {
      const m = nextAmount.match(/^(\d+)\s*\/\s*(\d+)/);
      if (!m) return null;
      const cur = Number(m[1]);
      const tot = Number(m[2]);
      if (!Number.isFinite(cur) || !Number.isFinite(tot) || tot <= 0) return null;
      return cur >= tot;
   };

   const getPeriodConfig = () => {
      if (periodType === 'specific_days_week') {
         return JSON.stringify({ days: selectedWeekDays });
      } else if (periodType === 'specific_days_month') {
         return JSON.stringify({ days: selectedMonthDays });
      }
      return undefined;
   };

   const handleSave = async () => {
      if (!habit) return;
      if (!title.trim()) {
         Alert.alert('Erro', 'Título é obrigatório.');
         return;
      }

      setSaving(true);
      try {
         const completed = computeCompletedFromAmount(amount);
         const periodConfig = getPeriodConfig();
         
         const updated = await updateTask(habit.id, {
            title: title.trim(),
            description: description.trim(),
            amount,
            emoji: selectedEmoji,
            color: selectedColor,
            frequency: selectedCategory,
            time: selectedTime,
            date: selectedDate,
            notes: notes.trim() || undefined,
            end_date: endDate.trim() || undefined,
            notification_time: notificationTime.trim() || undefined,
            period_type: periodType,
            period_config: periodConfig,
            ...(completed === null ? {} : { completed }),
         });
         setHabit(updated);
         Alert.alert('Sucesso', 'Hábito atualizado.', [
            { text: 'OK', onPress: () => router.back() },
         ]);
      } catch (e) {
         console.error(e);
         Alert.alert('Erro', 'Não foi possível salvar.');
      } finally {
         setSaving(false);
      }
   };

   const toggleWeekDay = (day: number) => {
      if (selectedWeekDays.includes(day)) {
         setSelectedWeekDays(selectedWeekDays.filter((d) => d !== day));
      } else {
         setSelectedWeekDays([...selectedWeekDays, day].sort((a, b) => a - b));
      }
   };

   if (loading) {
      return (
         <View style={[styles.container, styles.center]}>
            <Text>Carregando...</Text>
         </View>
      );
   }

   if (!habit) {
      return (
         <View style={[styles.container, styles.center]}>
            <Text>Hábito não encontrado.</Text>
         </View>
      );
   }

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
            {/* Seção: Informações Básicas */}
            <View style={styles.sectionCard}>
               <Text style={styles.sectionHeader}>Informações Básicas</Text>

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
            </View>

            {/* Seção: Configuração */}
            <View style={styles.sectionCard}>
               <Text style={styles.sectionHeader}>Configuração</Text>

               {/* Category Selector */}
               <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Categoria</Text>
                  <View style={styles.categoryRow}>
                     {categories.map((cat: string) => (
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
            </View>

            {/* Seção: Período e Datas */}
            <View style={styles.sectionCard}>
               <Text style={styles.sectionHeader}>Período e Datas</Text>

               {/* Period Type Selector */}
               <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Período</Text>
                  <ScrollView
                     horizontal
                     showsHorizontalScrollIndicator={false}
                     style={styles.periodScroll}
                  >
                     {PERIOD_TYPES.map((period) => (
                        <TouchableOpacity
                           key={period.value}
                           style={[
                              styles.periodOption,
                              periodType === period.value &&
                                 styles.periodOptionSelected,
                           ]}
                           onPress={() => setPeriodType(period.value)}
                        >
                           <Text
                              style={[
                                 styles.periodText,
                                 periodType === period.value &&
                                    styles.periodTextSelected,
                              ]}
                           >
                              {period.label}
                           </Text>
                        </TouchableOpacity>
                     ))}
                  </ScrollView>

                  {/* Specific days of week */}
                  {periodType === 'specific_days_week' && (
                     <View style={styles.conditionalSection}>
                        <Text style={styles.conditionalTitle}>
                           Selecione os dias da semana:
                        </Text>
                        <View style={styles.weekDaysRow}>
                           {WEEK_DAYS.map((day) => {
                              const isSelected = selectedWeekDays.includes(
                                 day.value
                              );
                              return (
                                 <TouchableOpacity
                                    key={day.value}
                                    style={[
                                       styles.weekDayButton,
                                       isSelected &&
                                          styles.weekDayButtonSelected,
                                    ]}
                                    onPress={() => toggleWeekDay(day.value)}
                                 >
                                    <Text
                                       style={[
                                          styles.weekDayText,
                                          isSelected &&
                                             styles.weekDayTextSelected,
                                       ]}
                                    >
                                       {day.label}
                                    </Text>
                                 </TouchableOpacity>
                              );
                           })}
                        </View>
                     </View>
                  )}

                  {/* Specific days of month */}
                  {periodType === 'specific_days_month' && (
                     <View style={styles.conditionalSection}>
                        <Text style={styles.conditionalTitle}>
                           Selecione os dias do mês:
                        </Text>
                        <MonthCalendarPicker
                           selectedDays={selectedMonthDays}
                           onDaysChange={setSelectedMonthDays}
                        />
                     </View>
                  )}

               </View>

               {/* Date Input */}
               <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Data Inicial</Text>
                  <DatePicker
                     value={selectedDate}
                     onChange={setSelectedDate}
                     placeholder="Selecione a data inicial"
                  />
               </View>

               {/* End Date Input */}
               <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Data Final (opcional)</Text>
                  <DatePicker
                     value={endDate}
                     onChange={setEndDate}
                     placeholder="Selecione a data final"
                     minimumDate={selectedDate}
                  />
                  <Text style={styles.hint}>
                     Se não informada, os hábitos serão criados até 3 meses à
                     frente
                  </Text>
               </View>
            </View>

            {/* Seção: Notificações */}
            <View style={styles.sectionCard}>
               <Text style={styles.sectionHeader}>Notificações</Text>

               {/* Notification Time Input */}
               <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                     Horário de Notificação (opcional)
                  </Text>
                  <TimePicker
                     value={notificationTime}
                     onChange={setNotificationTime}
                     placeholder="Selecione o horário"
                  />
                  <Text style={styles.hint}>
                     Horário para receber notificação de lembrete do hábito
                  </Text>
               </View>
            </View>

            {/* Seção: Observações */}
            <View style={styles.sectionCard}>
               <Text style={styles.sectionHeader}>Observações</Text>

               {/* Notes Input */}
               <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Notas</Text>
                  <TextInput
                     style={[styles.input, styles.textArea]}
                     placeholder="Adicione observações sobre este hábito (opcional)"
                     value={notes}
                     onChangeText={setNotes}
                     multiline
                     numberOfLines={3}
                     maxLength={500}
                  />
                  <Text style={styles.hint}>
                     Informações adicionais sobre o hábito
                  </Text>
               </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
               style={[styles.saveButton, saving && styles.saveButtonDisabled]}
               onPress={handleSave}
               disabled={saving}
            >
               <Text style={styles.saveButtonText}>
                  {saving ? 'Salvando...' : 'Salvar Hábito'}
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
   center: {
      justifyContent: 'center',
      alignItems: 'center',
   },
   scrollView: {
      flex: 1,
   },
   scrollContent: {
      padding: 16,
      paddingBottom: 32,
   },
   sectionCard: {
      backgroundColor: colors.gray[100],
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      ...Platform.select({
         ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
         },
         android: {
            elevation: 1,
         },
      }),
   },
   sectionHeader: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text.title,
      marginBottom: 16,
      paddingBottom: 8,
      borderBottomWidth: 2,
      borderBottomColor: colors.primary,
   },
   section: {
      marginBottom: 20,
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
   periodScroll: {
      marginHorizontal: -16,
      paddingHorizontal: 16,
   },
   periodOption: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: colors.gray[100],
      borderWidth: 1,
      borderColor: colors.gray[200],
      marginRight: 8,
   },
   periodOptionSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
   },
   periodText: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.text.body,
   },
   periodTextSelected: {
      color: 'white',
      fontWeight: '600',
   },
   conditionalSection: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.gray[200],
   },
   conditionalTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.title,
      marginBottom: 12,
   },
   weekDaysRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
   },
   weekDayButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: colors.gray[100],
      borderWidth: 1,
      borderColor: colors.gray[200],
   },
   weekDayButtonSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
   },
   weekDayText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text.body,
   },
   weekDayTextSelected: {
      color: 'white',
      fontWeight: '600',
   },
   numberInput: {
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: colors.text.title,
      borderWidth: 1,
      borderColor: colors.gray[200],
   },
});

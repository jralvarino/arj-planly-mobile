import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from 'expo-router';
import moment from 'moment';
import React, { useRef, useState } from 'react';

import {
   Dimensions,
   SafeAreaView,
   ScrollView,
   StyleSheet,
   TouchableOpacity,
   TouchableWithoutFeedback,
   View,
} from 'react-native';
import Emoji from 'react-native-emoji';
import { Text } from 'react-native-paper';
import Swiper from 'react-native-swiper';

const { width } = Dimensions.get('window');

/** -------------
 * Função para escurecer a cor original (50% mais forte)
 * -------------- */
// Função auxiliar para converter HEX em RGB
function hexToRgb(hex) {
   hex = hex.replace(/^#/, '');
   if (hex.length === 3) {
      hex = hex
         .split('')
         .map((x) => x + x)
         .join('');
   }
   const num = parseInt(hex, 16);
   return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
   };
}

// Converter RGB para HSL
function rgbToHsl(r, g, b) {
   r /= 255;
   g /= 255;
   b /= 255;
   const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
   let h,
      s,
      l = (max + min) / 2;

   if (max === min) {
      h = s = 0; // cinza
   } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
         case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
         case g:
            h = (b - r) / d + 2;
            break;
         case b:
            h = (r - g) / d + 4;
            break;
      }
      h /= 6;
   }
   return { h, s, l };
}

// Converter HSL para RGB
function hslToRgb(h, s, l) {
   let r, g, b;

   if (s === 0) {
      r = g = b = l; // cinza
   } else {
      const hue2rgb = (p, q, t) => {
         if (t < 0) t += 1;
         if (t > 1) t -= 1;
         if (t < 1 / 6) return p + (q - p) * 6 * t;
         if (t < 1 / 2) return q;
         if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
         return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
   }

   return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
   };
}

// Converter RGB para HEX
function rgbToHex(r, g, b) {
   return (
      '#' +
      [r, g, b]
         .map((x) => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
         })
         .join('')
   );
}

//calendario
// Converte HEX → {r,g,b}
function hexToRgbSimple(hex) {
   hex = hex.replace('#', '');
   const bigint = parseInt(hex, 16);
   return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
   };
}

// RGB → HEX
function rgbToHexSimple({ r, g, b }) {
   return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

/**
 * Mistura 2 cores
 * amount = 0 → corA
 * amount = 1 → corB
 */
function mixColor(colorA, colorB, amount) {
   const a = hexToRgbSimple(colorA);
   const b = hexToRgbSimple(colorB);

   return rgbToHexSimple({
      r: Math.round(a.r + (b.r - a.r) * amount),
      g: Math.round(a.g + (b.g - a.g) * amount),
      b: Math.round(a.b + (b.b - a.b) * amount),
   });
}

/**
 * ★ NOVA FUNÇÃO:
 * Deixa a cor mais forte conforme o número de hábitos completos
 *
 * completed = quantos hábitos completos no dia
 * total      = habits.length
 */
export function getCalendarColor(baseColor, completed, total) {
   if (total === 0) return baseColor;

   const intensity = completed / total; // 0 → 1

   // 0 = original, 1 = MUITO mais forte
   const MAX_STRENGTH = 0.6; // ajuste aqui (0.3 para suave, 1 para máximo)

   const amount = intensity * MAX_STRENGTH;

   return mixColor(baseColor, '#000000', amount);
}

// Função principal: deixar a cor mais forte
export function makeColorStronger(hexColor) {
   const { r, g, b } = hexToRgb(hexColor);
   let { h, s, l } = rgbToHsl(r, g, b);

   // Aumenta saturação em 20% (sem passar de 1)
   s = Math.min(1, s * 1.2);

   // Diminui a luminosidade em 10% (sem passar de 0)
   l = Math.max(0, l * 0.9);

   const { r: nr, g: ng, b: nb } = hslToRgb(h, s, l);
   return rgbToHex(nr, ng, nb);
}

export function getCalendarColorByHabits(baseColor, completed, total) {
   if (total === 0 || completed === 0) return 'white';

   if (total === completed) {
      return '#59008c';
   }

   const range = completed / total; // 0 → 1

   // Converte a cor base
   const { r, g, b } = hexToRgb(baseColor);
   let { h, s, l } = rgbToHsl(r, g, b);

   // AUMENTO progressivo da saturação
   s = Math.min(1, s + range * 0.6);

   // DIMINUI levemente a luminosidade quanto mais completo
   l = Math.max(0, l - range * 0.25);

   const { r: nr, g: ng, b: nb } = hslToRgb(h, s, l);
   return rgbToHex(nr, ng, nb);
}

function headerTitleComponent(date) {
   // Normaliza tudo para "YYYY-MM-DD"
   const today = moment().format('YYYY-MM-DD');
   const yesterday = moment().subtract(1, 'day').format('YYYY-MM-DD');
   const tomorrow = moment().add(1, 'day').format('YYYY-MM-DD');

   let selectedDate = "Today's";

   if (date) {
      if (date === today) {
         selectedDate = "Today's";
      } else if (date === yesterday) {
         selectedDate = "Yesterday's";
      } else if (date === tomorrow) {
         selectedDate = "Tomorrow's";
      } else {
         selectedDate = moment(date).format('MMMM D')
      }
   }

   return selectedDate;
}

export default function HomeScreen() {
   const [habits, setHabits] = useState([
      {
         id: 'h1',
         title: 'Anki',
         amount: '0/50',
         streakCount: 1,
         frequency: 'English',
         completed: true,
         color: '#f3eafe',
         description: 'asdfg',
         streak_count: '1',
         emoji: 'book',
         time: '22:00',
         date: '2025-12-01',
      },
      {
         id: 'h2',
         title: 'Serie com legendas em Inglês',
         amount: '0/1',
         streakCount: 3,
         frequency: 'English',
         completed: true,
         color: '#D8FFFB',
         description: 'arrewerwef',
         streak_count: '5',
         emoji: 'camera',
         time: 'night',
         date: '2025-12-02',
      },
      {
         id: 'h3',
         title: 'Academia',
         amount: '0/1',
         streakCount: 3,
         frequency: 'Healthy',
         completed: false,
         color: '#d6fce9',
         description: 'arrewerwef',
         streak_count: '30',
         emoji: 'airplane',
         time: 'anytime',
         date: '2025-12-02',
      },
      {
         id: 'h4',
         title: 'Kindle',
         amount: '0/3 pg',
         streakCount: 3,
         frequency: 'English',
         completed: true,
         color: '#ffe4e6',
         description: 'arrewerwef',
         streak_count: '100',
         emoji: 'tv',
         time: 'anytime',
         date: '2025-11-25',
      },
      {
         id: 'h5',
         title: 'asdf',
         amount: '0/3 pg',
         streakCount: 3,
         frequency: 'Home',
         completed: false,
         color: '#ffe4e6',
         description: 'arrewerwef',
         streak_count: '100',
         emoji: 'tv',
         time: 'anytime',
         date: '2025-11-30',
      },
      {
         id: 'h6',
         title: 'asdf 1',
         amount: '0/3 pg',
         streakCount: 3,
         frequency: 'Home',
         completed: true,
         color: '#ffe4e6',
         description: 'arrewerwef',
         streak_count: '100',
         emoji: 'tv',
         time: 'anytime',
         date: '2025-11-30',
      },
   ]);
   const navigation = useNavigation();

   const swiper = useRef(null);
   const contentSwiper = useRef(null);
   const [week, setWeek] = useState(0);
   const [value, setValue] = useState(new Date());
   const [filteredHabits, setFilteredHabits] = useState(habits);

   /** Toggle usando o ID */
   const onToggle = (id) => {
      setHabits((prev) =>
         prev.map((h) => {
            if (h.id === id) {
               if (!h.completed) {
                  Haptics.notificationAsync(
                     Haptics.NotificationFeedbackType.Success
                  );
               }
               return { ...h, completed: !h.completed };
            }
            return h;
         })
      );
   };

   /** Semanas */
   const weeks = React.useMemo(() => {
      const start = moment().add(week, 'weeks').startOf('week');
      return [-1, 0, 1].map((adj) =>
         Array.from({ length: 7 }).map((_, index) => {
            const date = moment(start).add(adj, 'week').add(index, 'day');
            return { weekday: date.format('ddd'), date: date.toDate() };
         })
      );
   }, [week]);

   /** Dias anteriores / atual / posterior */
   const days = React.useMemo(() => {
      return [
         moment(value).subtract(1, 'day').toDate(),
         value,
         moment(value).add(1, 'day').toDate(),
      ];
   }, [value]);

   const selectedDay = moment(value).format('YYYY-MM-DD');

   const habitsOfDay = habits.filter((h) => h.date === selectedDay);

   const completedToday = habitsOfDay.filter((h) => h.completed).length;
   const totalToday = habitsOfDay.length;

   const dayColor = getCalendarColorByHabits(
      '#F4E9FF',
      completedToday,
      totalToday
   );

   const [selectedFilter, setSelectedFilter] = useState(null);

   const categories = ['English', 'Health', 'Home'];

   function filterHabitsByDate(date) {
      const target = moment(date).format('YYYY-MM-DD');

      const filtered = habits.filter((h) => h.date === target);

      setFilteredHabits(filtered);
   }

   function isDayComplete(date) {
      const selectedDay = moment(date).format('YYYY-MM-DD');

      const habitsOfDay = habits.filter(
         (h) => moment(h.date).format('YYYY-MM-DD') === selectedDay
      );

      if (habitsOfDay.length === 0) return false; // sem hábitos no dia → sem estrela

      return habitsOfDay.every((h) => h.completed);
   }

   const isToday = (day) => moment(day).isSame(moment(), 'day');

   const getDayColor = (date) => {
      const selectedDay = moment(date).format('YYYY-MM-DD');

      const habitsOfDay = habits.filter(
         (h) => moment(h.date).format('YYYY-MM-DD') === selectedDay
      );
      const habitsCompletedToday = habitsOfDay.filter(
         (h) => h.completed === true
      );

      const colorOfTheDay = getCalendarColorByHabits(
         '#F4E9FF',
         habitsCompletedToday.length,
         habitsOfDay.length
      );

      return colorOfTheDay;
   };

   return (
      <SafeAreaView style={{ flex: 1 }}>
         <View style={styles.container}>
            {/* ============================
               CALENDÁRIO
            ============================= */}
            <View style={styles2.picker}>
               <Swiper
                  index={1}
                  ref={swiper}
                  loop={false}
                  showsPagination={false}
                  onIndexChanged={(ind) => {
                     if (ind === 1) return;
                     const index = ind - 1;
                     setValue(moment(value).add(index, 'week').toDate());
                     setTimeout(() => {
                        setWeek((w) => w + index);
                        swiper.current.scrollTo(1, false);
                     }, 10);
                  }}
               >
                  {weeks.map((dates, index) => (
                     <View style={styles2.itemRow} key={index}>
                        {dates.map((item, dateIndex) => {
                           const isActive =
                              value.toDateString() === item.date.toDateString();
                           return (
                              <TouchableWithoutFeedback
                                 key={dateIndex}
                                 onPress={() => {
                                    setValue(item.date);
                                    filterHabitsByDate(item.date);
                                    navigation.setOptions({
                                       headerTitle: headerTitleComponent(
                                          moment(item.date).format('YYYY-MM-DD')
                                       ),
                                    });
                                 }}
                              >
                                 <View
                                    style={[
                                       styles2.item,
                                       {
                                          backgroundColor: getDayColor(
                                             item.date
                                          ),
                                          borderColor: isToday(item.date)
                                             ? '#ff6b00'
                                             : isActive
                                               ? '#59008c'
                                               : isDayComplete(item.date)
                                                 ? '#59008c'
                                                 : 'lightgrey',
                                       },
                                    ]}
                                 >
                                    {isDayComplete(item.date) && (
                                       <MaterialCommunityIcons
                                          name="crown"
                                          size={10}
                                          color="yellow"
                                          style={{
                                             position: 'absolute',
                                             top: 0,
                                             right: 1,
                                          }}
                                       />
                                    )}

                                    <Text
                                       style={[
                                          styles2.itemWeekday,
                                          {
                                             color: isDayComplete(item.date)
                                                ? 'white'
                                                : 'black',
                                          },
                                       ]}
                                    >
                                       {item.weekday}
                                    </Text>

                                    <Text
                                       style={[
                                          styles2.itemDate,
                                          {
                                             color: isDayComplete(item.date)
                                                ? 'white'
                                                : 'black',
                                          },
                                       ]}
                                    >
                                       {item.date.getDate()}
                                    </Text>
                                 </View>
                              </TouchableWithoutFeedback>
                           );
                        })}
                     </View>
                  ))}
               </Swiper>
            </View>

            <View>
               {/* ============================
   FILTROS DE CATEGORIA
============================= */}
               <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{
                     paddingHorizontal: 10,
                     marginTop: 4,
                  }}
               >
                  <View style={{ flexDirection: 'row', gap: 5 }}>
                     {categories.map((cat) => {
                        const isActive = selectedFilter === cat;
                        return (
                           <TouchableOpacity
                              key={cat}
                              onPress={() =>
                                 setSelectedFilter(isActive ? null : cat)
                              }
                              style={[
                                 stylesFilter.tag,
                                 isActive && stylesFilter.tagActive,
                              ]}
                           >
                              <Text
                                 style={[
                                    stylesFilter.tagText,
                                    isActive && stylesFilter.tagTextActive,
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

            {/* ============================
               PÁGINAS (ontem / hoje / amanhã)
            ============================= */}
            <Swiper
               index={1}
               ref={contentSwiper}
               loop={false}
               showsPagination={false}
               onIndexChanged={(ind) => {
                  if (ind === 1) return;
                  setTimeout(() => {
                     const nextValue = moment(value).add(ind - 1, 'days');
                     if (moment(value).week() !== nextValue.week()) {
                        setWeek((w) =>
                           moment(value).isBefore(nextValue) ? w + 1 : w - 1
                        );
                     }
                     setValue(nextValue.toDate());
                     contentSwiper.current.scrollTo(1, false);
                  }, 10);
               }}
            >
               {days.map((day, index) => (
                  <View key={index} style={pageStyles.page}>
                     <ScrollView showsVerticalScrollIndicator={false}>
                        {habitsOfDay
                           .filter(
                              (h) =>
                                 !selectedFilter ||
                                 h.frequency === selectedFilter
                           )
                           .filter(
                              (h) =>
                                 !selectedFilter ||
                                 h.frequency === selectedFilter
                           )
                           .map((habit) => {
                              const initialColor = habit.color;
                              const checkedColor = makeColorStronger(
                                 habit.color
                              );

                              return (
                                 <View style={styles3.container} key={habit.id}>
                                    <View
                                       style={[
                                          styles3.card,
                                          {
                                             backgroundColor: habit.completed
                                                ? checkedColor
                                                : initialColor,
                                          },
                                       ]}
                                    >
                                       {/* Emoji */}
                                       <View style={styles3.colEmoji}>
                                          <Emoji
                                             style={styles3.emoji}
                                             name={habit.emoji}
                                          />
                                       </View>

                                       {/* Título + Tags */}
                                       <View style={styles3.colText}>
                                          <Text style={styles3.title}>
                                             {habit.title}
                                          </Text>

                                          <View style={styles3.tagsRow}>
                                             <View style={styles3.tag}>
                                                <Text style={styles3.tagText}>
                                                   {habit.amount}
                                                </Text>
                                             </View>

                                             <View style={styles3.tag}>
                                                <Text style={styles3.tagText}>
                                                   {habit.time}
                                                </Text>
                                             </View>
                                          </View>
                                       </View>

                                       {/* BOTÃO DE CHECK */}
                                       <TouchableOpacity
                                          style={styles3.colButton}
                                          onPress={() => onToggle(habit.id)}
                                       >
                                          <View
                                             style={[
                                                styles3.checkButton,
                                                habit.completed &&
                                                   styles3.checkButtonOn,
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
                                 </View>
                              );
                           })}
                     </ScrollView>
                  </View>
               ))}
            </Swiper>
         </View>
      </SafeAreaView>
   );
}
const styles3 = StyleSheet.create({
   container: {
      paddingHorizontal: 2,
   },

   card: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 7,
      borderRadius: 12,
      gap: 7,
      marginBottom: 12,

      // Sombra suave
      elevation: 4,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 5,
      shadowOffset: { width: 0, height: 2 },
   },

   // 👉 Cor inicial super clara
   cardInitial: {
      backgroundColor: '#E7F2FF',
   },

   // 👉 Cor mais forte quando concluído
   cardChecked: {
      backgroundColor: '#BBDFFF',
   },

   colEmoji: {
      width: 40,
      alignItems: 'center',
      justifyContent: 'center',
   },

   emoji: {
      fontSize: 20,
   },

   colText: {
      flex: 1,
   },

   title: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 6,
   },

   /** TAGS */
   tagsRow: {
      flexDirection: 'row',
      gap: 5,
   },

   tag: {
      backgroundColor: 'rgba(0,0,0,0.06)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
   },

   tagText: {
      fontSize: 9,
      color: '#333',
      fontWeight: '500',
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
});

const styles = StyleSheet.create({
   teste: {
      flexDirection: 'column',
   },
   container: {
      flex: 1,
      paddingVertical: 1,
      backgroundColor: 'white',
   },

   card: {
      marginBottom: 12,
      borderRadius: 15,
      shadowRadius: 20,
      elevation: 9,
   },
   cardCheck: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginRight: 12,
   },
   cardCompleted: {
      opacity: 0.4,
   },
   notCompleted: {
      opacity: 1,
   },
   cardContent: {
      padding: 5,
   },
   cardTitle: {
      fontSize: 12,
      fontWeight: 'bold',
      marginTop: 5,
      marginBottom: 2,
      marginLeft: 10,
      color: 'black',
   },
   cardDescription: {
      fontSize: 9,
      marginBottom: 7,
      color: '#6c6c80',
      marginLeft: 10,
      borderWidth: 0.2,
      borderColor: 'lightgrey',
      borderRadius: 12,
      paddingHorizontal: 7,
      paddingVertical: 2,
      alignItems: 'center',
   },
   cardFooter: {
      flexDirection: 'row',
      gap: 3,
      alignItems: 'center',
   },
   streakBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff3e0',
      borderRadius: 12,
      paddingHorizontal: 7,
      paddingVertical: 1,
      marginLeft: 10,
   },
   checkUncheck: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'green',
      borderRadius: 20,
      paddingHorizontal: 5,
      paddingVertical: 4,
      marginLeft: 10,
      borderColor: 'lightgrey',
      borderWidth: 0.2,
   },
   streakText: {
      marginLeft: 1,
      color: '#ff9800',
      fontWeight: 'bold',
      fontSize: 10,
   },
   frequencyBadge: {
      backgroundColor: '#ede7f6',
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 3,
   },
   frequencyText: {
      color: '#7c4dff',
      fontWeight: 'bold',
      fontSize: 10,
   },
});

const styles2 = StyleSheet.create({
   container: {
      flex: 1,
      paddingVertical: 24,
   },
   header: {
      paddingHorizontal: 16,
   },
   title: {
      fontSize: 32,
      fontWeight: '700',
      color: '#1d1d1d',
      marginBottom: 12,
   },
   picker: {
      flex: 1,
      maxHeight: 74,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
   },
   subtitle: {
      fontSize: 17,
      fontWeight: '600',
      color: '#999999',
      marginBottom: 12,
   },
   footer: {
      marginTop: 'auto',
      paddingHorizontal: 16,
   },
   /** Item */
   item: {
      flex: 1,
      position: 'relative',
      height: 50,
      marginHorizontal: 4,
      paddingVertical: 6,
      paddingHorizontal: 4,
      borderWidth: 1,
      borderRadius: 8,
      borderColor: '#e3e3e3',
      flexDirection: 'column',
      alignItems: 'center',
   },
   itemRow: {
      width: width,
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      paddingHorizontal: 3,
   },
   itemWeekday: {
      fontSize: 13,
      fontWeight: '500',
      color: '#737373',
      marginBottom: 4,
   },
   itemDate: {
      fontSize: 15,
      fontWeight: '600',
      color: '#111',
   },
   /** Placeholder */
   placeholder: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 0,
      height: 400,
      marginTop: 0,
      padding: 0,
      backgroundColor: 'transparent',
   },
   placeholderInset: {
      borderWidth: 4,
      borderColor: '#e5e7eb',
      borderStyle: 'dashed',
      borderRadius: 9,
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 0,
   },
   /** Button */
   btn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderWidth: 1,
      backgroundColor: '#007aff',
      borderColor: '#007aff',
   },
   btnText: {
      fontSize: 18,
      lineHeight: 26,
      fontWeight: '600',
      color: '#fff',
   },
});

/* ===================================
   ESTILOS DA PÁGINA
=================================== */
const pageStyles = StyleSheet.create({
   page: {
      flex: 1,
      paddingHorizontal: 9,
      paddingVertical: 18,
   },
});

const stylesFilter = StyleSheet.create({
   tag: {
      backgroundColor: 'rgba(0,0,0,0.06)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      alignSelf: 'center',
   },

   tagActive: {
      backgroundColor: '#59008c',
   },
   tagText: {
      fontSize: 10,
      color: '#333',
      fontWeight: '500',
   },

   tagTextActive: {
      color: 'white',
      fontWeight: '600',
   },
});

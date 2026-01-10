import moment from 'moment';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import Swiper from 'react-native-swiper';
import { Habit } from '../models/Habit';
import EmptyState from './EmptyState';
import HabitCard from './HabitCard';

const { width, height } = Dimensions.get('window');

// Cores dos confetes
const CONFETTI_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];

interface Confetti {
   id: number;
   color: string;
   x: Animated.Value;
   y: Animated.Value;
   rotation: Animated.Value;
   scale: Animated.Value;
   shape: 'square' | 'circle';
   size: number;
}

interface HabitsListProps {
   value: Date;
   habits: Habit[];
   selectedFilter: string | null;
   onToggle: (id: string) => void;
   onDayChange: (index: number) => void;
   onWeekChange: (delta: number) => void;
   onUpdateAmount?: (habitId: string, newAmount: string) => Promise<void>;
   onSkip?: (habitId: string, reason: string) => Promise<void>;
}

export default function HabitsList({
   value,
   habits,
   selectedFilter,
   onToggle,
   onDayChange,
   onWeekChange,
   onUpdateAmount,
   onSkip,
}: HabitsListProps) {
   const contentSwiper = useRef<any>(null);
   const [confetti, setConfetti] = useState<Confetti[]>([]);
   const confettiIdRef = useRef(0);

   const days = React.useMemo(() => {
      return [
         moment(value).subtract(1, 'day').toDate(),
         value,
         moment(value).add(1, 'day').toDate(),
      ];
   }, [value]);

   // Verificar se todos os hábitos do dia atual estão completos
   const allCompleted = useMemo(() => {
      const dayString = moment(value).format('YYYY-MM-DD');
      const dayHabits = habits
         .filter((h) => h.date === dayString)
         .filter(
            (h) => !selectedFilter || h.frequency === selectedFilter
         );

      if (dayHabits.length === 0) {
         return false;
      }

      return dayHabits.every((h) => h.completed && !h.skipped);
   }, [value, habits, selectedFilter]);

   // Criar confetes quando todos os hábitos estiverem completos
   useEffect(() => {
      if (allCompleted && confetti.length === 0) {
         const newConfetti: Confetti[] = [];
         
         // Criar 80 confetes
         for (let i = 0; i < 80; i++) {
            const id = confettiIdRef.current++;
            const startX = Math.random() * width;
            const startY = -50;
            const endY = height + 100;
            const duration = 2000 + Math.random() * 2000; // 2-4 segundos
            const delay = Math.random() * 500;
            const shape = Math.random() > 0.5 ? 'square' : 'circle';
            const size = 8 + Math.random() * 8; // 8-16px

            const x = new Animated.Value(startX);
            const y = new Animated.Value(startY);
            const rotation = new Animated.Value(0);
            const scale = new Animated.Value(0);

            // Animação de queda com movimento horizontal (efeito de vento)
            const xMovement = (Math.random() - 0.5) * 300;
            const rotationSpeed = 500 + Math.random() * 1000;
            
            Animated.parallel([
               Animated.timing(y, {
                  toValue: endY,
                  duration,
                  delay,
                  useNativeDriver: true,
               }),
               Animated.timing(x, {
                  toValue: startX + xMovement,
                  duration,
                  delay,
                  useNativeDriver: true,
               }),
               Animated.loop(
                  Animated.timing(rotation, {
                     toValue: 1,
                     duration: rotationSpeed,
                     useNativeDriver: true,
                  })
               ),
               Animated.sequence([
                  Animated.spring(scale, {
                     toValue: 1,
                     tension: 50,
                     friction: 3,
                     delay,
                     useNativeDriver: true,
                  }),
                  Animated.timing(scale, {
                     toValue: 0.9,
                     duration: duration - 500,
                     useNativeDriver: true,
                  }),
               ]),
            ]).start();

            newConfetti.push({
               id,
               color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
               x,
               y,
               rotation,
               scale,
               shape,
               size,
            });
         }

         setConfetti(newConfetti);

         // Limpar confetes após 5 segundos
         setTimeout(() => {
            setConfetti([]);
         }, 5000);
      } else if (!allCompleted) {
         setConfetti([]);
      }
   }, [allCompleted, confetti.length]);

   return (
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
                  const delta = moment(value).isBefore(nextValue) ? 1 : -1;
                  onWeekChange(delta);
               }
               onDayChange(ind - 1);
               contentSwiper.current?.scrollTo(1, false);
            }, 10);
         }}
      >
         {days.map((day, index) => {
            const dayString = moment(day).format('YYYY-MM-DD');
            const dayHabits = habits
               .filter((h) => h.date === dayString)
               .filter(
                  (h) => !selectedFilter || h.frequency === selectedFilter
               );

            const isCurrentDay = index === 1;

            return (
               <View key={index} style={styles.page}>
                  {isCurrentDay && confetti.length > 0 && (
                     <View style={styles.confettiContainer} pointerEvents="none">
                        {confetti.map((c) => (
                           <Animated.View
                              key={c.id}
                              style={[
                                 styles.confetti,
                                 c.shape === 'circle' ? styles.confettiCircle : styles.confettiSquare,
                                 {
                                    backgroundColor: c.color,
                                    width: c.size,
                                    height: c.size,
                                    transform: [
                                       { translateX: c.x },
                                       { translateY: c.y },
                                       {
                                          rotate: c.rotation.interpolate({
                                             inputRange: [0, 1],
                                             outputRange: ['0deg', '360deg'],
                                          }),
                                       },
                                       { scale: c.scale },
                                    ],
                                 },
                              ]}
                           />
                        ))}
                     </View>
                  )}
                  <ScrollView
                     showsVerticalScrollIndicator={false}
                     contentContainerStyle={
                        dayHabits.length === 0 ? styles.emptyContainer : undefined
                     }
                  >
                     {dayHabits.length === 0 ? (
                        <EmptyState
                           message="Nenhum hábito para este dia!"
                           icon="calendar-blank-outline"
                        />
                     ) : (
                        dayHabits.map((habit) => (
                           <HabitCard
                              key={habit.id}
                              habit={habit}
                              onToggle={onToggle}
                              onUpdateAmount={onUpdateAmount}
                              onSkip={onSkip}
                           />
                        ))
                     )}
                  </ScrollView>
               </View>
            );
         })}
      </Swiper>
   );
}

const styles = StyleSheet.create({
   page: {
      flex: 1,
      paddingHorizontal: 8,
      paddingVertical: 18,
   },
   emptyContainer: {
      flexGrow: 1,
   },
   confettiContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      elevation: 1000,
   },
   confetti: {
      position: 'absolute',
   },
   confettiSquare: {
      borderRadius: 2,
   },
   confettiCircle: {
      borderRadius: 50,
   },
});


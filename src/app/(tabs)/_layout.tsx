import { Ionicons } from '@expo/vector-icons';
import { router, Tabs, useLocalSearchParams } from 'expo-router';
import moment from 'moment';
import { Pressable, Text, View } from 'react-native';

import { styles } from '@/styles/tabs.styles';

function HeaderTitleComponent() {
   const { date } = useLocalSearchParams();

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
         selectedDate = moment(date).format('MMMM D');
      }
   }

   return (
      <View
         style={{ flexDirection: 'row', alignItems: 'center', marginTop: 1 }}
      >
         <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
            {selectedDate} Habits
         </Text>
      </View>
   );
}

export default function TabsLayout() {
   const successfulDays = 12;

   return (
      <Tabs
         screenOptions={{
            tabBarShowLabel: false,
            tabBarStyle: styles.tabBar,
         }}
      >
         <Tabs.Screen
            name="add"
            options={{
               // Esconde a tab bar na tela de cadastro
               tabBarStyle: { display: 'none' },
               headerTitle: 'Novo hábito',
               headerLeft: () => (
                  <Pressable
                     onPress={() => router.replace('/(tabs)')}
                     hitSlop={12}
                     style={{ marginLeft: 12 }}
                  >
                     <Ionicons name="chevron-back" size={24} color="#111" />
                  </Pressable>
               ),
               tabBarIcon: ({ focused, color }) => (
                  <View >
                     <Ionicons name={'add'} size={24} color={focused ? '#59008c' : 'gray'} />
                  </View>
               ),
            }}
         />

         <Tabs.Screen
            name="index"
            options={{
               headerTitle: () => <HeaderTitleComponent />,
               headerRight: () => (
                  <View
                     style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginRight: 17,
                        marginTop: 9,
                     }}
                  >
                     <Ionicons name="flame" size={16} color="#ff6b00" />
                     <Text
                        style={{
                           marginLeft: 1,
                           fontSize: 14,
                           fontWeight: '600',
                           color: '#ff6b00',
                        }}
                     >
                        {successfulDays}
                     </Text>
                  </View>
               ),
               tabBarIcon: ({ focused, color }) => (
                  <View>
                     <Ionicons
                        name={focused ? 'list' : 'list-outline'}
                        size={24}
                        color={focused ? '#59008c' : 'gray'}
                     />
                  </View>
               ),
            }}
         />



         <Tabs.Screen
            name="rating"
            options={{
               headerTitle: 'Resumo',
               tabBarIcon: ({ focused, color }) => (
                  <View>
                     <Ionicons
                        name={focused ? 'calendar' : 'calendar-outline'}
                        size={24}
                        color={focused ? '#59008c' : 'gray'}
                     />
                  </View>
               ),
            }}
         />

         <Tabs.Screen
            name="categories"
            options={{
               headerTitle: 'Categorias',
               headerRight: () => (
                  <Pressable
                     onPress={() => router.push('/categories/new')}
                     hitSlop={12}
                     style={{ marginRight: 12 }}
                  >
                     <Ionicons name="add" size={24} color="#59008c" />
                  </Pressable>
               ),
               tabBarIcon: ({ focused, color }) => (
                  <View>
                     <Ionicons
                        name={focused ? 'folder' : 'folder-outline'}
                        size={24}
                        color={focused ? '#59008c' : 'gray'}
                     />
                  </View>
               ),
            }}
         />
      </Tabs>
   );
}

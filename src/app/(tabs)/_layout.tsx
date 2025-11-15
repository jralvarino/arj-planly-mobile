import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { View } from 'react-native';

import { styles } from '@/styles/tabs.styles';

export default function TabsLayout() {
   return (
      <Tabs
         screenOptions={{
            tabBarShowLabel: false,
            tabBarStyle: styles.tabBar,
         }}
      >
         <Tabs.Screen
            name="index"
            options={{
               headerTitle: '',
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
            name="add"
            options={{
               headerTitle: '',
               tabBarIcon: () => (
                  <View style={styles.addButton}>
                     <Ionicons name={'add'} size={24} color="white" />
                  </View>
               ),
            }}
         />

         <Tabs.Screen
            name="rating"
            options={{
               headerTitle: '',
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
      </Tabs>
   );
}

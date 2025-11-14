import { Ionicons } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
   return (
      <Tabs>
         <Tabs.Screen
            name="index"
            options={{
               headerTitle: '',
               tabBarLabel: () => null,
               tabBarIcon: ({ color }) => (
                  <FontAwesome6 name="list-check" size={24} color={color} />
               ),
            }}
         />
         <Tabs.Screen
            name="rating"
            options={{
               headerTitle: '',
               tabBarLabel: () => null,
               tabBarIcon: ({ color }) => (
                  <Ionicons name={'calendar'} size={24} color={color} />
               ),
            }}
         />
      </Tabs>
   );
}

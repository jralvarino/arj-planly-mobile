import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Surface, Text } from 'react-native-paper';

export default function HomeScreen() {
   const habits = [
      {
         title: 'Anki',
         amount: '0/50',
         streakCount: 1,
         frequency: 'English',
         completed: true,
         color: '#f3eafe',
         description: 'asdfg',
         streak_count: '1',
      },
      {
         title: 'Serie com legendas em Inglês',
         amount: '0/1',
         streakCount: 3,
         frequency: 'English',
         completed: false,
         color: '#D8FFFB',
         description: 'arrewerwef',
         streak_count: '5',
      },
      {
         title: 'Academia',
         amount: '0/1',
         streakCount: 3,
         frequency: 'Healthy',
         completed: true,
         color: '#d6fce9',
         description: 'arrewerwef',
         streak_count: '30',
      },
      {
         title: 'Kindle',
         amount: '0/3 pg',
         streakCount: 3,
         frequency: 'English',
         completed: false,
         color: '#ffe4e6',
         description: 'arrewerwef',
         streak_count: '100',
      },
   ];

   return (
      <View style={styles.container}>
         <ScrollView showsVerticalScrollIndicator={false}>
            {habits?.map((habit, key) => (
               <Surface
                  style={[
                     styles.card,
                     habit.completed
                        ? styles.cardCompleted
                        : styles.notCompleted,
                     { backgroundColor: habit.color },
                  ]}
                  elevation={0}
               >
                  <View style={styles.cardContent}>
                     <Text style={styles.cardTitle}> {habit.title}</Text>
                     <View style={styles.cardCheck}>
                        <Text style={styles.cardDescription}>

                           {habit.amount}
                        </Text>
                        <View style={[styles.checkUncheck, habit.completed ? {backgroundColor: 'white'} : {backgroundColor: 'white'}]}>
                           {habit.completed ? (
                              <Ionicons
                                 name="checkmark-done-outline"
                                 size={15}
                                 color={'darkgreen'}
                              />
                           ) : (
                              <Ionicons
                                 name="checkmark-outline"
                                 size={15}
                                 color={'white'}
                              />
                           )}
                        </View>
                     </View>
                     <View style={styles.cardFooter}>
                        <View style={styles.streakBadge}>
                           <MaterialCommunityIcons
                              name="fire"
                              size={14}
                              color={'#ff9800'}
                           />
                           <Text style={styles.streakText}>
                              {habit.streak_count}
                           </Text>
                        </View>
                        <View style={styles.frequencyBadge}>
                           <Text style={styles.frequencyText}>
                              {' '}
                              {habit.frequency.charAt(0).toUpperCase() +
                                 habit.frequency.slice(1)}
                           </Text>
                        </View>
                     </View>
                  </View>
               </Surface>
            ))}
         </ScrollView>
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      padding: 15,
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
      alignItems: 'center'
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
      borderWidth: 0.2
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

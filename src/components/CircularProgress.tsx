import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Text } from 'react-native-paper';
import { colors } from '../theme/colors';

interface CircularProgressProps {
   percentage: number;
   size?: number;
   strokeWidth?: number;
   showLabel?: boolean;
}

export default function CircularProgress({
   percentage,
   size = 120,
   strokeWidth = 10,
   showLabel = true,
}: CircularProgressProps) {
   const radius = (size - strokeWidth) / 2;
   const circumference = 2 * Math.PI * radius;
   const offset = circumference - (percentage / 100) * circumference;

   return (
      <View style={[styles.container, { width: size, height: size }]}>
         <Svg width={size} height={size}>
            {/* Background circle */}
            <Circle
               cx={size / 2}
               cy={size / 2}
               r={radius}
               stroke={colors.gray[200]}
               strokeWidth={strokeWidth}
               fill="transparent"
            />
            {/* Progress circle */}
            <Circle
               cx={size / 2}
               cy={size / 2}
               r={radius}
               stroke={colors.primary}
               strokeWidth={strokeWidth}
               fill="transparent"
               strokeDasharray={circumference}
               strokeDashoffset={offset}
               strokeLinecap="round"
               transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
         </Svg>
         {showLabel && (
            <View style={styles.labelContainer}>
               <Text style={styles.label}>{percentage}%</Text>
            </View>
         )}
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
   },
   labelContainer: {
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
   },
   label: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.primary,
   },
});


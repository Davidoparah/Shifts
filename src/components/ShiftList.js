import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ShiftList = ({ shifts, selectedDate }) => {
  const handleShiftSelect = (shift) => {
    // Here you would implement the logic to book the shift
    console.log('Selected shift:', shift);
  };

  return (
    <View style={styles.container}>
      {shifts.map((shift) => (
        <TouchableOpacity
          key={shift.id}
          style={styles.shiftCard}
          onPress={() => handleShiftSelect(shift)}
        >
          <Text style={styles.timeText}>
            {shift.startTime} - {shift.endTime}
          </Text>
          <Text style={styles.spotsText}>
            Available spots: {shift.spots}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  shiftCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
  },
  timeText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  spotsText: {
    fontSize: 14,
    color: '#666',
  },
});

export default ShiftList; 
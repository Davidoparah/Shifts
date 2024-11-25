import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import CalendarStrip from 'react-native-calendar-strip';
import ShiftList from '../components/ShiftList';
import moment from 'moment';
import axios from 'axios';

const API_URL = 'https://api.dealpropertysourcing.co.uk/api';

const ShiftCalendarScreen = () => {
  const [selectedDate, setSelectedDate] = useState(moment());
  const [availableShifts, setAvailableShifts] = useState([]);

  const fetchShifts = async (date) => {
    try {
      const response = await axios.get(`${API_URL}/shifts/${date.format('YYYY-MM-DD')}`, {
        headers: {
          'x-auth-token': 'your-auth-token' // You'll need to implement token storage
        }
      });
      setAvailableShifts(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch shifts');
    }
  };

  const handleDateSelected = (date) => {
    setSelectedDate(date);
    fetchShifts(date);
  };

  useEffect(() => {
    fetchShifts(selectedDate);
  }, []);

  return (
    <View style={styles.container}>
      <CalendarStrip
        style={styles.calendar}
        selectedDate={selectedDate}
        onDateSelected={handleDateSelected}
        scrollable
        highlightDateNumberStyle={styles.selectedDate}
      />
      <ScrollView>
        <ShiftList shifts={availableShifts} selectedDate={selectedDate} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  calendar: {
    height: 100,
    paddingTop: 20,
    paddingBottom: 10,
  },
  selectedDate: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
});

export default ShiftCalendarScreen; 
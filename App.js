import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ShiftCalendarScreen from './src/screens/ShiftCalendarScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="ShiftCalendar"
          component={ShiftCalendarScreen}
          options={{ title: 'Available Shifts' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

registerRootComponent(App);
export default App; 
// In App.js in a new project

import * as React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './Screen/LoginScreen';
import HomeScreen from './Screen/HomeScreen';   // Adjust the path as needed
import TablesScreen from './Screen/TablesScreen';
import OrderInfoScreen from './Screen/OrderInfoScreen';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Login' screenOptions={{headerShown:false}}>
        <Stack.Screen name="Login" component={LoginScreen} /> 
        <Stack.Screen name="Home" component={HomeScreen} /> 
        <Stack.Screen name="Tables" component={TablesScreen} />
        <Stack.Screen name="OrderInfo" component={OrderInfoScreen} /> 

      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
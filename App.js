// In App.js in a new project

import * as React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './Screen/LoginScreen';
import HomeScreen from './Screen/HomeScreen';   // Adjust the path as needed
import TablesScreen from './Screen/TablesScreen';
import OrderInfoScreen from './Screen/OrderInfoScreen';
import ChoosePlatesScreen from './Screen/ChoosePlatesScreen';
import ChooseDrinksScreen from './Screen/ChooseDrinksScreen';
import PaymentScreen from './Screen/PaymentScreen';
import ShowOrdersScreen from './Screen/ShowOrdersScreen'
import { GestureHandlerRootView } from 'react-native-gesture-handler';
const Stack = createNativeStackNavigator();

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Login' screenOptions={{headerShown:false}}>
        <Stack.Screen name="Login" component={LoginScreen} /> 
        <Stack.Screen name="Home" component={HomeScreen} /> 
        <Stack.Screen name="Tables" component={TablesScreen} />
        <Stack.Screen name="OrderInfo" component={OrderInfoScreen} /> 
        <Stack.Screen name="ChoosePlates" component={ChoosePlatesScreen} /> 
        <Stack.Screen name="ChooseDrinks" component={ChooseDrinksScreen} /> 
        <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
        <Stack.Screen name="ShowOrders" component={ShowOrdersScreen} />

      </Stack.Navigator>
    </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export default App;
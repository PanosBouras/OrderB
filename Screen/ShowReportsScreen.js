import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { BASE_URL } from '../Staff/globalState';
import { CheckBox } from 'react-native-elements';
import { gloabalTableid, setGloabalTableid, globalUsername } from '../Staff/globalState';

const ShowReportsScreen = ({ route }) => {
  const navigation = useNavigation();
  const { items, orderId } = route.params;
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // State για το loader

};

export default ShowReportsScreen;
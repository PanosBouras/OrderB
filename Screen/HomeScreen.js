import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
const HomeScreen = () => {
    const navigation = useNavigation();
  const handleChecklistPress = () => {
    navigation.navigate('Tables');
   // Alert.alert('Checklist button pressed!');
    // navigation.navigate('ChecklistScreen'); // Uncomment and adjust this line to navigate to the Checklist screen
  };

  const handleSettingsPress = () => {
    Alert.alert('Settings button pressed!');
    // navigation.navigate('SettingsScreen'); // Uncomment and adjust this line to navigate to the Settings screen
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleChecklistPress}>
        <Image
          source={require('../assets/checklist.png')} // Replace with your path
          style={styles.image}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSettingsPress}>
        <Image
          source={require('../assets/settings.png')} // Replace with your path
          style={styles.image}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5DC', // Beige background color
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 40,
  },
});

export default HomeScreen;

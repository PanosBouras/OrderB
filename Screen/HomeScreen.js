import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
const HomeScreen = () => {
    const navigation = useNavigation();
  const handleChecklistPress = () => {
    navigation.navigate('Tables');
   // Alert.alert('Checklist button pressed!');
    // navigation.navigate('ChecklistScreen'); 
  };

      const handleShowOrdersPress = () => {
      navigation.navigate('ShowOrders');
    //Alert.alert('Settings button pressed!');
    // navigation.navigate('SettingsScreen'); 
  };

  const handleSettingsPress = () => {
    navigation.navigate("MainSettings");
  };

const handleShowReportsPress = () =>{
  Alert.alert("Under construction");
  //navigation.navigate('ShowReports');
}


  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleChecklistPress}>
        <Image
          source={require('../assets/checklist.png')} 
          style={styles.image}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={handleShowOrdersPress}>
        <Image
          source={require('../assets/ding.png')}
          style={styles.image}
        />
      </TouchableOpacity>
            <TouchableOpacity onPress={handleShowReportsPress}>
        <Image
          source={require('../assets/dataReport.png')} 
          style={styles.image}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={handleSettingsPress}>
        <Image
          source={require('../assets/settings.png')} 
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
    backgroundColor: '#F5F5DC', 
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 40,
  },
});

export default HomeScreen;

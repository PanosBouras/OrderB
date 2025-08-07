import React, { useState,form } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { setGlobalTotalTablesCount, setGlobalUsername,setGlobalUserID,BASE_URL,setGlobalFoodItemsList } from '../Staff/globalState';

const LoginScreen =  () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation(); 
  const handleLogin = async () => {
    const url = `${BASE_URL}/orderservice/Login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
 
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain',
          'Content-Type': 'application/json',
        },
      });

      const result = await response.text(); 
      setGlobalUsername(username);
      totalTables();
      FoodListFun();
      if (result != null) {
     console.log(result);
     setGlobalUserID(result);
     navigation.navigate('Home');

      } else {
      //  Alert.alert('Login Failed', 'Invalid credentials, please try again.');
    alert("Wrong username or password");
      console.log("Wrong username or password");

      
    }
    } catch (error) {
    //  console.error('Login Error:', error);
      //Alert.alert('Login Failed', 'Something went wrong. Please try again later.');
      //alert.show("Alert test");
      console.log(error);
      alert("URL:"+url+"\n"+error);
    }
  };

    const totalTables = async () => {
    const url = `${BASE_URL}/orderservice/GetTables`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain',
          'Content-Type': 'application/json',
        },
      });

      const result = await response.text(); 
      setGlobalTotalTablesCount(result);
      return 60;
    } catch (error) {
    //  console.error('Login Error:', error);
      //Alert.alert('Login Failed', 'Something went wrong. Please try again later.');
      //alert.show("Alert test");
      console.log(error);
    }
  };

  const FoodListFun = async () => {
    const url = `${BASE_URL}/orderservice/GetFoodItems`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain',
          'Content-Type': 'application/json',
        },
      });

      const result = await response.text(); 
      setGlobalFoodItemsList(result);
      return 60;
    } catch (error) {
    //  console.error('Login Error:', error);
      //Alert.alert('Login Failed', 'Something went wrong. Please try again later.');
      //alert.show("Alert test");
      Alert.alert(error);
    }
  };


  

  return (
    <View style={styles.container}>

      <Text style={styles.loginText}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        onChangeText={(text) => setUsername(text)}
        placeholderTextColor="#fff"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        onChangeText={(text) => setPassword(text)}
        placeholderTextColor="#fff"
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>LOGIN</Text>
      </TouchableOpacity>
<View>
{/* <Image source={require("../assets/backgroundrounded.png")}></Image> */}
</View>

    </View>
    
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundImage: '../assets/backgroundrounded.png',
    backgroundColor: '#4E4B36', // Dark olive green
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  loginText: {
    fontSize: 36,
    color: '#fff',
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 40,
    fontFamily: 'Courier-Bold', // Assuming a similar font
  },
  input: {
    height: 50,
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 25,
    marginBottom: 20,
    paddingHorizontal: 15,
    color: '#fff',
    backgroundColor: '#7D7C6E', // Lighter shade of green
  },
  button: {
    backgroundColor: '#B5AE7A', // Olive color matching the button in the image
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    fontFamily: 'AmericanType ITC Hel Bold',
  },
});

export default LoginScreen;

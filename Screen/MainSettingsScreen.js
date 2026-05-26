import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {globalCompanyID,setGlobalCompanyID, globalUserID} from '../Staff/globalState';

const MainSettingsScreen = ({ route }) => {
  const navigation = useNavigation();

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ρυθμίσεις</Text>

      {errorMessage ? (
        <Text style={styles.error}>{errorMessage}</Text>
      ) : null}

        <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate("AccountSettings", {
            mode: 0,
            userId: globalUserID,
          })
        }
      >
        <Text style={styles.buttonText}>Λογαριασμος</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("CompanySettings")}
      >
        <Text style={styles.buttonText}>Κατάστημα</Text>
      </TouchableOpacity>

      {isLoading && (
        <Text style={styles.loading}>Loading...</Text>
      )}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>{"<"}</Text>
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e9e7da",
    alignItems: "center",
   
  },

  title: {
    fontSize: 40,
    fontWeight: "900",
    marginBottom: 30,
    color: "#6b6b4a",
     marginTop: 30,
  },

  button: {
    width: "70%",
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 20,
    marginVertical: 10,
    alignItems: "center",
  },

  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#8a8a6a",
  },

  error: {
    color: "red",
    marginBottom: 10,
  },

  loading: {
    marginTop: 10,
    color: "#555",
  },
  
  backButton: {
    position: "absolute",
    bottom: 25,
    left: 20,
    backgroundColor: "#a8874a",
    width: 50,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
export default MainSettingsScreen;
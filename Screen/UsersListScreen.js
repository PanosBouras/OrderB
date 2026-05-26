import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {gloabalTableid,setGloabalTableid,BASE_URL,globalUsername,globalUserID,globalPersons, setGlobalPersons, globalCompanyID} from '../Staff/globalState';

import { Ionicons } from '@expo/vector-icons';

const UsersList = ({ route, navigation }) => {

  const [usersList, setUsersList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  const loadUsers = async () => {
    try {
      setLoadingList(true);

      const res = await fetch(
        `${BASE_URL}/orderservice/GetUserInfo/all?companyid=${globalCompanyID}`
      );

      const json = await res.json();
      setUsersList(json);

    } catch (e) {
      console.log(e);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleUserSelect = (user) => {
 navigation.navigate("AccountSettings", {
  mode: 0,
  userId: user.id,
});
  };

  const renderUser = ({ item }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => handleUserSelect(item)}
    >
      <View style={styles.userContent}>
        <Text style={styles.userName}>{item.username}</Text>
        <Text style={styles.userDepartment}>
          {item.firstname} {item.lastname}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#B8A376" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#5C5C5C" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Χρήστες</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={usersList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderUser}
        contentContainerStyle={styles.listContent}
      />

      {loadingList && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#B8A376" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8DCC4',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: '#F5F1E8',
    borderBottomWidth: 1,
    borderBottomColor: '#E0D9CC',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#5C5C5C',
  },
  listContent: {
    padding: 15,
  },
  userItem: {
    backgroundColor: '#F5F1E8',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0D9CC',
  },
  userContent: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5C5C5C',
    marginBottom: 4,
  },
  userDepartment: {
    fontSize: 12,
    color: '#B8A376',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default UsersList;

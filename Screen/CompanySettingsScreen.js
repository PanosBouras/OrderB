import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {globalCompanyID,setGlobalCompanyID, globalTotalTablesCount} from '../Staff/globalState';
//import {gloabalTableid,setGloabalTableid,BASE_URL,globalUsername,globalUserID,globalPersons, setGlobalPersons, globalCompanyID} from '../Staff/globalState';


const CompanySettings = ({ navigation }) => {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Product 1',
      category: 'ΚΑΤΗΓΟΡΙΑΚ/ΠΟΤΑ',
    },
    {
      id: 2,
      name: 'Product 2',
      category: 'ΚΑΤΗΓΟΡΙΑΚ/ΠΟΤΑ',
    },
    {
      id: 3,
      name: 'Product 3',
      category: 'ΚΑΤΗΓΟΡΙΑΚ/ΠΟΤΑ',
    },
  ]);

  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'User 1',
      department: 'Sales',
    },
    {
      id: 2,
      name: 'User 2',
      department: 'Marketing',
    },
    {
      id: 3,
      name: 'User 3',
      department: 'Operations',
    },
  ]);

  const handleAddProduct = () => {
    navigation.navigate('ProductFormScreen', { isNew: true });
  };

  const handleProductsList = () => {
    navigation.navigate('ProductListScreen', { products });
  };

  const handleAddUser = () => {
    
    navigation.navigate('AccountSettings', { mode: 1,isNew: true });
  };

  const handleUsersList = () => {
    navigation.navigate('UsersListScreen', { users });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <Text style={styles.header}>Κατάστημα</Text>

        {/* Store Info Section */}
<View style={styles.inputRow}>
  <Text style={styles.label}>ID Καταστήματος:</Text>
  <View style={styles.inputField}>
    <Text>{globalCompanyID}</Text>
  </View>
</View>
<View style={styles.inputRow}>
  <Text style={styles.label}>Αρ.Τραπεζικών:</Text>
  <View style={styles.inputField}>
    <Text>{globalTotalTablesCount}</Text>
  </View>
</View> 

        {/* Products Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Προϊόντα:</Text>
          
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[styles.button, styles.addButton]}
              onPress={handleAddProduct}
            >
              <Ionicons name="add" size={24} color="#D4AF93" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.moreButton]}
              onPress={handleProductsList}
            >
              <Ionicons name="ellipsis-horizontal" size={24} color="#8B8680" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Users Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Χρήστες:</Text>
          
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[styles.button, styles.addButton]}
              onPress={handleAddUser}
            >
              <Ionicons name="add" size={24} color="#D4AF93" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.moreButton]}
              onPress={handleUsersList}
            >
              <Ionicons name="ellipsis-horizontal" size={24} color="#8B8680" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.spacer} />
      </View>

      {/* Footer Buttons */}
      <View style={styles.footerButtons}>
        <TouchableOpacity style={styles.footerButton}  onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.footerButton, styles.confirmButton]}>
          <Ionicons name="checkmark" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8DCC4',
  },
  content: {
    padding: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#5C5C5C',
    marginBottom: 30,
    letterSpacing: 1,
  },
  infoSection: {
    marginBottom: 30,
    backgroundColor: '#F5F1E8',
    padding: 15,
    borderRadius: 8,
  },
  inputRow: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#B8A376',
    fontWeight: '500',
    marginBottom: 8,
  },
  inputField: {
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0D9CC',
  },
  sectionContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#B8A376',
    fontWeight: '600',
    marginBottom: 12,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  addButton: {
    backgroundColor: '#F5F1E8',
    borderColor: '#D4AF93',
  },
  moreButton: {
    backgroundColor: '#F5F1E8',
    borderColor: '#C9B8A3',
  },
  spacer: {
    height: 60,
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 15,
  },
  footerButton: {
    flex: 1,
    height: 50,
    backgroundColor: '#8B7D6B',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#D4AF93',
  },
});

export default CompanySettings;

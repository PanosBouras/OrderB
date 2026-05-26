import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {
  BASE_URL,
  globalCompanyID,
} from '../Staff/globalState';

const ProductsList = ({ navigation,route }) => {

  const [type, setType] = useState('DRINK');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadItems = async (selectedType) => {

    try {

      setLoading(true);

      const url =
        selectedType === 'DRINK'
          ? `${BASE_URL}/orderservice/GetDrinkItems/GetDrinkItemWithRecommendations?CompanyID=${globalCompanyID}`
          : `${BASE_URL}/orderservice/GetFoodItems/GetFoodItemWithRecommendations?CompanyID=${globalCompanyID}`;

      console.log('URL:', url);

      const response = await fetch(url);

      const json = await response.json();

      console.log('API RESPONSE:',  JSON.stringify(json, null, 2));

      let currentCategory = '';

      const formattedData = (json || []).map((x, index) => {

        // CATEGORY
        if (x.SortOrder === '0') {

          currentCategory = x.Name?.trim() || '';

          return {
            type: 'CATEGORY',
            id: `cat-${index}`,
            categoryName: currentCategory,
          };
        }

        // PRODUCT
        return {
          type: 'ITEM',
          id: x.Id ?? index,
          name: x.Name?.trim() ?? 'Χωρίς όνομα',
          category: currentCategory,
          categoryId: x.CategoryId ?? '',
          price: x.Price ?? 0,
          raw: x,
        };
      });

      setItems(formattedData);

    } catch (error) {

      console.log('LOAD ERROR:', error);

      setItems([]);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    loadItems(type);
  },  [route.params?.refresh]);

  const changeType = (newType) => {

    setType(newType);

    loadItems(newType);
  };

  const handleProductSelect = (item) => {

    navigation.navigate('ProductFormScreen', {
      id: item.id,
      companyid: globalCompanyID,
      type: type,
      product: item.raw,
    });
  };

  const renderItem = ({ item }) => {

    // CATEGORY TITLE
    if (item.type === 'CATEGORY') {

      return (
        <View style={styles.categoryContainer}>

          <Text style={styles.categoryTitle}>
            {item.categoryName}
          </Text>

        </View>
      );
    }

    // PRODUCT CARD
    return (
      <TouchableOpacity
        style={styles.foodItemContainer}
        onPress={() => handleProductSelect(item)}
      >

        <View style={{ flex: 1 }}>

          <Text style={styles.foodItemName}>
            {item.name}
          </Text>

          <Text style={styles.foodItemPrice}>
            {parseFloat(item.price || 0).toFixed(2)}€
          </Text>

        </View>

        <View style={styles.arrowButton}>

          <Ionicons
            name="chevron-forward"
            size={22}
            color="#fff"
          />

        </View>

      </TouchableOpacity>
    );
  };

  return (

    <View style={styles.container}>

      {/* TOP IMAGE */}
 <Image
  source={
    type === 'DRINK'
      ? require('../assets/51348143.png')
      : require('../assets/5134814.png')
  }
  style={styles.imgIcon}
/>

      {/* TOGGLE */}
      <View style={styles.toggleRow}>

        <TouchableOpacity
          style={[
            styles.toggleBtn,
            type === 'DRINK' && styles.activeBtn,
          ]}
          onPress={() => changeType('DRINK')}
        >
          <Text style={styles.toggleText}>
            ΠΟΤΑ
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleBtn,
            type === 'FOOD' && styles.activeBtn,
          ]}
          onPress={() => changeType('FOOD')}
        >
          <Text style={styles.toggleText}>
            ΦΑΓΗΤΑ
          </Text>
        </TouchableOpacity>

      </View>

      {/* LIST */}
      <FlatList
        data={items}
        keyExtractor={(item, index) =>
          (item?.id ?? index).toString()
        }
        renderItem={renderItem}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      />

      {/* BACK */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >

        <Text style={styles.backIcon}>
          ↩
        </Text>

      </TouchableOpacity>

      {/* LOADING */}
      {loading && (
        <View style={styles.loadingOverlay}>

          <ActivityIndicator
            size="large"
            color="#A3844D"
          />

        </View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f8f4e3',
    paddingHorizontal: 10,
  },

  imgIcon: {
    marginBottom: 20,
    marginTop: 20,
    width: 100,
    height: 100,
    alignSelf: 'center',
    resizeMode: 'contain',
  },

  toggleRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },

  toggleBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#ddd',
    alignItems: 'center',
    elevation: 2,
  },

  activeBtn: {
    backgroundColor: '#A3844D',
  },

  toggleText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  categoryContainer: {
    marginTop: 15,
    marginBottom: 10,
  },

  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#8b8b7a',
    marginBottom: 10,
    paddingBottom: 5,
    color: '#5c4b35',
  },

  foodItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    backgroundColor: '#fff',
    borderRadius: 10,

    padding: 15,
    marginBottom: 10,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.15,
    shadowRadius: 3,

    elevation: 4,
  },

  foodItemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },

  foodItemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4caf50',
    marginTop: 6,
  },

  arrowButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#797550',

    justifyContent: 'center',
    alignItems: 'center',
  },

  backButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },

  backIcon: {
    fontSize: 60,
    color: '#A3844D',
    fontWeight: 'bold',
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor: 'rgba(0,0,0,0.25)',

    justifyContent: 'center',
    alignItems: 'center',
  },

});

export default ProductsList;
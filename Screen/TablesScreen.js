import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // For navigation
import {globalUsername,globalTotalTablesCount, setGloabalTableid} from '../Staff/globalState';

// Import your table images
const images = [
  require('../assets/table.png'),
  // Add more images as needed up to the number of tables you have
];

// Generate sample data for tables
const generateTableData = (totalTables) => {
  return Array.from({ length: totalTables }, (_, index) => ({
    id: String(index + 1),
    title: `Table ${index + 1}`,
    image: images[index % images.length], // Cycle through images
  }));
};

const TableScreen = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 15;

  const totalTables = globalTotalTablesCount; // Example: Adjust based on the actual number of tables you have


  const navigation = useNavigation(); // Hook to access navigation

  useEffect(() => {
    loadData();
  }, [page]);

  const loadData = () => {
    const newData = generateTableData(totalTables).slice((page - 1) * itemsPerPage, page * itemsPerPage);
    setData(newData);
  };

  const handleItemPress = (item) => {
    setGloabalTableid( item.id);
    navigation.navigate('OrderInfo', { tableNumber: item.id });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => handleItemPress(item)}>
      <Image source={item.image} style={styles.image} />
      <Text style={styles.itemText}>{item.id}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={3} // 3 columns to match your layout
        key={page} // Re-render the grid when page changes
      />
        <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.homeButtonText}>Return to Home</Text>
      </TouchableOpacity>

      <View style={styles.paginationContainer}>
        {page > 1 && (
          <TouchableOpacity style={styles.paginationButton} onPress={() => setPage(page - 1)}>
            <Text style={styles.paginationText}>{'<'}</Text>
          </TouchableOpacity>
        )}
        {page < Math.ceil(totalTables / itemsPerPage) && (
          <TouchableOpacity style={styles.paginationButton} onPress={() => setPage(page + 1)}>
            <Text style={styles.paginationText}>{'>'}</Text>
          </TouchableOpacity>
        )}


      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E5D5', // Background color matching the design
    padding: 10,
  },
  homeButton: {
    padding: 10,
    backgroundColor: '#A47C46', // Match button style to design
    borderRadius: 5,
    marginBottom: 10,
    alignSelf: 'center',
  },
  homeButtonText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
  },
  itemContainer: {
    flex: 1,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative', // To position text over image
    height: 100, // Adjust based on your layout needs
    marginBottom: 45,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain', // Ensures the image scales properly
  },
  itemText: {
    position: 'absolute',
    fontSize: 24,
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  paginationButton: {
    padding: 10,
    backgroundColor: '#A47C46', // Same color as the table
    borderRadius: 5,
  },
  paginationText: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default TableScreen;

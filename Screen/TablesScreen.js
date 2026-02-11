import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { globalTotalTablesCount, setGloabalTableid } from '../Staff/globalState';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const images = [require('../assets/table.png')];

const generateTableData = (totalTables) =>
  Array.from({ length: totalTables }, (_, index) => ({
    id: String(index + 1),
    title: `Table ${index + 1}`,
    image: images[index % images.length],
  }));

const TableScreen = () => {
  const navigation = useNavigation();
  const totalTables = globalTotalTablesCount;
  const itemsPerPage = 20;

  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);

  useEffect(() => {
    loadData();
  }, [page]);

  const loadData = () => {
    const allTables = generateTableData(totalTables);
    const newData = allTables.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    setData(newData);
  };

  const handleItemPress = (item) => {
    setGloabalTableid(item.id);
    navigation.navigate('OrderInfo', { tableNumber: item.id });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => handleItemPress(item)}>
      <Image source={item.image} style={styles.image} />
      <Text style={styles.itemText}>{item.id}</Text>
    </TouchableOpacity>
  );

  const onGestureEvent = (event) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX } = event.nativeEvent;
      if (translationX < -50 && page < Math.ceil(totalTables / itemsPerPage)) {
        setPage(page + 1);
      } else if (translationX > 50 && page > 1) {
        setPage(page - 1);
      }
    }
  };

  return (
    <PanGestureHandler onHandlerStateChange={onGestureEvent}>
      <View style={styles.container}>
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          key={page}
        />

        <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.homeButtonText}>Επιστροφή</Text>
        </TouchableOpacity>
      </View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E5E5D5', padding: 10 },
  homeButton: { padding: 10, backgroundColor: '#A47C46', borderRadius: 5, marginBottom: 10, alignSelf: 'center' },
  homeButtonText: { fontSize: 18, color: '#FFF', fontWeight: 'bold' },
  itemContainer: { flex: 1, margin: 5, alignItems: 'center', justifyContent: 'center', height: 100 },
  image: { width: '100%', height: '100%', resizeMode: 'contain' },
  itemText: { position: 'absolute', fontSize: 24, color: '#FFF', fontWeight: 'bold', textAlign: 'center' },
});

export default TableScreen;

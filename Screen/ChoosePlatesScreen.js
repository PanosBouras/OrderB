import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, FlatList,Modal,TextInput,Button } from 'react-native';
import { BASE_URL, gloabalTableid } from '../Staff/globalState'; // Εισαγωγή του BASE_URL
import { useNavigation } from '@react-navigation/native';

const ChoosePlates = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [comment, setComment] = useState('');

  const handleReturnToOrder = () => {
    try {
      navigation.navigate('OrderInfo', { tableNumber: gloabalTableid });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetch(`${BASE_URL}/orderservice/GetFoodItems`)
      .then((response) => response.json())
      .then((json) => {
        const groupedData = groupDataByCategory(json);
        setData(groupedData);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  const groupDataByCategory = (items) => {
    const categories = items.filter((item) => item.SortOrder === '0');
    return categories.map((category) => ({
      ...category,
      items: items
        .filter((item) => item.CategoryId === category.CategoryId && item.SortOrder !== '0')
        .map((item) => ({
          ...item,
          checked: false,
          quantity: 0, // Αρχική ποσότητα
        })),
    }));
  };

  const toggleCheck = (categoryId, itemName) => {
    setData((prevData) =>
      prevData.map((category) =>
        category.CategoryId === categoryId
          ? {
              ...category,
              items: category.items.map((item) =>
                item.Name === itemName
                  ? {
                      ...item,
                      checked: !item.checked,
                      quantity: !item.checked ? 1 : 0, // Όταν κάνεις check, η ποσότητα γίνεται 1, αλλιώς 0
                    }
                  : item
              ),
            }
          : category
      )
    );
  };
  
  const handleItemId = (itemId) => {
    setSelectedItemId(itemId);
    setModalVisible(true);
    fetchRecommendations(itemId);
  };


  const adjustQuantity = (categoryId, itemName, delta) => {
    setData((prevData) =>
      prevData.map((category) =>
        category.CategoryId === categoryId
          ? {
              ...category,
              items: category.items.map((item) =>
                item.Name === itemName
                  ? {
                      ...item,
                      quantity: Math.max(0, item.quantity + delta),
                      checked: Math.max(0, item.quantity + delta) > 0, // Αν η ποσότητα > 0, να γίνεται checked
                    }
                  : item
              ),
            }
          : category
      )
    );
  };

  const handleOpenModal = (itemId) => {
    setSelectedItemId(itemId);
    setModalVisible(true);
  };

  const fetchRecommendations = async (itemId) => {
    try {
      const response = await fetch(`${BASE_URL}/orderservice/GetRecommendations?itemId=${encodeURIComponent(itemId)}`);
      const result = await response.json();
      setRecommendations(result);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const handleAddComment = () => {
    setData((prevData) =>
      prevData.map((category) => ({
        ...category,
        items: category.items.map((item) =>
          item.Id === selectedItemId
            ? {
                ...item,
                ItemDescription: `${item.ItemDescription || ''} ${comment}`,
                comments: [...(item.comments || []), comment],
                checked: true,         // Ορίζουμε το checked σε true
                quantity: 1,           // Η ποσότητα γίνεται 1
              }
            : item
        ),
      }))
    );
    setComment('');              // Καθαρισμός του σχολίου
    setModalVisible(false);      // Κλείσιμο του modal
  };


  const handleCancelComment = () => {
    setComment('');
    setModalVisible(false);
  };


  const handleConfirmOrder = async () => {
    try {
      const orderData = data.flatMap((category) =>
        category.items
          .filter((item) => item.checked && item.quantity > 0) // Επιλέγουμε μόνο τα τσεκαρισμένα πιάτα με ποσότητα > 0
          .map((item) => ({
            itemId: item.Id,
            name: item.Name,
            quantity: item.quantity,
            comment:item.ItemDescription||' '||item.comment, // Προσθέτουμε κενό string αν δεν υπάρχει σχόλιο
          }))
      );
   //   console.error('JSON:'+JSON.stringify(orderData)+'\n');
      const response = await fetch(`${BASE_URL}/orderservice/PostCreateOrder?tableId=${encodeURIComponent(gloabalTableid)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();
     //  console.log("Order created successfully:", result);
      //  alert('Order created successfully!');
      } else {
      //  console.error('Error creating order:', response.statusText+'\n'+JSON.stringify(orderData));
      //  alert('Failed to create order');
      }
    } catch (error) {
     // console.error('Error creating order:', error);
     // alert('Error creating order');
    }

    navigation.navigate('OrderInfo', { tableNumber: gloabalTableid }); 
  };

  

  const renderCategory = ({ item }) => (
    <View style={styles.categoryContainer}>
      <Text style={styles.categoryTitle}>{item.Name}</Text>
      {item.items.map((foodItem) => (
        <View key={foodItem.itemId} style={styles.foodItemContainer}>
          <View style={{ flex: 1 }}>
            <Text style={styles.foodItemName}>{foodItem.Name.trim()}</Text>
            {foodItem.ItemDescription ? (
              <Text style={styles.foodItemDescription}>{foodItem.ItemDescription}</Text>
            ) : null}
          </View>
          {foodItem.Price ? (
            null
           // <Text style={styles.foodItemPrice}>{foodItem.Price}€</Text>
          ) : null}
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => adjustQuantity(item.CategoryId, foodItem.Name, -1)}
            >
              <Text style={styles.quantityText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityDisplay}>{foodItem.quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => adjustQuantity(item.CategoryId, foodItem.Name, 1)}
            >
              <Text style={styles.quantityText}>+</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => toggleCheck(item.CategoryId, foodItem.Name)}
          >
            <View
              style={[
                styles.checkbox,
                foodItem.checked && styles.checkboxChecked, // Ενημερώνει το checkbox αν είναι checked
              ]}
            />
          </TouchableOpacity>
          <TouchableOpacity
  style={styles.itemIdButton}
  onPress={() => handleItemId(foodItem.Id)} // Ελέγχει εναλλακτικά πεδία
>
  <Text style={styles.itemIdButtonText}>...</Text>
</TouchableOpacity>
        </View>
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  

  return (
    <View style={styles.container}>
      <Image source={require('../assets/5134814.png')} style={styles.imgIcon} />
      <FlatList
        data={data}
        renderItem={renderCategory}
        keyExtractor={(item) => item.CategoryId}
      />
      <TouchableOpacity style={styles.submitButton} onPress={handleConfirmOrder}>
        <Image
          source={require('../IMAGE/checkmark_8625365.png')} // Εικόνα κουμπιού επιβεβαίωσης
          style={styles.submitIcon}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={() => handleReturnToOrder()}>
        <Text style={styles.backIcon}>{'↩'}</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Προσθήκη Σημειώσεων</Text>
            <TextInput
              style={styles.commentInput}
              value={comment}
              onChangeText={setComment}
              placeholder="Γράψτε το σχόλιό σας"
            />            <FlatList
              data={recommendations}
              keyExtractor={(item) => item.ItemRecommendationsID}
              
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.recommendationItem}
                  onPress={() => setComment(item.RecommendationDecription)}
                >
                  <Text style={styles.recommendationText}>{item.RecommendationDecription}</Text>
                </TouchableOpacity>
              )}
            />

            <Button title="OK" style={styles.ModalButtons} onPress={handleAddComment} />
            <Button title="Cancel" style={styles.ModalButtons}  onPress={handleCancelComment} />
          </View>
        </View>
      </Modal>
    </View>
  );  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f4e3',
    paddingHorizontal: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#8b8b7a',
    marginVertical: 10,
    paddingBottom: 5,
  },
  foodItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  foodItemName: {
    fontSize: 18,
    fontWeight: '500',
  },
  foodItemDescription: {
    fontSize: 14,
    color: '#6e6e6e',
  },
  foodItemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#ddd',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityDisplay: {
    fontSize: 18,
    fontWeight: 'bold',
    minWidth: 20,
    textAlign: 'center',
  },
  checkboxContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 3,
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#064908',
  },
  submitButton: {
    alignSelf: 'center',
    marginVertical: 20,
    width:20,
    height: 20,
    backgroundColor: '#ffcc00',
    borderRadius: 5, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4, 
  },
  imgIcon: {
    marginBottom: 20,
    marginTop: 20,
    width: 100,
    height: 100,
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  backIcon: {
    fontSize: 60,
    color: '#A3844D',
    fontWeight: 'bold',
  },
  submitIcon: {
    width: 60,
    height: 60,
    alignContent:"left"
  },
  itemIdButton: {
    marginLeft: 10,
    backgroundColor: '#797550',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  itemIdButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Ελαφρύ μαύρο φόντο για να δίνει αίσθηση αδιαφάνειας
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 60,
    alignItems: 'center',
    width: '80%', 
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  commentInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
    width: '100%',
    textTransform: 'uppercase',
  },
  recommendationItem: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginVertical: 5,
    width: '100%',
  },
  recommendationText: {
    fontSize: 16,
    color: '#333',
  },
  commentText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 10,
  },
  ModalButtons:{
    backgroundColor: 'white',
    padding: 200,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
    alignSelf: 'center',
    fontSize: 16,
  },
  navButton: {
    
    marginVertical: 0,
  },
});

export default ChoosePlates;

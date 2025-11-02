import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Modal,
  TextInput,
  Button,
} from 'react-native';
import { BASE_URL, gloabalTableid,globalUsername,globalUserID,globalCompanyID } from '../Staff/globalState'; // Εισαγωγή του BASE_URL
import { useNavigation } from '@react-navigation/native';

const ChooseDrinks = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [comment, setComment] = useState('');

  const handleReturnToOrder = () => {
    try {
      navigation.navigate('OrderInfo', { tableNumber: gloabalTableid });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetch(`${BASE_URL}/orderservice/GetDrinkItems`)
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
          extraPrice: 0,
          selectedOptions: [],
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
    fetchRecommendations(itemId);
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

 const toggleRecommendation = (rec) => {
    setSelectedOptions((prev) =>
      prev.includes(rec.ItemRecommendationsID) ? prev.filter((id) => id !== rec.ItemRecommendationsID) : [...prev, rec.ItemRecommendationsID]
    );
  };

const handleAddComment = () => {
  // Επιλογή των συστάσεων που έχουν επιλεχθεί
  const selectedRecs = recommendations.filter((rec) => selectedOptions.includes(rec.ItemRecommendationsID));
  
  // Υπολογισμός του συνολικού έξτρα κόστους από τις συστάσεις
const extraPrice = selectedRecs.reduce((sum, rec) => { 
  const price = parseFloat(rec.RecommendationPrice.replace(',', '.') || 0);
  const totalSum= sum +price;
  return totalSum;
}, 0);
  // Σύνθεση της περιγραφής (σχόλια και συστάσεις)
  const combinedDescription = `${comment} ${selectedRecs.map((r) => r.RecommendationDecription).join(', ')}`;

  // Ενημέρωση των δεδομένων με τη νέα περιγραφή και τιμή
  setData((prevData) =>
    prevData.map((category) => ({
      ...category,
      items: category.items.map((item) =>
        item.Id === selectedItemId
          ? {
              ...item,
              ItemDescription: combinedDescription.trim(),
              comments: [...(item.comments || []), comment],
              checked: true,
              quantity: 1,
              extraPrice: extraPrice,  // Ενημέρωση με το νέο extraPrice
              selectedOptions: selectedOptions, // Αποθήκευση των επιλεγμένων συστάσεων
            }
          : item
      ),
    }))
  );

  // Επαναφορά των επιλογών και του σχολίου
  setComment('');
  setSelectedOptions([]);
  setModalVisible(false);
};



  const handleCancelComment = () => {
    setComment('');
    setSelectedOptions([]);
    setModalVisible(false);
  };


  const handleConfirmOrder = async () => {
         console.log(globalUserID);
    try {
      const orderData = data.flatMap((category) =>
        category.items
          .filter((item) => item.checked && item.quantity > 0) // Επιλέγουμε μόνο τα τσεκαρισμένα πιάτα με ποσότητα > 0
          .map((item) => ({
            itemId: item.Id,
            name: item.Name,
            quantity: item.quantity,
            comment: item.ItemDescription || '',
            price: parseFloat(item.Price)+parseFloat(item.extraPrice) || 0,
          }))
      );
 
   //   console.error('JSON:'+JSON.stringify(orderData)+'\n');
   console.log(`${BASE_URL}/orderservice/PostCreateOrder?companyid=${globalCompanyID}&tableId=${encodeURIComponent(gloabalTableid)}&userid=${encodeURIComponent(globalUserID)}&username=${encodeURIComponent(globalUsername)}&persons=${encodeURIComponent(globalPersons)}`);
   console.log(JSON.stringify(orderData));   
   const response = await fetch(`${BASE_URL}/orderservice/PostCreateOrder?companyid=${globalCompanyID}&tableId=${encodeURIComponent(gloabalTableid)}&userid=${encodeURIComponent(globalUserID)}&username=${encodeURIComponent(globalUsername)}&persons=${encodeURIComponent(globalPersons)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(globalUserID);
     //  console.log("Order created successfully:", result);
      //  alert('Order created successfully!');
      } else {
        console.error('Error creating order:', response.statusText+'\n'+JSON.stringify(orderData));
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
        {item.items.map((foodItem, index) => (
          <View key={foodItem.itemId || index} style={styles.foodItemContainer}>
            <View style={{ flex: 1 }}>
              <Text style={styles.foodItemName}>{foodItem.Name.trim()}</Text>
              {foodItem.ItemDescription ? <Text style={styles.foodItemDescription}>{foodItem.ItemDescription}</Text> : null}
              <Text style={styles.foodItemPrice}>
                Τιμή: {(parseFloat(foodItem.Price || 0) + parseFloat(foodItem.extraPrice || 0)).toFixed(2)}€
              </Text>
            </View>
            <View style={styles.quantityContainer}>
              <TouchableOpacity style={styles.quantityButton} onPress={() => adjustQuantity(item.CategoryId, foodItem.Name, -1)}>
                <Text style={styles.quantityText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityDisplay}>{foodItem.quantity}</Text>
              <TouchableOpacity style={styles.quantityButton} onPress={() => adjustQuantity(item.CategoryId, foodItem.Name, 1)}>
                <Text style={styles.quantityText}>+</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.checkboxContainer} onPress={() => toggleCheck(item.CategoryId, foodItem.Name)}>
              <View style={[styles.checkbox, foodItem.checked && styles.checkboxChecked]} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.itemIdButton} onPress={() => handleItemId(foodItem.Id)}>
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
       <Image source={require('../assets/51348143.png')} style={styles.imgIcon} />
       <FlatList data={data} renderItem={renderCategory} keyExtractor={(item, index) => index.toString()} />
       <TouchableOpacity style={styles.submitButton} onPress={handleConfirmOrder}>
         <Image source={require('../IMAGE/checkmark_8625365.png')} style={styles.submitIcon} />
       </TouchableOpacity>
       <TouchableOpacity onPress={handleReturnToOrder}>
         <Text style={styles.backIcon}>{'↩'}</Text>
       </TouchableOpacity>
 
       <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={handleCancelComment}>
         <View style={styles.modalContainer}>
           <View style={styles.modalContent}>
               {recommendations.length > 0 && (
            <Text style={styles.modalTitle}>Προσθήκη Επιλογών</Text>
          )}
                {recommendations.map((rec) => (
               <TouchableOpacity
                 key={rec.Id?.toString() || Math.random().toString()}
                 style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}
                 onPress={() => toggleRecommendation(rec)}
               >
                 <Text >{rec.RecommendationDecription} ({rec.RecommendationPrice}€)   </Text>
                 <View style={[styles.checkbox, selectedOptions.includes(rec.ItemRecommendationsID) && styles.checkboxChecked]} />
               </TouchableOpacity>
             ))}
             <Text style={styles.modalTitle}>Προσθήκη Σημειώσεων</Text>
             <TextInput
               style={styles.commentInput}
               value={comment}
               onChangeText={setComment}
               placeholder="Γράψτε το σχόλιό σας"
             />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
        <Button  title="Άκυρο" onPress={handleCancelComment} />
        <Button title="ΠΡΟΣΘΗΚΗ" onPress={handleAddComment} />
      </View>
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
    borderRadius: 10,
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
  },
  navButton: {
    
    marginVertical: 0,
  },
});

export default ChooseDrinks;

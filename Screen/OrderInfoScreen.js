import React,{ useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image,Button,Modal,TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {gloabalTableid,setGloabalTableid,BASE_URL,globalUsername,globalUserID,globalPersons, setGlobalPersons, globalCompanyID} from '../Staff/globalState';
import Dialog from 'react-native-dialog';
import { CheckBox } from 'react-native-elements';
import InputSpinner from "react-native-input-spinner";
import Icon from 'react-native-vector-icons/FontAwesome';


const OrderInfoScreen = ({ route }) => {

 const { tableNumber } = route.params;
 const navigation = useNavigation(); 
 const [orderData, setOrderData] = useState([]);
 const [orderDTLSeqToDelete, setOrderDTLSeqToDelete] = useState(null); // Προσθήκη για να αποθηκεύσουμε το id του στοιχείου προς διαγραφή
 const [orderHDRToDelete, setorderHDRToDelete] = useState(null); // Προσθήκη για να αποθηκεύσουμε το id του στοιχείου προς διαγραφή
 const [visible, setVisible] = useState(false);
 const [Ordervisible, setOrderVisible] = useState(false); 
const [selectedItems, setSelectedItems] = useState([]); // Λίστα για τα τσεκαρισμένα αντικείμενα
  const [modalVisible, setModalVisible] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
   const [comment, setComment] = useState('');
 const [DatafromItem, setDatafromItem] = useState([]);
 const [tempPersons, setTempPersons] = useState(globalPersons);
    // Συνάρτηση που καλείται όταν ο χρήστης πατήσει το κουμπί διαγραφής
const handleDeleteOrder = async (gloabalTableid) => {
  setOrderVisible(true);  // Εμφανίζουμε το διάλογο επιβεβαίωσης
};

const handleDelete  =  async (OrderDTLSeq) => {
  //setOrderData(orderData.filter(order => order.OrderDTLSeq !== OrderDTLSeq));

  setOrderDTLSeqToDelete(OrderDTLSeq);
 setVisible(true);  // Εμφανίζουμε το διάλογο επιβεβαίωσης
};

const handleDuplicateOrderItem = async (data) => {
  try {
    const newOrderData = [{
      itemId: data.Id,
      name: data.ItemName,
      quantity: 1,
      comment: data.Comments || '',
      price: parseFloat(data.Price),
    }];
console.log(data);
    const response = await fetch(
      `${BASE_URL}/orderservice/PostCreateOrder?tableId=${encodeURIComponent(gloabalTableid)}&username=${encodeURIComponent(globalUsername)}&userid=${encodeURIComponent(globalUserID)}&companyid=${globalCompanyID}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrderData),
      }
    );

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    // Αν η απάντηση έχει χρήσιμα δεδομένα (π.χ. το νέο αντικείμενο), μπορείς να τα χρησιμοποιήσεις. Αλλιώς:
    await fetchOrderData(); // 🔄 Refresh με τα σωστά δεδομένα από τον server

  } catch (error) {
    console.error('Error creating order:', error);
  }
};

const fetchOrderData = async () => {
  try {
    console.log(globalCompanyID);
    const response = await fetch(
    `${BASE_URL}/orderservice/GetOrderItems?tableid=${encodeURIComponent(gloabalTableid)}&companyid=${encodeURIComponent(globalCompanyID)}`
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    setOrderData(data); // Ενημερώνουμε την κατάσταση της παραγγελίας με τα νέα δεδομένα
  } catch (error) {
    console.error('Error fetching order data:', error);
  }
};


const handleEditOrderItem = async (item) => {
  setSelectedItemId(item.OrderDTLSeq);
  setComment(item.Comments || '');

  try {
    const response = await fetch(`${BASE_URL}/orderservice/GetRecommendations?itemId=${encodeURIComponent(item.Id)}`);
    const result = await response.json();
    setRecommendations(result);

    // Εντοπίζουμε ποια recommendations υπάρχουν μέσα στα σχόλια
    const alreadySelected = result
      .filter((rec) =>
        (item.Comments || '')
          .toUpperCase()
          .includes(rec.RecommendationDecription.toUpperCase())
      )
      .map((rec) => rec.ItemRecommendationsID);

    setSelectedOptions(alreadySelected);
    setModalVisible(true);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
  }
};



  const handleOpenModal = (itemId) => {
    setSelectedItemId(itemId);
    setModalVisible(true);
    fetchRecommendations(itemId);
  };

const fetchRecommendations = async (itemId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/orderservice/GetRecommendations?itemId=${encodeURIComponent(itemId)}`
    );
    const result = await response.json();
    setRecommendations(result);

    // ⚡ ΜΗΝ μηδενίζεις εδώ το selectedOptions!
    // setSelectedOptions([]);  ❌  — ΑΦΑΙΡΕΣΕ ΤΟ!
  } catch (error) {
    console.error('Error fetching recommendations:', error);
  }
};

const toggleRecommendation = (rec) => {
  setSelectedOptions((prevSelected) => {
    let updatedOptions;

    if (prevSelected.includes(rec.ItemRecommendationsID)) {
      // Αφαιρούμε από το state
      updatedOptions = prevSelected.filter(
        (id) => id !== rec.ItemRecommendationsID
      );

      // Αφαιρούμε και από το comment (με καθαρή λογική)
      setComment((prev) => {
        let parts = prev
          .split(',')
          .map((p) => p.trim())
          .filter((p) => p.length > 0);

        parts = parts.filter(
          (p) =>
            p.toUpperCase() !==
            rec.RecommendationDecription.toUpperCase()
        );

        return parts.join(', ');
      });
    } else {
      // Προσθέτουμε νέο
      updatedOptions = [...prevSelected, rec.ItemRecommendationsID];

      setComment((prev) => {
        let parts = prev
          .split(',')
          .map((p) => p.trim())
          .filter((p) => p.length > 0);

        if (
          !parts.some(
            (p) =>
              p.toUpperCase() ===
              rec.RecommendationDecription.toUpperCase()
          )
        ) {
          parts.push(rec.RecommendationDecription);
        }

        return parts.join(', ');
      });
    }

    return updatedOptions;
  });
};


  
const handleEditComment = async () => {
  try {
    // Επιλογή των συστάσεων που είναι ενεργές
    const selectedRecs = recommendations.filter((rec) =>
      selectedOptions.includes(rec.ItemRecommendationsID)
    );

    // Υπολογισμός έξτρα τιμής
    const extraPrice = selectedRecs.reduce((sum, rec) => {
      const price = parseFloat(
        (rec.RecommendationPrice || '0').replace(',', '.')
      );
      return sum + price;
    }, 0);

    // ✨ Δημιουργούμε καθαρό comment χωρίς διπλοεγγραφές
    const baseComment = comment
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    // Προσθέτουμε μόνο όσα selected recommendations ΔΕΝ υπάρχουν ήδη
    const selectedTexts = selectedRecs.map((r) => r.RecommendationDecription);

    // Φτιάχνουμε ένα μοναδικό, καθαρό array χωρίς διπλές επιλογές
    const uniqueComments = Array.from(
      new Set([...baseComment, ...selectedTexts])
    );

    // Συνθέτουμε το τελικό description
    const combinedDescription = uniqueComments.join(', ');

    // Προετοιμάζουμε το body για το update API
    const body = {
      orderItemId: selectedItemId,
      comment: combinedDescription.trim(),
      extraPrice,
      selectedRecommendations: selectedOptions,
      username: globalUsername,
    };

    console.log('📤 Sending body:', body);

    const response = await fetch(
        `${BASE_URL}/orderservice/UpdateOrderItem?tableId=${tableNumber}&username=${globalUsername}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response}`);
    }

    await fetchOrderData(); // 🔄 Refresh the list
    setModalVisible(false);
  } catch (error) {
    console.error('Error updating order item:', error);
  }
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
     console.log(`${BASE_URL}/orderservice/PostCreateOrder?tableId=${encodeURIComponent(gloabalTableid)}&username=${encodeURIComponent(globalUsername)}&userid=${encodeURIComponent(globalUserID)}&companyid=${globalCompanyID}`);
     console.log(JSON.stringify(orderData));   
     const response = await fetch(`${BASE_URL}/orderservice/PostCreateOrder?tableId=${encodeURIComponent(gloabalTableid)}&username=${encodeURIComponent(globalUsername)}&userid=${encodeURIComponent(globalUserID)}&companyid=${globalCompanyID}`, {
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



// Συνάρτηση που καλείται για να επιβεβαιώσουμε τη διαγραφή
const confirmDelete  =  async () => {
  // Διαγραφή του στοιχείου από τον πίνακα δεδομένων
  setOrderData(orderData.filter(order => order.OrderDTLSeq !== orderDTLSeqToDelete));
  //console.log(orderDTLSeqToDelete);
  try {

            const response = await fetch(`${BASE_URL}/orderservice/PostDeleteItemOrder?orderItemSeq=${encodeURIComponent(orderDTLSeqToDelete)}&username=${encodeURIComponent(globalUsername)}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              }
            });

   // const response = await fetch(url); // Replace with your API endpoint
    
    if (!response.ok) {
      console.log(response);
      throw new Error('Network response was not ok');
    } 
  } catch (error) { 
    console.log(error);
  }
  setVisible(false);  // Κλείσιμο του διαλόγου
};

const confirmDeleteOrder = async () => { 
  setOrderData([]);
  setGlobalPersons(1);
  try {

    const response = await fetch(`${BASE_URL}/orderservice/PostDeleteOrder?tableid=${encodeURIComponent(gloabalTableid)}&username=${encodeURIComponent(globalUsername)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
if (!response.ok) {
console.log(response);
throw new Error('Network response was not ok');
} 
} catch (error) { 
console.log(error);
}
setOrderVisible(false); 
};

// Συνάρτηση για την ακύρωση της διαγραφής
const cancelDelete = () => {
  setVisible(false);  // Κλείσιμο του διαλόγου χωρίς διαγραφή
  setorderHDRToDelete(false);
  setOrderVisible(false);
};
 


// Συνάρτηση για το toggle του checkbox
const toggleCheckbox = (item) => {
  setSelectedItems((prevSelected) => {
    if (prevSelected.includes(item.OrderDTLSeq)) {
      // Αν το OrderDTLSeq είναι ήδη στη λίστα, το αφαιρούμε
      return prevSelected.filter((selected) => selected !== item.OrderDTLSeq);
    } else {
      // Αν δεν είναι στη λίστα, το προσθέτουμε
      return [...prevSelected, item.OrderDTLSeq];
    }
  });
};



const handleAddPlate = () => { 
  try {
    
   navigation.navigate('ChoosePlates');
    
  } catch (error) { 
    console.log(error);
  }
};

const handleAddDrink = () => { 
  try {
    
   navigation.navigate('ChooseDrinks');
    
  } catch (error) { 
    console.log(error);
  }
};

const handleTicketPayment = () => {
  const itemsToPay = selectedItems.length
    ? selectedItems.map((orderDtlSeq) => {
        // Βρίσκουμε το item με το συγκεκριμένο OrderDTLSeq
        const foundItem = orderData.find((item) => item.OrderDTLSeq === orderDtlSeq);
        
        // Αν το foundItem είναι undefined, δεν το προσθέτουμε
        return foundItem ? foundItem : null;
      }).filter(item => item !== null)  // Αφαιρούμε τα null στοιχεία
    : orderData.filter((item) => item.Status !== 'completed');  // Εάν δεν υπάρχουν επιλεγμένα, επιλέγουμε τα μη ολοκληρωμένα

  const orderId = itemsToPay.length > 0 ? itemsToPay[0].Orderid : null;

  // Αν τα itemsToPay είναι άδεια, σημαίνει ότι δεν βρήκαμε τίποτα
  if (itemsToPay.length === 0) {
    console.log("Δεν βρέθηκαν επιλεγμένα αντικείμενα.");
  } else {
    navigation.navigate('PaymentScreen', { items: itemsToPay, orderId: orderId });
    setSelectedItems([]);
  }
};




  useEffect(() => {
    setGlobalPersons(1);
    // Fetch orders from the API
    const fetchOrderData = async () => {
      try {
        const url = `${BASE_URL}/orderservice/GetOrderItems?tableid=${encodeURIComponent(gloabalTableid)}&companyid=${encodeURIComponent(globalCompanyID)}`;
    
        const response = await fetch(url); // Replace with your API endpoint
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
            if(data != null){              
      setGlobalPersons(data[0].Persons);
    }else{
       
    }
        setOrderData(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    const unsubscribe = navigation.addListener('focus', () => {
      fetchOrderData(); // Κάνουμε fetch ξανά τα δεδομένα της παραγγελίας όταν επιστρέφουμε στην οθόνη
    });
    fetchOrderData();
  }, []);

  const [totalAmount, setTotalAmount, setPayedAmount] = useState(0);

  useEffect(() => {
    // Calculate the total amount whenever the orderData changes
    const total =  orderData.reduce((sum, order) => 
      order.Status !== 'completed' ? sum + order.Price : sum
    , 0);   setTotalAmount(total)
  });

  const payed = orderData.reduce((sum,order) =>
  order.Status === 'completed' ? sum + order.Price : sum ,0);
  

  
  const handlCompleted =(itemId) =>{

  }

const handleInputSpinnerOnChange = (value) => {
  if (orderData.length === 0) {
    // Αποθηκεύουμε προσωρινά την τιμή
    
    setTempPersons(value);
    setGlobalPersons(value);

  } else {
      const updatePersons = async () => {
      try {
        const response = await fetch(`${BASE_URL}/orderservice/UpdatePersonNumberOfTable?tableId=${gloabalTableid}&companyId=${globalCompanyID}&personNumber=${value}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Failed to update persons');
        setGlobalPersons(value);
      } catch (error) {
        console.error(error);
      }
    };
    updatePersons();
  }
};

const renderOrderItem = ({ item,index  }) => {
  // Ελέγχουμε αν το OrderDTLSeq είναι στη λίστα των επιλεγμένων
  const isChecked = selectedItems.includes(item.OrderDTLSeq);

  return (
    <View style={styles.orderItem}>
      <View style={{ flex: 1 }}>
        <Text style={styles.orderText}>
          {index + 1}{') '}{item.ItemName} : ... {item.Price}€
          {item.Status === 'completed' && <Text style={styles.addIcon}>✔</Text>}
        </Text>
        <Text style={styles.orderComments}>{item.Comments}</Text>
      </View>
              <TouchableOpacity onPress={() => handleDuplicateOrderItem(item)}>
          <Icon name="plus-circle" style={styles.addIcon} />
        </TouchableOpacity>
        
      
              {item.Status !== 'completed' && (
        <TouchableOpacity onPress={() => handleEditOrderItem(item)}>
          <Icon name="edit" style={styles.editIcon} />
        </TouchableOpacity>
      )}

      {item.Status !== 'completed' && (
        <CheckBox
          checked={isChecked}  // Ελέγχουμε αν το συγκεκριμένο OrderDTLSeq είναι επιλεγμένο
          onPress={() => toggleCheckbox(item)}  // Καλούμε την toggleCheckbox για το συγκεκριμένο item
          checkedColor="#32CD32"  // Χρώμα όταν είναι τσεκαρισμένο
          uncheckedColor="#FF6347"  // Χρώμα όταν δεν είναι τσεκαρισμένο
           containerStyle={styles.CheckBox}
        />
      )}
      {item.Status !== 'completed' && (
        <TouchableOpacity onPress={() => handleDelete(item.OrderDTLSeq)}>
                   <Icon name="remove" style={styles.crossIcon} />
        </TouchableOpacity>
      )}
    </View>
  );
};

  
  return (
    <View style={styles.container}>
      {/* Left Navigation */}
      <View style={styles.leftNav}>
        <TouchableOpacity style={styles.navButton}  onPress={() => handleAddPlate()}>
          <Image source={require('../assets/5134814.png')} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}  onPress={() => handleAddDrink()}>
          <Image source={require('../assets/51348143.png')} style={styles.navIcon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.backIcon} onPress={() => {setGlobalPersons(1); navigation.navigate('Tables')}}>
            <Text style={styles.backIcon}>{'↩'}</Text>
          </TouchableOpacity>
      </View>

      {/* Right Content */}
      
      <View style={styles.rightContent}>
        <View style={styles.header}>
          <View style={styles.ticketContainer}>
            <Image source={require('../assets/ticketLabel.png')} style={styles.ticketImage} />
            <View style={styles.ticketTextContainer}>
              <Text style={styles.orderNumberText}>{}</Text>
              <Text style={styles.tableNumberText}>{tableNumber}</Text>
            </View>
            </View>
             <View style={styles.hdre}>
            <Text>Αριθμός ατόμων</Text>
            <InputSpinner 
              max={100}
              min={1}
              step={1}
              colorMax={"#f04048"}
              colorMin={"#9b9a61"}
              skin={"clean"}
              editable={false}
              value={globalPersons}
               onIncrease={(value) => handleInputSpinnerOnChange(value)}
            onDecrease={(value) => handleInputSpinnerOnChange(value)}
            />
          </View> 

          <Text style={styles.headerText}>Παραγγελία</Text>
           

        </View>

        {/* Order List */}
        <FlatList
          data={orderData}
          renderItem={renderOrderItem}
          keyExtractor={(item, index) => (item.ITEMID ? item.ITEMID.toString() : index.toString())}
          contentContainerStyle={styles.orderList}
        />

        {/* Total and Icons */}
        <View style={styles.footer}>
        <Text style={styles.payedText}>Πληρωμένα: €{payed.toFixed(2)}</Text>

          <Text style={styles.totalText}>Σύνολο: €{totalAmount.toFixed(2)}</Text>
          <View style={styles.footerIcons}>
            <TouchableOpacity  onPress={() => handleDeleteOrder(gloabalTableid)}>
              <Image source={require('../assets/cancelbutton.png')} style={styles.footerIcon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleTicketPayment()}>
              <Image source={require('../assets/ticketpayment.png')} style={styles.footerIcon} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
       <View style={styles.container}>
      <FlatList
        data={orderData}
        renderItem={renderOrderItem}
        keyExtractor={(item, index) => (item.ITEMID ? item.ITEMID.toString() : index.toString())}
        contentContainerStyle={styles.orderList}
      />

      <Dialog.Container visible={visible}>
        <Dialog.Title>Επιβεβαίωση Διαγραφής</Dialog.Title>
        <Dialog.Description>Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτό το είδος απο την Παραγγελία;
        </Dialog.Description>
        <Dialog.Button label="Ακύρωση" onPress={cancelDelete} />
        <Dialog.Button label="Διαγραφή" onPress={confirmDelete} />
      </Dialog.Container>
    </View>


    <View style={styles.container}>
      <FlatList
        data={orderData}
        renderItem={renderOrderItem}
        keyExtractor={(item, index) => (item.ITEMID ? item.ITEMID.toString() : index.toString())}
        contentContainerStyle={styles.orderList}
      />

      <Dialog.Container visible={Ordervisible}>
        <Dialog.Title>Επιβεβαίωση Διαγραφής</Dialog.Title>
        <Dialog.Description>Είστε βέβαιοι ότι θέλετε να διαγράψετε την Παραγγελία;
        </Dialog.Description>
        <Dialog.Button label="Ακύρωση" onPress={cancelDelete} />
        <Dialog.Button label="Διαγραφή" onPress={confirmDeleteOrder} />
      </Dialog.Container>
    </View>

       <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={handleCancelComment}>
         <View style={styles.modalContainer}>
           <View style={styles.modalContent}>
               {recommendations.length > 0 && (
            <Text style={styles.modalTitle}>Επεξεργασία Επιλογών</Text>
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
             <Text style={styles.modalTitle}>Επεξεργασία Σημειώσεων</Text>
             <TextInput
               style={styles.commentInput}
               value={comment}
               onChangeText={setComment}
               placeholder="Γράψτε το σχόλιό σας"
             />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
        <Button  title="Άκυρο" onPress={handleCancelComment} />
        <Button title="Επικύρωση" onPress={handleEditComment} />
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
    flexDirection: 'row',
    backgroundColor: '#E5E5D5',
  },
  leftNav: {
    width: '10%',
    backgroundColor: '#e9e8da',
    justifyContent: 'top',
    marginTop:40,
    alignItems: 'top',
  },
  navButton: {
    
    marginVertical: 20,
  },
  navIcon: {
    width: 40,
    height: 40,
    top:50,
    resizeMode: 'contain',
  },
  rightContent: {
    width: '90%',
    padding: 10,
    backgroundColor: '#e9e8da',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    
  },
  tableText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3D3A2D',
  },
  ticketContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  ticketImage: {
    width: 80,
    height: 80, // Adjust this size based on your image's aspect ratio
    resizeMode: 'contain',
    top:0,
    right:60,
  },
  ticketTextContainer: {
    position: 'absolute',
    top: '10%', // Adjust positioning as needed
    
  },
    hdre: {
    position: 'absolute',
    top: 0,
    left: 10,
    flexDirection: 'column',
    alignItems: 'center',
  },
headerText: {
  fontSize: 35,           // Αν το μέγεθος είναι πολύ μεγάλο, το μειώνουμε για να χωράει καλύτερα
  fontWeight: 'bold',
  color: '#3D3A2D',
  textAlign: "center",   // Κεντράρισμα του κειμένου
  flex: 1,                // Προσαρμογή για να μην υπερκαλύπτεται το κείμενο
//  paddingHorizontal: 10,  // Προσθήκη περιθωρίου στα πλάγια ώστε να μην είναι κολλημένο
  paddingTop: 20,         // Προσθήκη περιθωρίου από πάνω για καλύτερη τοποθέτηση
  overflow: 'hidden',     // Εξασφαλίζει ότι το κείμενο δεν θα ξεπεράσει το όριο
}
,
  orderList: {
    backgroundColor: '#9f9c82',
  position:"relative",
    flexGrow: 1,
    borderWidth: 5,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderColor:'#9f9c82',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomColor: '#7F725E',
    borderBottomWidth: 1,
  },
  orderText: {
    color: '#3D3A2D',
    fontSize: 16,
  },
  orderComments: {
    color: '#6b5c16',
    textAlign:'left',
    textAlignVertical :"bottom",
    fontSize: 12,
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  crossIcon: {
    color: '#FF6347',
    marginRight: 3,
    marginTop:10,
    fontSize: 25,
  },
  CheckBox:{
    marginLeft: 3,
    marginRight: 3,
    marginTop:10,
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0 
  },
  addIcon: {
    color: '#23804d',
    marginLeft: 3,
    marginTop:10,
    fontSize: 25,

  },
  editIcon:{
  color: '#464646',
    marginLeft: 3,
    marginRight: 3,
    marginTop:10,
    fontSize: 25,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    
    
  },
  orderNumberText: {
    textAlign:"alignContent",
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft:-80,
    marginTop: 3,
    color: '#6B6B5B',
  },
  tableNumberText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#6B6B5B',
    marginTop: "auto",
    marginLeft:-70,
  },
totalText: {
  fontSize:18,
  color: '#3D3A2D',
  backgroundColor: "#ac976b",
//  textAlign: "left",  // Τοποθετούμε το κείμενο στα δεξιά
// paddingHorizontal: 10,  // Προσθέτουμε περιθώριο για να μην είναι κολλημένο
  marginBottom: 80,
  alignItems: 'right',  // Διασφαλίζουμε ότι το κείμενο παραμένει ευθυγραμμισμένο
  borderWidth: 5,
  borderBottomLeftRadius: 20,
  borderBottomRightRadius: 20,
  borderColor: '#ac976b',
 // flex: 1,  // Επιτρέπει στο στοιχείο να καταλαμβάνει το διαθέσιμο χώρο
  //minWidth: 100,  // Μπορείς να προσαρμόσεις αυτό το minWidth σύμφωνα με τις ανάγκες σου
//  maxWidth: '100%',  // Κάνει το στοιχείο πιο ευέλικτο ανάλογα με το μέγεθος της οθόνης
  //flexShrink: 1,  // Επιτρέπει στο στοιχείο να μικραίνει όταν δεν υπάρχει αρκετός χώρος
  //flexWrap: 'wrap',  // Αν το κείμενο είναι μεγάλο, θα αναδιπλωθεί
}

,
  payedText: {
    fontSize: 18,
    color: '#3D3A2D',
    backgroundColor:"#BC9A56",
    textAlign:"left",
    flexDirection: 'column',
    marginBottom:80,
    width: 'auto',
    borderWidth: 5,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderColor:'#BC9A56',
  },
  footerIcons: {
    flexDirection: 'row',
    marginLeft:-200,
  },
  footerIcon: {
    width: 50,
    height: 50,
    marginLeft: 20,
    resizeMode: 'contain',
  },
  paginationText: {
    fontSize: 60,
    color: '#A3844D',
    fontWeight: 'bold',
    marginTop:600,
  },
  backIcon: {
    position:'absolute',
    bottom:0,
    left:0,
    fontSize: 80,
    color: '#A3844D',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'white',
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
    fontSize: 16,
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
});

export default OrderInfoScreen;

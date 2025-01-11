import React,{ useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image,Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {gloabalTableid,setGloabalTableid,BASE_URL} from '../Staff/globalState';
import Dialog from 'react-native-dialog';
import { CheckBox } from 'react-native-elements';

const OrderInfoScreen = ({ route }) => {

 const { tableNumber } = route.params;
 const navigation = useNavigation(); 
 const [orderData, setOrderData] = useState([]);
 const [orderDTLSeqToDelete, setOrderDTLSeqToDelete] = useState(null); // Προσθήκη για να αποθηκεύσουμε το id του στοιχείου προς διαγραφή
 const [orderHDRToDelete, setorderHDRToDelete] = useState(null); // Προσθήκη για να αποθηκεύσουμε το id του στοιχείου προς διαγραφή
 const [visible, setVisible] = useState(false);
 const [Ordervisible, setOrderVisible] = useState(false); 
const [selectedItems, setSelectedItems] = useState([]); // Λίστα για τα τσεκαρισμένα αντικείμενα

// Συνάρτηση που καλείται όταν ο χρήστης πατήσει το κουμπί διαγραφής
const handleDeleteOrder = async (gloabalTableid) => {
  setOrderVisible(true);  // Εμφανίζουμε το διάλογο επιβεβαίωσης
};

const handleDelete  =  async (OrderDTLSeq) => {
  //setOrderData(orderData.filter(order => order.OrderDTLSeq !== OrderDTLSeq));

  setOrderDTLSeqToDelete(OrderDTLSeq);
 setVisible(true);  // Εμφανίζουμε το διάλογο επιβεβαίωσης
};

// Συνάρτηση που καλείται για να επιβεβαιώσουμε τη διαγραφή
const confirmDelete  =  async () => {
  // Διαγραφή του στοιχείου από τον πίνακα δεδομένων
  console.log(orderDTLSeqToDelete);
  setOrderData(orderData.filter(order => order.OrderDTLSeq !== orderDTLSeqToDelete));
  try {

            const response = await fetch(`${BASE_URL}/orderservice/PostDeleteItemOrder?orderItemSeq=${encodeURIComponent(orderDTLSeqToDelete)}`, {
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
  try {

    const response = await fetch(`${BASE_URL}/orderservice/PostDeleteOrder?tableid=${encodeURIComponent(gloabalTableid)}`, {
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
const toggleCheckbox = (itemId, price) => {
  setSelectedItems((prevSelected) => {
    // Αν το item είναι ήδη στη λίστα, το αφαιρούμε
    if (prevSelected.some((item) => item.itemId === itemId)) {
      return prevSelected.filter((item) => item.itemId !== itemId);
    }
    // Αν δεν είναι, το προσθέτουμε
    return [...prevSelected, { itemId, price }];
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

  useEffect(() => {
    // Fetch orders from the API
    const fetchOrderData = async () => {
      try {
        const url = `${BASE_URL}/orderservice/GetOrderItems?tableid=${encodeURIComponent(gloabalTableid)}`;
    
        const response = await fetch(url); // Replace with your API endpoint
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
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
  const renderOrderItem = ({ item }) => {
    const isChecked = selectedItems.some((selected) => selected.itemId === item.Id); // Ελέγχουμε αν είναι τσεκαρισμένο

    return (
    <View style={styles.orderItem}>
        <View style={{ flex: 1 }}>
      <Text style={styles.orderText}>
        {item.Rownum}{') '}{item.ItemName} : ... {item.Price}€{' '}
        {item.Status === 'completed' && <Text style={styles.checkIcon}>✔</Text>}
      </Text>
      <Text  style={styles.orderComments}>
      {item.Comments}</Text>
      </View>
       {item.Status !== 'completed' && (
 <CheckBox
 checked={isChecked}
 onPress={() => toggleCheckbox(item.Id, item.Price)}
 checkedColor="#32CD32" // Χρώμα όταν είναι τσεκαρισμένο
 uncheckedColor="#FF6347" // Χρώμα όταν δεν είναι τσεκαρισμένο
/>
       )}
        {item.Status !== 'completed' && (
        <TouchableOpacity onPress={() => handleDelete(item.OrderDTLSeq)}>
          <Text style={styles.crossIcon}>✘</Text>
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

        <TouchableOpacity style={styles.backIcon} onPress={() => navigation.navigate('Tables')}>
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
          <Text style={styles.headerText}>Παραγγελία</Text>
        </View>

        {/* Order List */}
        <FlatList
          data={orderData}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.orderList}
        />

        {/* Total and Icons */}
        <View style={styles.footer}>
        <Text style={styles.payedText}>Πληρωμένα: €{payed}</Text>

          <Text style={styles.totalText}>Σύνολο: €{totalAmount}</Text>
          <View style={styles.footerIcons}>
            <TouchableOpacity  onPress={() => handleDeleteOrder(gloabalTableid)}>
              <Image source={require('../assets/cancelbutton.png')} style={styles.footerIcon} />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image source={require('../assets/ticketpayment.png')} style={styles.footerIcon} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
       <View style={styles.container}>
      <FlatList
        data={orderData}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
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
        keyExtractor={(item) => item.id}
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
  headerText: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#3D3A2D',
    textAlign:"center",
    
  },
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
    marginRight: 10,
    fontSize: 18,
  },
  checkIcon: {
    color: '#32CD32',
    marginRight: 10,
    fontSize: 18,

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
    fontSize: 18,
    color: '#3D3A2D',
    backgroundColor:"#BC9A56",
    textAlign:"right",
    flexDirection: 'column',
    marginBottom:80,
    marginRight:-21,
    width: 'auto',
    borderWidth: 5,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderColor:'#BC9A56', 
  },
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
});

export default OrderInfoScreen;

import React,{ useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {gloabalTableid,setGloabalTableid} from '../Staff/globalState';


const OrderInfoScreen = ({ route }) => {

  const { tableNumber } = route.params;
 const navigation = useNavigation(); 
 const [orderData, setOrderData] = useState([]);
  // Example data for orders
/*  const [orderData, setOrderData] = useState([
    { id: '1',itemid:'00001', name: 'Order 1',  price: 10.0, status: 'pending' },
    { id: '2',itemid:'00002', name: 'Order 2',  price: 5.0, status: 'completed' },
    // Add more order data as needed
  ]);
*/
  useEffect(() => {
    // Fetch orders from the API
    const fetchOrderData = async () => {
      try {
        const url = `http://192.168.1.7/orderservice/GetOrderItems?tableid=${encodeURIComponent(gloabalTableid)}`;
    
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
  

 
  const handleDelete = (itemId) => {
    setOrderData(orderData.filter(order => order.Id !== itemId));
  };

  const handlCompleted =(itemId) =>{

  }
  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <Text style={styles.orderText}>
        {item.Rownum}.{item.Id} {item.ItemName} : ... {item.Price}€{' '}
        {item.Status === 'completed' && <Text style={styles.checkIcon}>✔</Text>}
      </Text>
       {item.Status !== 'completed' && (
      <TouchableOpacity onPress={() => handlCompleted(item.Id)}>
          <Text style={styles.crossIcon}>-</Text>
        </TouchableOpacity>
       )}
        <TouchableOpacity onPress={() => handleDelete(item.Id)}>
          <Text style={styles.crossIcon}>✘</Text>
        </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Left Navigation */}
      <View style={styles.leftNav}>
        <TouchableOpacity style={styles.navButton}>
          <Image source={require('../assets/5134814.png')} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Image source={require('../assets/51348143.png')} style={styles.navIcon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.paginationButton} onPress={() => navigation.navigate('Tables')}>
            <Text style={styles.paginationText}>{'↩'}</Text>
          </TouchableOpacity>
      </View>

      {/* Right Content */}
      <View style={styles.rightContent}>
        <View style={styles.header}>
          <View style={styles.ticketContainer}>
            <Image source={require('../assets/ticketLabel.png')} style={styles.ticketImage} />
            <View style={styles.ticketTextContainer}>
              <Text style={styles.orderNumberText}>{orderData[0].Orderid}</Text>
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
            <TouchableOpacity>
              <Image source={require('../assets/cancelbutton.png')} style={styles.footerIcon} />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image source={require('../assets/ticketpayment.png')} style={styles.footerIcon} />
            </TouchableOpacity>
          </View>
        </View>
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
    backgroundColor: '#D8CBB7',
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#D2C9B5',
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
    backgroundColor: '#A49375',
  position:"relative",
    flexGrow: 1,
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
    fontSize: 18,
    marginLeft: -100,

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
    width: 'auto',
  },
  payedText: {
    fontSize: 18,
    color: '#3D3A2D',
    backgroundColor:"#BC9A56",
    textAlign:"left",
    flexDirection: 'column',
    marginBottom:80,
    width: 'auto',
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
    fontSize: 40,
    color: '#A3844D',
    fontWeight: 'bold',
    marginTop:600,
  },
});

export default OrderInfoScreen;

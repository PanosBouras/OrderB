import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { BASE_URL } from '../Staff/globalState';
import { CheckBox } from 'react-native-elements';
import { gloabalTableid, setGloabalTableid, globalUsername } from '../Staff/globalState';

const PaymentScreen = ({ route }) => {
  const navigation = useNavigation();
  const { items, orderId } = route.params;

  const [paymentItems, setPaymentItems] = useState(items);
  const [cashAmount, setCashAmount] = useState(0);
  const [cardAmount, setCardAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(
    items.reduce((sum, item) => sum + parseFloat(item.Price), 0)
  );
  const [isCashChecked, setIsCashChecked] = useState(false);
  const [isCardChecked, setIsCardChecked] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // State για το loader

  const [showCashDetails, setShowCashDetails] = useState(false);
const [receivedCash, setReceivedCash] = useState(0);
const [denominationCounts, setDenominationCounts] = useState({});
const denominations = [
  500, 200, 100,
  50, 20, 10,
  5, 2, 1,
  0.5, 0.2, 0.1,
  0.05, 0.02, 0.01
];

  // Συνάρτηση για ενημέρωση του ποσού
  const updateAmount = (newAmount, paymentType) => {
    if (paymentType === 'cash') {
      setCashAmount(newAmount);
      setCardAmount(totalAmount - newAmount); // Ενημερώνουμε την κάρτα ώστε το άθροισμα να είναι το συνολικό ποσό
    } else if (paymentType === 'card') {
      setCardAmount(newAmount);
      setCashAmount(totalAmount - newAmount); // Ενημερώνουμε τα μετρητά ώστε το άθροισμα να είναι το συνολικό ποσό
    }
  };

const handleCashCheck = () => {
  const newValue = !isCashChecked;
  setIsCashChecked(newValue);

  if (newValue) {
    setShowCashDetails(true);
    setCardAmount(0);
  } else {
    setShowCashDetails(false);
    setReceivedCash(0);
    setCashAmount(0);
  }
};

const handleDenominationPress = (value, type) => {
  setDenominationCounts(prevCounts => {
    const current = prevCounts[value] || 0;
    let newCount = current;

    if (type === 'add') {
      newCount = current + 1;
    } else {
      newCount = current - 1;
      if (newCount < 0) newCount = 0;
    }

    const updatedCounts = {
      ...prevCounts,
      [value]: newCount
    };

    // Υπολογισμός συνολικού ποσού
    const total = Object.keys(updatedCounts).reduce((sum, key) => {
      return sum + parseFloat(key) * updatedCounts[key];
    }, 0);

    const fixedTotal = parseFloat(total.toFixed(2));

    setReceivedCash(fixedTotal);
    setCashAmount(fixedTotal);

    return updatedCounts;
  });
};

const change = receivedCash - totalAmount;

  const handleCardCheck = () => {
    setIsCardChecked(!isCardChecked);
    if (!isCardChecked) {
      setCardAmount(totalAmount);  // Όλο το ποσό πηγαίνει στην κάρτα
      setCashAmount(0);            // Το ποσό για τα μετρητά γίνεται 0
    } else {
      setCardAmount(0);            // Το ποσό για την κάρτα γίνεται 0
    }
  };

const handlePayment = async () => {
  if (!isCashChecked && !isCardChecked) {
    setErrorMessage('Πρέπει να επιλέξετε έναν τρόπο πληρωμής.');
    return;
  }

  if (isCashChecked) {
    if (receivedCash < totalAmount) {
      setErrorMessage("Τα χρήματα δεν καλύπτουν το τελικό ποσό.");
      return;
    }
  }

  let finalCash = 0;
  let finalCard = 0;

  if (isCashChecked) {
    finalCash = totalAmount; 
  }

  if (isCardChecked) {
    finalCard = totalAmount;
  }

  const requestData = {
    OrderId: orderId,
    Items: paymentItems.map(({ OrderDTLSeq, Price }) => ({ OrderDTLSeq, Price })),
    Cash: finalCash,
    Card: finalCard,
  };

  console.log("REQUEST:", requestData);

  setIsLoading(true);

  try {
    const response = await fetch(
      `${BASE_URL}/orderservice/PostPaymentRequest?username=${encodeURIComponent(globalUsername)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      }
    );

    const result = await response.text();
    const isPaymentSuccessful = result === 'true';

    if (isPaymentSuccessful) {
      navigation.navigate('Tables');
    } else {
      navigation.navigate('OrderInfo', { tableNumber: gloabalTableid });
    }

  } catch (error) {
    console.error('Payment failed:', error);
    navigation.navigate('OrderInfo', { tableNumber: gloabalTableid });
  } finally {
    setIsLoading(false);
  }
};

  const handleCancel = () => {
    navigation.navigate('OrderInfo', { tableNumber: gloabalTableid });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ΛΙΣΤΑ ΕΙΔΩΝ ΠΡΟΣ ΠΛΗΡΩΜΗ</Text>
      <View style={styles.listContainer}>
        <FlatList
          data={paymentItems || []}
          keyExtractor={(item) => item.OrderDTLSeq.toString()}
          renderItem={({ item }) => (
            <View style={styles.orderItem}>
              <Text style={styles.orderText}>{item.ItemName}</Text>
              <Text style={styles.orderText}>{item.Price}€</Text>
            </View>
          )}
        />
      </View>
      <View style={styles.paymentSummary}>
        <Text style={styles.summaryText}>
          ΣΥΝΟΛΟ: <TextInput style={styles.input} value={totalAmount.toFixed(2)} editable={false} keyboardType="numeric" />€
        </Text>
        <View style={styles.paymentOption}>
          <CheckBox
            value={isCashChecked}
            onPress={handleCashCheck}
            checked={isCashChecked}
            checkedColor="#32CD32"
            uncheckedColor="#FF6347"
          />
          <Text style={styles.summaryText}>ΜΕΤΡΗΤΑ:</Text>
          <TextInput
            style={styles.input}
            onChangeText={(value) => updateAmount(parseFloat(value) || 0, 'cash')}
            value={isCashChecked ? cashAmount.toFixed(2) : '0.00'}
            editable={isCashChecked}
            keyboardType="numeric" // Εισαγωγή αριθμών
          />
    
        </View>
              {showCashDetails && (
  <View style={styles.cashDetailsContainer}>

    <Text style={styles.receivedText}>
      Δόθηκαν: {receivedCash.toFixed(2)}€
    </Text>

    <Text style={styles.changeText}>
      Ρέστα: {change > 0 ? change.toFixed(2) : '0.00'}€
    </Text>

    <FlatList
      data={denominations}
      keyExtractor={(item) => item.toString()}
      numColumns={3}
renderItem={({ item }) => {
  const count = denominationCounts[item] || 0;

  return (
    <View style={styles.denominationWrapper}>

      {/* Κύκλος ποσότητας */}
      <View style={styles.countCircle}>
        <Text style={styles.countCircleText}>
          {count}
        </Text>
      </View>

      {/* Κουμπιά και ποσό */}
      <View style={styles.denominationRow}>

        <TouchableOpacity
          style={styles.minusButton}
          onPress={() => handleDenominationPress(item, 'subtract')}
        >
          <Text style={styles.buttonTextSmall}>-</Text>
        </TouchableOpacity>

        <Text style={styles.denominationValue}>
          {item}€
        </Text>

        <TouchableOpacity
          style={styles.plusButton}
          onPress={() => handleDenominationPress(item, 'add')}
        >
          <Text style={styles.buttonTextSmall}>+</Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}}
    />

  </View>
)}
        <View style={styles.paymentOption}>
          <CheckBox
            value={isCardChecked}
            onPress={handleCardCheck}
            checked={isCardChecked}
            checkedColor="#32CD32"
            uncheckedColor="#FF6347"
          />
          <Text style={styles.summaryText}>ΚΑΡΤΑ:</Text>
          <TextInput
            style={styles.input}
            onChangeText={(value) => updateAmount(parseFloat(value) || 0, 'card')}
            value={isCardChecked ? cardAmount.toFixed(2) : '0.00'}
            editable={isCardChecked}
            keyboardType="numeric" // Εισαγωγή αριθμών
          />
        </View>
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <Text style={styles.buttonText}>ΑΚΥΡΟ</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePayment} style={styles.paymentButton}>
          <Text style={styles.buttonText}>ΠΛΗΡΩΜΗ</Text>
        </TouchableOpacity>
      </View>
      {isLoading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#32CD32" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E5D5',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3D3A2D',
    textAlign: 'center',
    marginBottom: 20,
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#9F9C82',
    borderRadius: 10,
    padding: 10,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#7F725E',
    paddingVertical: 10,
  },
  orderText: {
    color: '#3D3A2D',
    fontSize: 16,
  },
  paymentSummary: {
    marginVertical: 20,
    backgroundColor: '#E5E5D5',
    padding: 10,
    borderRadius: 10,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3D3A2D',
    marginBottom: 5,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    width: 80,
    borderWidth: 3,
    borderColor: '#9F9C82',
    borderRadius: 4,
    padding: 5,
    marginLeft: 10,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FF6347',
    padding: 15,
    alignItems: 'center',
    marginRight: 10,
    borderRadius: 5,
  },
  paymentButton: {
    flex: 1,
    backgroundColor: '#32CD32',
    padding: 15,
    alignItems: 'center',
    marginLeft: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loaderContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
  cashDetailsContainer: {
  marginTop: 15,
  backgroundColor: '#D8D2B0',
  padding: 0,
  borderRadius: 10,
},

denominationRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  flex: 1,
  margin: 5,
  padding: 0,
  backgroundColor: '#B5AA7A',
  borderRadius: 8,
},

plusButton: {
  backgroundColor: '#32CD32',
  paddingHorizontal: 10,
  paddingVertical: 5,
  borderRadius: 5,
},

minusButton: {
  backgroundColor: '#FF6347',
  paddingHorizontal: 10,
  paddingVertical: 5,
  borderRadius: 5,
},

denominationText: {
  color: '#FFF',
  fontWeight: 'bold',
  fontSize: 16,
},

denominationValue: {
  fontWeight: 'bold',
  fontSize: 14,
  color: '#3D3A2D',
},

receivedText: {
  fontSize: 16,
  fontWeight: 'bold',
  marginBottom: 5,
},

changeText: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#3D3A2D',
  marginBottom: 10,
},
denominationWrapper: {
  flex: 1,
  alignItems: 'center',
  margin: 5,
},

countCircle: {
  position: 'absolute',
  top: -10,
  backgroundColor: '#FFF',
  width: 28,
  height: 28,
  borderRadius: 10,
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 3,
  zIndex: 10,
},

countCircleText: {
  fontWeight: 'bold',
  fontSize: 14,
  color: '#000',
},

denominationRow: {
  width: '100%',
  backgroundColor: '#B5AA7A',
  borderRadius: 12,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 8,
  //paddingHorizontal: 15,
},

denominationValue: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#3D3A2D',
},

buttonTextSmall: {
  color: '#FFF',
  fontSize: 18,
  fontWeight: 'bold',
},
});

export default PaymentScreen;

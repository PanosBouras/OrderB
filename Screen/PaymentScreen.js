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
    setIsCashChecked(!isCashChecked);
    if (!isCashChecked) {
      setCashAmount(totalAmount);  // Όλο το ποσό πηγαίνει στα μετρητά
      setCardAmount(0);            // Το ποσό για την κάρτα γίνεται 0
    } else {
      setCashAmount(0);            // Το ποσό για τα μετρητά γίνεται 0
    }
  };

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

    const requestData = {
      OrderId: orderId,
      Items: paymentItems.map(({ OrderDTLSeq, Price }) => ({ OrderDTLSeq, Price })),
      Cash: cashAmount,
      Card: cardAmount,
    };

    console.log(requestData);

    setIsLoading(true); // Ενεργοποιούμε το loader

    try {
      const response = await fetch(`${BASE_URL}/orderservice/PostPaymentRequest?username=${encodeURIComponent(globalUsername)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

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
      setIsLoading(false); // Απενεργοποιούμε το loader
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
});

export default PaymentScreen;

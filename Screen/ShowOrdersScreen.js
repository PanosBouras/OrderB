import React, { useEffect, useState,useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Swipeable } from "react-native-gesture-handler";
import { ImageBackground } from "react-native";
import {
  BASE_URL,
  globalCompanyID,
} from "../Staff/globalState";
import { Audio } from 'expo-av';
import * as signalR from "@microsoft/signalr";

const ShowOrdersScreen = () => {
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rows ,setRows] = useState([]);
  const ordersCountRef = useRef(0);

const soundRef = useRef(null);

const tableImage = require('../assets/table.png');

useEffect(() => {
  let connection;

  const setup = async () => {
    try {
      
      const { sound: soundInsert } = await Audio.Sound.createAsync(
        require('../assets/ding.mp3')
      );
      const { sound: soundUpdate } = await Audio.Sound.createAsync(
        require('../assets/dingUpdate.mp3')
      );
      const { sound: soundDelete } = await Audio.Sound.createAsync(
        require('../assets/dingDelete.mp3')
      );

      console.log("Sounds loaded successfully");

      // SignalR connection
      connection = new signalR.HubConnectionBuilder()
        .withUrl(`${BASE_URL}/orderservice/ordersHub`)
        .withAutomaticReconnect()
        .build();

      //  Register listeners
      const handleSoundAndFetch = async (data, logText, type) => {
        console.log(data);
        console.log(logText);

        let currentSound;
        if (type === 1) currentSound = soundInsert;
        else if (type === 2) currentSound = soundUpdate;
        else currentSound = soundDelete;

        if (currentSound) {
          try {
            await currentSound.setPositionAsync(0);
            await currentSound.playAsync();
          } catch (err) {
            console.log("Sound play error:", err);
          }
        }

        await fetchOrderData();
      };

      connection.on("ReceiveOrdersInsert", (data) =>
        handleSoundAndFetch(data, "Order inserted", 1)
      );

      connection.on("ReceiveOrdersUpdate", (data) =>
        handleSoundAndFetch(data, "Orders updated", 2)
      );

      connection.on("ReceiveOrdersDeleteItem", (data) =>
        handleSoundAndFetch(data, "Order item deleted", 3)
      );

      connection.on("ReceiveOrdersDeleteOrder", (data) =>
        handleSoundAndFetch(data, "Order deleted", 3)
      );

      // 🔹 4. Start connection
      await connection.start();
      await connection.invoke("JoinCompanyGroup", String(globalCompanyID));
      console.log("SignalR connected and joined group");

    } catch (err) {
      console.log("Setup error:", err);
    }
  };

  fetchOrderData();

  setup();

  return () => {
    if (connection) connection.stop();
  };
}, []);


const fetchOrderData = async () => {
  try {
    setLoading(true);

    const url = `${BASE_URL}/orderservice/GetShowOrders?companyID=${globalCompanyID}&rows=-1`;
    const response = await fetch(url);

    if (!response.ok)
      throw new Error("Σφάλμα κατά την ανάκτηση παραγγελιών");

    const data = await response.json();

    setOrders(data);
    ordersCountRef.current = data.length; 

  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};



const checkchangesfn = async () => {
  try {
    const currentCount = ordersCountRef.current;

    const url = `${BASE_URL}/orderservice/GetShowOrders?companyID=${globalCompanyID}&rows=${currentCount}`;
    const res = await fetch(url);

    if (!res.ok) return false;

    const text = await res.text();

    if (text === '"-1"' || text === "-1") {
      return false; // δεν άλλαξε
    }
       try {
        await soundRef.current?.replayAsync();
      } catch (err) {
        console.log("Sound play error:", err);
      }
      await fetchOrderData();
    
    return true; // άλλαξε

  } catch (err) {
    console.log("checkchanges error", err);
    return false;
  }
};




  // function για αλλαγή status
const changestatusflg = async (orderDtlItemIsSeq, newStatus) => {
  setOrders(prevOrders =>
    prevOrders.map(o => {
      if (o.ORDERDTLITEMISSEQ !== orderDtlItemIsSeq) return o;

      const currentStatus = o.STATUS;
      const nextStatus =
        currentStatus === String(newStatus) ? "1" : String(newStatus);
updateStatus(orderDtlItemIsSeq,newStatus);
      return { ...o, STATUS: nextStatus };
    })
  );

  console.log("Change status:", orderDtlItemIsSeq, newStatus);

};

const updateStatus = async (orderDtlItemIsSeq,newStatus) => {
  try {
    const url = `${BASE_URL}/orderservice/OrderItems/UpdateStatusItem?companyID=${globalCompanyID}&orderItemId=${orderDtlItemIsSeq}&status=${newStatus}`;
console.log(url);
    const res = await fetch(url, {
      method: "POST"
    });

    console.log("status:", res.status);

    const text = await res.text();
    console.log("raw response:", text);

    if (!text) return res.ok;

    const data = JSON.parse(text);
    console.log("json response:", data);

    return res.ok;

  } catch (err) {
    console.log("updateStatus error", err);
    return false;
  }
};




  // GROUP BY: TYPE -> CATEGORY -> ITEM -> DESCRIPTION -> TABLE
  const groupedData = orders.reduce((acc, curr) => {
    const {
      TYPEID,
      ITEM_TYPE,
      CATEGORYID,
      CATEGORY_NAME,
      ITEMID,
      ITEMNAME,
      ORDERTABLE,
      ORDERITEMDESCRIPTION,
      ORDERDTLITEMISSEQ,
      STATUS,
    } = curr;

    if (!acc[TYPEID]) {
      acc[TYPEID] = { typeName: ITEM_TYPE, categories: {} };
    }
    if (!acc[TYPEID].categories[CATEGORYID]) {
      acc[TYPEID].categories[CATEGORYID] = { categoryName: CATEGORY_NAME, items: {} };
    }

    const itemKey = `${ITEMID}_${ORDERITEMDESCRIPTION || ""}_${ORDERTABLE}`;

    if (!acc[TYPEID].categories[CATEGORYID].items[itemKey]) {
      acc[TYPEID].categories[CATEGORYID].items[itemKey] = {
        itemName: ITEMNAME,
        itemDescr: ORDERITEMDESCRIPTION,
        itemseqid: ORDERDTLITEMISSEQ,
        itemstatus: STATUS,
        tables: {},
      };
    }

    // ποσότητα ανά τραπέζι
    if (!acc[TYPEID].categories[CATEGORYID].items[itemKey].tables[ORDERTABLE]) {
      acc[TYPEID].categories[CATEGORYID].items[itemKey].tables[ORDERTABLE] = 0;
    }
    acc[TYPEID].categories[CATEGORYID].items[itemKey].tables[ORDERTABLE] += 1;

    return acc;
  }, {});

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#a86b2d" />
        <Text>Φόρτωση παραγγελιών…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>ΚΑΤΑΣΤΑΣΗ ΠΑΡΑΓΓΕΛΙΩΝ</Text>

        {Object.values(groupedData).map((type) => (
          <View key={type.typeName} style={styles.typeSection}>
            <Text style={styles.typeTitle}>{type.typeName}</Text>

            {Object.values(type.categories).map((category) => (
              <View key={category.categoryName} style={styles.categorySection}>
                <Text style={styles.categoryTitle}>{category.categoryName}</Text>

                {Object.entries(category.items).map(([itemKey, item]) => (
                  <View key={itemKey}>
                    {Object.entries(item.tables).map(([table, qty]) => (
                      <Swipeable
                        key={`${itemKey}_${table}`}
                        renderRightActions={() => (
                          <TouchableOpacity
                            style={styles.swipeAction}
                            onPress={() => changestatusflg(item.itemseqid, 3)}
                          >
                            <Text style={{ color: "#fff" }}>Παράδοση</Text>
                          </TouchableOpacity>
                        )}
                      >
                        <View style={styles.orderRow}>
                          <View style={styles.itemLeft}>
                            <ImageBackground
                            source={tableImage}
                            style={styles.tableBadge}
                            imageStyle={{ borderRadius: 4 }}
                            >
                            <Text style={styles.tableNumber}>{table}</Text>
                            </ImageBackground>
                            <View style={styles.qtyBadge}>
                              <Text style={styles.qtyText}>{qty}</Text>
                            </View>
                            <View>
                              <Text style={styles.itemName}>{item.itemName}</Text>
                              <Text style={styles.itemComments}>{item.itemDescr}</Text>
                            </View>
                          </View>

              <Pressable
  style={styles.checkbox}
  onPress={() => changestatusflg(item.itemseqid, 2)}
>
  {item.itemstatus === "2" && <View style={styles.checked} />}
</Pressable>
                        </View>
                      </Swipeable>
                    ))}
                  </View>
                ))}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.homeButtonText}>Επιστροφή</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: "#f4f1dc", padding: 16, flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 20 },
  typeSection: { marginBottom: 20 },
  typeTitle: { fontSize: 20, fontWeight: "700", borderBottomWidth: 2, borderBottomColor: "#999", paddingBottom: 4, marginBottom: 10 },
  categorySection: { marginBottom: 12 },
  categoryTitle: { fontSize: 16, fontWeight: "600", color: "#555", marginBottom: 6 },
  orderRow: { backgroundColor: "#e6e3d3", flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 6, marginBottom: 6 },
  itemLeft: { flexDirection: "row", alignItems: "center" },
tableBadge: {
  width: 60,
  height: 60,
  justifyContent: "center",
  alignItems: "center",
  marginRight: 10,
  marginLeft:-10
},

tableNumber: {
  color: "#fff",
  fontWeight: "bold",
  fontSize: 20,
},
  qtyBadge: { width: 28, height: 28, backgroundColor: "#6a9245", borderRadius: 4, justifyContent: "center", alignItems: "center", marginRight: 10 },
  qtyText: { color: "#fff", fontWeight: "700" },
  itemName: { fontSize: 15, fontWeight: "600" },
  itemComments: { fontSize: 12 },
  checkbox: { width: 24, height: 24, borderWidth: 1, borderColor: "#999", justifyContent: "center", alignItems: "center" },
  checked: { width: 16, height: 16, backgroundColor: "#2a9d8f", borderRadius: 3 },
  homeButton: { padding: 10, backgroundColor: "#A47C46", borderRadius: 5, marginBottom: 10, alignSelf: "center" },
  footer: { paddingVertical: 10, backgroundColor: "#f4f1dc" },
  swipeAction: { backgroundColor: "#2a9d8f", justifyContent: "center", alignItems: "center", width: 80, height: "100%", borderRadius: 6 },
});

export default ShowOrdersScreen;

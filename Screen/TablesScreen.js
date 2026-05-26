import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import {gloabalTableid,globalUsername,globalUserID,globalPersons, setGlobalPersons, globalCompanyID} from '../Staff/globalState';


import {
  HubConnectionBuilder,
  LogLevel,
  HttpTransportType,
  HubConnectionState,
} from '@microsoft/signalr';

import {
  BASE_URL,
  setGloabalTableid,
} from '../Staff/globalState';

const images = [require('../assets/table.png')];

//For remote: use BASE_URL directly (no /tableHub path)
const SIGNALR_URL = `${BASE_URL}/orderservice/tableHub`;

const ITEMS_PER_PAGE = 20;

const getStatusColor = (status) => {
  switch (status) {
    case 0:
      return '#FF0000'; // Κενό
    case 1:
      return '#00AA00'; // Κατειλημμένο
    case 2:
      return '#FFA500'; // Κρατημένο
    default:
      return '#999999';
  }
};

const TableScreen = () => {
  const navigation = useNavigation();

  const connectionRef = useRef(null);

  const [page, setPage] = useState(1);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Σύνδεση...');

  // =========================
  // FETCH TABLES DATA
  // =========================

  const fetchTables = async () => {
    try {
      console.log('Fetching tables from:', `${BASE_URL}/Tables`);

      const url = `${BASE_URL}/Tables`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log('RAW RESPONSE:', data);

      const formattedTables = data.map((table) => ({
        id: String(table.tableid),
        title: `Τραπέζι ${table.tableid}`,
        image: images[0],
        status: Number(table.status),
      }));

      setTables(formattedTables);
      setLoading(false);

    } catch (error) {
      console.error('❌ Error fetching tables:', error);
      setLoading(false);
    }
  };


  useEffect(() => {
    let mounted = true;

    const initializeSignalR = async () => {
      try {
        // Πρώτα φορτώνουμε τα τραπέζια
        await fetchTables();

        console.log('🔵 Initializing SignalR...');
        console.log('🔵 SignalR URL:', SIGNALR_URL);
        console.log('🔵 Company ID:', globalCompanyID);
        console.log('🔵 BASE_URL:', BASE_URL);

        // Δημιουργούμε τη σύνδεση SignalR
const connection = new HubConnectionBuilder()
  .withUrl(SIGNALR_URL, {
    transport:
      HttpTransportType.WebSockets |
      HttpTransportType.ServerSentEvents |
      HttpTransportType.LongPolling,

    skipNegotiation: false,
    withCredentials: false,
  })
  .withAutomaticReconnect([0, 1000, 3000, 5000])
  .configureLogging(LogLevel.Trace)
  .build();

        // Event: Σύνδεση επιτυχής
        connection.onopen = () => {
          console.log('SignalR onopen event fired');
          console.log('Connection state:', connection.state);
          console.log('Transport:', connection.transport);
          
          if (mounted) {
            setConnected(true);
            setConnectionStatus('Συνδεδεμένο');
          }
          
          // Join company group
          if (connection.state === HubConnectionState.Connected) {
            connection.invoke('JoinCompanyGroup', String(globalCompanyID))
              .then(() => console.log('Joined group:', globalCompanyID))
              .catch(err => console.error('Error joining group:', err));
          }
        };

        // Event: Αποσύνδεση
        connection.onclose = (error) => {
          console.log('SignalR onclose event fired', error);
          if (mounted) {
            setConnected(false);
            setConnectionStatus('Αποσυνδεδεμένο');
          }
        };

        // Event: Σφάλμα
        connection.onerror = (error) => {
          console.error('SignalR onerror event fired:', error);
          if (mounted) {
            setConnected(false);
            setConnectionStatus('Σφάλμα σύνδεσης');
          }
        };

        // Event: Reconnecting
        connection.onreconnecting = (error) => {
          console.warn('SignalR reconnecting:', error);
          if (mounted) {
            setConnectionStatus('Επανασύνδεση...');
          }
        };

        // Event: Reconnected
        connection.onreconnected = (connectionId) => {
          console.log('SignalR reconnected:', connectionId);
          if (mounted) {
            setConnected(true);
            setConnectionStatus('Ξανασυνδεδεμένο');
          }
          // Re-join group
          if (connection.state === HubConnectionState.Connected) {
            connection.invoke('JoinCompanyGroup', String(globalCompanyID))
              .catch(err => console.error('❌ Error joining group:', err));
          }
        };

        //Listener για αλλαγή status ενός τραπεζιού
        connection.on('TableStatusChanged', (tableId, newStatus) => {
          console.log(`✅ RECEIVED: Table ${tableId} status changed to ${newStatus}`);
          
          if (mounted) {
            setTables((prevTables) => {
              const updated = prevTables.map((table) => {
                if (String(table.id) === String(tableId)) {
                  console.log(`✅ Updated table ${tableId}:`, { status: Number(newStatus) });
                  return { ...table, status: Number(newStatus) };
                }
                return table;
              });
              return updated;
            });
          }
        });

        // Listener για batch ενημέρωση πολλών τραπεζιών
        connection.on('TablesStatusUpdated', (statusUpdates) => {
          console.log('RECEIVED: Multiple tables updated:', statusUpdates);
          
          if (mounted) {
            setTables((prevTables) =>
              prevTables.map((table) => {
                if (statusUpdates[table.id] !== undefined) {
                  console.log(`Updated table ${table.id}:`, { status: Number(statusUpdates[table.id]) });
                  return { ...table, status: Number(statusUpdates[table.id]) };
                }
                return table;
              })
            );
          }
        });

        //console.log('Attempting to start connection...');
        
        // Σύνδεση
        await connection.start();
        
        //console.log('Connection started successfully!');
        //console.log('Connection state:', connection.state);
        //console.log('Transport:', connection.transport);
        
        if (mounted) {
          connectionRef.current = connection;
          setConnected(true);
          setConnectionStatus('Συνδεδεμένο');
        }

      } catch (error) {
        //console.error('Error initializing SignalR:', error);
        //console.error('Full error:', JSON.stringify(error));
        
        if (mounted) {
          setLoading(false);
          setConnectionStatus('Σφάλμα σύνδεσης');
          setConnected(false);
          
          // Log debugging info
         // console.log('BASE_URL:', BASE_URL);
         // console.log('SIGNALR_URL:', SIGNALR_URL);
        //  console.log('globalCompanyID:', globalCompanyID);
        }
      }
    };

    initializeSignalR();

    return () => {
      mounted = false;
      // Cleanup: Αποσύνδεση από το hub όταν αφήνουμε την οθόνη
      if (connectionRef.current) {
        console.log('🔵 Cleanup: Leaving company group');
        connectionRef.current.invoke('LeaveCompanyGroup', String(globalCompanyID))
          .catch(err => console.error('Error leaving group:', err));
        
        console.log('🔵 Cleanup: Stopping connection');
        connectionRef.current.stop()
          .then(() => console.log('✅ Connection stopped'))
          .catch(err => console.error('Error stopping connection:', err));
      }
    };
  }, []);


  const maxPages = Math.max(
    1,
    Math.ceil(tables.length / ITEMS_PER_PAGE)
  );

  const startIndex = (page - 1) * ITEMS_PER_PAGE;

  const endIndex = startIndex + ITEMS_PER_PAGE;

  const currentPageData = tables.slice(
    startIndex,
    endIndex
  );


  const handleItemPress = (item) => {

    setGloabalTableid(item.id);

    navigation.navigate('OrderInfo', {
      tableNumber: item.id,
    });
  };


  const onGestureEvent = (event) => {

    if (event.nativeEvent.state === State.END) {

      const { translationX } = event.nativeEvent;

      if (
        translationX < -50 &&
        page < maxPages
      ) {
        setPage((prev) => prev + 1);
      }

      else if (
        translationX > 50 &&
        page > 1
      ) {
        setPage((prev) => prev - 1);
      }
    }
  };

  const renderItem = ({ item }) => {

    const statusColor = getStatusColor(item.status);

    const statusText =
      item.status === 2
        ? 'Κρατημένο'
        : '';

    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
      >

        <View
          style={[
            styles.statusIndicator,
            {
              backgroundColor: statusColor,
            },
          ]}
        />

        <Image
          source={item.image}
          style={styles.image}
        />

        {statusText ? (
          <Text style={styles.statusText}>
            {statusText}
          </Text>
        ) : null}

        <Text style={styles.itemText}>
          {item.id}
        </Text>

      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#A47C46"
        />

        <Text style={styles.loadingText}>
          Σύνδεση με server...
        </Text>
      </View>
    );
  }

  return (
    <PanGestureHandler
      onHandlerStateChange={onGestureEvent}
    >

      <View style={styles.container}>

        {/* Connection Status */}

        <View
          style={[
            styles.connectionBanner,
            {
              backgroundColor: connected
                ? '#00AA00'
                : '#CC0000',
            },
          ]}
        >
          <Text style={styles.connectionText}>
            {connectionStatus}
          </Text>
        </View>

        {/* Tables */}

        <FlatList
          data={currentPageData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          scrollEnabled={false}
          contentContainerStyle={
            styles.flatListContent
          }
        />

        {/* Pagination */}

        <View style={styles.paginationContainer}>

          <TouchableOpacity
            style={[
              styles.pageButton,
              page === 1 &&
                styles.pageButtonDisabled,
            ]}
            disabled={page === 1}
            onPress={() =>
              setPage((prev) => prev - 1)
            }
          >
            <Text style={styles.pageButtonText}>
              ← Προηγούμενη
            </Text>
          </TouchableOpacity>

          <Text style={styles.pageInfo}>
            Σελίδα {page} από {maxPages}
          </Text>

          <TouchableOpacity
            style={[
              styles.pageButton,
              page === maxPages &&
                styles.pageButtonDisabled,
            ]}
            disabled={page === maxPages}
            onPress={() =>
              setPage((prev) => prev + 1)
            }
          >
            <Text style={styles.pageButtonText}>
              Επόμενη →
            </Text>
          </TouchableOpacity>

        </View>

        {/* Legend */}

        <View style={styles.legendContainer}>

          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                {
                  backgroundColor: '#FF0000',
                },
              ]}
            />
            <Text style={styles.legendText}>
              Κενό
            </Text>
          </View>

          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                {
                  backgroundColor: '#00AA00',
                },
              ]}
            />
            <Text style={styles.legendText}>
              Κατειλημμένο
            </Text>
          </View>

          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                {
                  backgroundColor: '#FFA500',
                },
              ]}
            />
            <Text style={styles.legendText}>
              Κρατημένο
            </Text>
          </View>

        </View>

        {/* Home Button */}

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() =>
            navigation.navigate('Home')
          }
        >
          <Text style={styles.homeButtonText}>
            Επιστροφή
          </Text>
        </TouchableOpacity>

      </View>

    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#E5E5D5',
    padding: 10,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E5D5',
  },

  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },

  connectionBanner: {
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 10,
  },

  connectionText: {
    color: '#FFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  flatListContent: {
    flexGrow: 1,
  },

  itemContainer: {
    flex: 1,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    position: 'relative',
  },

  statusIndicator: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFF',
    zIndex: 10,
  },

  image: {
    width: '100%',
    height: '80%',
    resizeMode: 'contain',
  },

  itemText: {
    position: 'absolute',
    fontSize: 24,
    color: '#FFF',
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: {
      width: 1,
      height: 1,
    },
    textShadowRadius: 2,
  },

  statusText: {
    position: 'absolute',
    bottom: 10,
    fontSize: 12,
    color: '#FFF',
    fontWeight: 'bold',
    backgroundColor: '#FFA500',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },

  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },

  pageButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#A47C46',
    borderRadius: 5,
  },

  pageButtonDisabled: {
    backgroundColor: '#CCC',
    opacity: 0.5,
  },

  pageButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },

  pageInfo: {
    fontWeight: '600',
    color: '#333',
  },

  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
    borderTopWidth: 1,
    borderTopColor: '#DDD',
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },

  legendText: {
    fontSize: 12,
    color: '#333',
  },

  homeButton: {
    padding: 12,
    backgroundColor: '#A47C46',
    borderRadius: 5,
    marginBottom: 10,
    alignSelf: 'center',
    minWidth: 150,
  },

  homeButtonText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default TableScreen;
import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

/**
 * Custom Hook για διαχείριση SignalR σύνδεσης
 * @param {string} url - Το URL του SignalR Hub
 * @param {object} handlers - Αντικείμενο με τους event handlers
 * @returns {object} - Αντικείμενο με τη σύνδεση και τις μεθόδους
 */
export const useSignalR = (url, handlers = {}) => {
  const connectionRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    let mounted = true;

    const initializeConnection = async () => {
      try {
        const connection = new signalR.HubConnectionBuilder()
          .withUrl(url)
          .withAutomaticReconnect([0, 0, 5000, 10000, 15000, 30000])
          .withHubProtocol(new signalR.JsonHubProtocol())
          .build();

        // Διαχείριση reconnect events
        connection.onreconnecting((error) => {
          console.log(`SignalR attempting to reconnect: ${error}`);
          reconnectAttempts.current += 1;
        });

        connection.onreconnected((connectionId) => {
          console.log(`SignalR reconnected: ${connectionId}`);
          reconnectAttempts.current = 0;
        });

        connection.onclose((error) => {
          console.log(`SignalR connection closed: ${error}`);
        });

        // Καταχώρηση όλων των handlers
        Object.keys(handlers).forEach((eventName) => {
          connection.on(eventName, handlers[eventName]);
        });

        // Έναρξη σύνδεσης
        await connection.start();
        
        if (mounted) {
          connectionRef.current = connection;
          console.log('SignalR connected successfully');
        }
      } catch (error) {
        console.error('SignalR connection failed:', error);
        
        // Retry logic
        if (reconnectAttempts.current < maxReconnectAttempts) {
          setTimeout(() => {
            if (mounted) {
              initializeConnection();
            }
          }, 5000);
        }
      }
    };

    initializeConnection();

    return () => {
      mounted = false;
      if (connectionRef.current) {
        connectionRef.current.stop();
      }
    };
  }, [url]);

  return connectionRef;
};

/**
 * Custom Hook για API calls με error handling
 * @param {string} baseUrl - Το base URL του API
 * @returns {object} - Αντικείμενο με τις API methods
 */
export const useApi = (baseUrl) => {
  const fetchTables = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/tables`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching tables:', error);
      throw error;
    }
  };

  const updateTableStatus = async (tableId, status) => {
    try {
      const response = await fetch(`${baseUrl}/api/tables/${tableId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating table status:', error);
      throw error;
    }
  };

  const updateMultipleTableStatuses = async (updates) => {
    try {
      const response = await fetch(`${baseUrl}/api/tables/batch-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating multiple tables:', error);
      throw error;
    }
  };

  const getTableById = async (tableId) => {
    try {
      const response = await fetch(`${baseUrl}/api/tables/${tableId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching table:', error);
      throw error;
    }
  };

  return {
    fetchTables,
    updateTableStatus,
    updateMultipleTableStatuses,
    getTableById,
  };
};

/**
 * Custom Hook για διαχείριση table status
 * @returns {object} - Utilities για status management
 */
export const useTableStatus = () => {
  const getStatusColor = (status) => {
    switch (status) {
      case 0:
        return '#FF0000'; // Κόκκινο - Κενό
      case 1:
        return '#00AA00'; // Πράσινο - Κατειλημμένο
      case 2:
        return '#FFA500'; // Πορτοκαλί - Κρατημένο
      default:
        return '#CCCCCC'; // Γκρί - Άγνωστο
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return 'Κενό';
      case 1:
        return 'Κατειλημμένο';
      case 2:
        return 'Κρατημένο';
      default:
        return 'Άγνωστο';
    }
  };

  const isTableAvailable = (status) => status === 0;
  const isTableOccupied = (status) => status === 1;
  const isTableReserved = (status) => status === 2;

  return {
    getStatusColor,
    getStatusText,
    isTableAvailable,
    isTableOccupied,
    isTableReserved,
  };
};

/**
 * ============================================================================
 * USE SENSOR DATA HOOK
 * ============================================================================
 * 
 * Unified hook for accessing sensor data from the backend API.
 * Fetches real sensor readings from your Render-deployed backend.
 * 
 * FEATURES:
 * - Polls the backend API at configured intervals
 * - Determines ESP32 connection status from data timestamps
 * - Maintains history for chart visualization
 * - Falls back gracefully on errors
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { 
  SensorData, 
  HistoryDataPoint, 
  ConnectionState,
  DataSourceMode 
} from '@/types/sensor.types';
import { 
  APP_CONFIG, 
  DATA_SOURCE_MODE,
  HISTORY_MAX_POINTS 
} from '@/config/app.config';
import { 
  esp32Service,
  type ExtendedSensorData,
} from '@/services/esp32Service';
import {
  generateMockHistoryData,
  generateRandomSensorData,
  createHistoryPoint,
  DEFAULT_MOCK_DATA,
} from '@/services/mockDataService';

// ============================================================================
// HOOK INTERFACE
// ============================================================================

export interface UseSensorDataResult {
  /** Current sensor readings */
  sensorData: SensorData;
  /** Historical data for charts */
  historyData: HistoryDataPoint[];
  /** Connection state (ESP32 online/offline) */
  connectionState: ConnectionState;
  /** Configuration info */
  config: {
    endpoint: string;
    updateInterval: number;
    dataSource: DataSourceMode;
  };
  /** Manual refresh function */
  refresh: () => Promise<void>;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export const useSensorData = (): UseSensorDataResult => {
  // Sensor data state
  const [sensorData, setSensorData] = useState<SensorData>(DEFAULT_MOCK_DATA);
  
  // History data state - start empty, will fill with real data
  const [historyData, setHistoryData] = useState<HistoryDataPoint[]>([]);
  
  // Connection state
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    lastUpdate: null,
    isChecking: true,
    error: null,
  });

  // Ref to track mounted state
  const isMountedRef = useRef(true);
  
  // Track if we've done initial fetch
  const initialFetchDone = useRef(false);

  /**
   * Add a new point to history, maintaining max length
   */
  const addHistoryPoint = useCallback((data: SensorData, timestamp?: Date) => {
    const newPoint = createHistoryPoint(data, timestamp);
    setHistoryData((prev) => {
      const updated = [...prev, newPoint];
      return updated.slice(-HISTORY_MAX_POINTS);
    });
  }, []);

  /**
   * Fetch data from the backend API
   */
  const fetchData = useCallback(async () => {
    if (!isMountedRef.current) return;

    setConnectionState((prev) => ({ 
      ...prev, 
      isChecking: true, 
      error: null 
    }));

    try {
      let newData: SensorData;
      let isESP32Online = false;
      let receivedAt: Date | null = null;

      if (DATA_SOURCE_MODE === 'mock') {
        // Use mock data service
        newData = generateRandomSensorData();
        isESP32Online = true;
        receivedAt = new Date();
      } else {
        // Fetch from real backend API
        const extendedData: ExtendedSensorData = await esp32Service.fetchSensorData();
        
        newData = {
          soilMoisture: extendedData.soilMoisture,
          light: extendedData.light,
        };
        
        isESP32Online = extendedData.isESP32Online;
        receivedAt = extendedData.receivedAt;
      }

      if (!isMountedRef.current) return;

      const now = new Date();
      
      setSensorData(newData);
      addHistoryPoint(newData, receivedAt || now);
      
      setConnectionState({
        isConnected: isESP32Online,
        lastUpdate: receivedAt || now,
        isChecking: false,
        error: isESP32Online ? null : 'ESP32 offline - no recent data',
      });

    } catch (error) {
      if (!isMountedRef.current) return;

      const errorMessage = error instanceof Error ? error.message : 'Connection failed';

      // Keep showing last known values, but update connection state
      setConnectionState({
        isConnected: false,
        lastUpdate: connectionState.lastUpdate,
        isChecking: false,
        error: errorMessage,
      });

      // If this is the first fetch and it failed, use mock data for initial display
      if (!initialFetchDone.current) {
        setSensorData(DEFAULT_MOCK_DATA);
        setHistoryData(generateMockHistoryData(10, APP_CONFIG.esp32.updateInterval));
      }
    }

    initialFetchDone.current = true;
  }, [addHistoryPoint, connectionState.lastUpdate]);

  /**
   * Manual refresh function
   */
  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  /**
   * Setup polling interval
   */
  useEffect(() => {
    isMountedRef.current = true;
    
    // Initial fetch
    fetchData();

    // Setup polling interval
    const intervalId = setInterval(
      fetchData, 
      APP_CONFIG.esp32.updateInterval * 1000
    );

    // Cleanup
    return () => {
      isMountedRef.current = false;
      clearInterval(intervalId);
    };
  }, []); // Empty deps - fetchData is stable via useCallback

  return {
    sensorData,
    historyData,
    connectionState,
    config: {
      endpoint: APP_CONFIG.esp32.endpoint,
      updateInterval: APP_CONFIG.esp32.updateInterval,
      dataSource: DATA_SOURCE_MODE,
    },
    refresh,
  };
};

// ============================================================================
// ADDITIONAL HOOKS
// ============================================================================

/**
 * Hook to get only the current sensor readings
 */
export const useCurrentSensorData = () => {
  const { sensorData, connectionState, refresh } = useSensorData();
  return { sensorData, connectionState, refresh };
};

/**
 * Hook to get only history data
 */
export const useSensorHistory = () => {
  const { historyData } = useSensorData();
  return historyData;
};

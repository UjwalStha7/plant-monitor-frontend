/**
 * ============================================================================
 * USE SENSOR DATA HOOK
 * ============================================================================
 * 
 * Unified hook for accessing sensor data from any source.
 * Automatically selects the data source based on configuration.
 * 
 * USAGE:
 * ------
 * ```tsx
 * const { 
 *   sensorData, 
 *   historyData, 
 *   connectionState, 
 *   refresh 
 * } = useSensorData();
 * ```
 * 
 * DATA SOURCE SWITCHING:
 * ----------------------
 * Change DATA_SOURCE_MODE in app.config.ts to switch between:
 * - 'mock': Simulated data for development
 * - 'esp32': Real HTTP polling from ESP32
 * - 'websocket': Real-time WebSocket (future)
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
  generateMockHistoryData,
  generateRandomSensorData,
  createHistoryPoint,
  DEFAULT_MOCK_DATA,
} from '@/services';

// ============================================================================
// HOOK INTERFACE
// ============================================================================

export interface UseSensorDataResult {
  // Current sensor readings
  sensorData: SensorData;
  // Historical data for charts
  historyData: HistoryDataPoint[];
  // Connection state
  connectionState: ConnectionState;
  // Configuration info
  config: {
    endpoint: string;
    updateInterval: number;
    dataSource: DataSourceMode;
  };
  // Manual refresh function
  refresh: () => Promise<void>;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export const useSensorData = (): UseSensorDataResult => {
  // Sensor data state
  const [sensorData, setSensorData] = useState<SensorData>(DEFAULT_MOCK_DATA);
  
  // History data state - initialize with mock history for immediate chart display
  const [historyData, setHistoryData] = useState<HistoryDataPoint[]>(() => 
    generateMockHistoryData(20, APP_CONFIG.esp32.updateInterval)
  );
  
  // Connection state
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    lastUpdate: null,
    isChecking: false,
    error: null,
  });

  // Ref to track mounted state
  const isMountedRef = useRef(true);

  /**
   * Add a new point to history, maintaining max length
   */
  const addHistoryPoint = useCallback((data: SensorData) => {
    const newPoint = createHistoryPoint(data);
    setHistoryData((prev) => {
      const updated = [...prev, newPoint];
      return updated.slice(-HISTORY_MAX_POINTS);
    });
  }, []);

  /**
   * Fetch data from the appropriate source
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

      if (DATA_SOURCE_MODE === 'mock') {
        // Use mock data service
        newData = generateRandomSensorData();
      } else {
        // Use ESP32 service
        newData = await esp32Service.fetchSensorData();
      }

      if (!isMountedRef.current) return;

      const now = new Date();
      
      setSensorData(newData);
      addHistoryPoint(newData);
      
      setConnectionState({
        isConnected: DATA_SOURCE_MODE !== 'mock', // Mock is always "connected"
        lastUpdate: now,
        isChecking: false,
        error: null,
      });

    } catch (error) {
      if (!isMountedRef.current) return;

      // On error, fall back to mock data to keep UI active
      const fallbackData = generateRandomSensorData();
      const now = new Date();
      
      setSensorData(fallbackData);
      addHistoryPoint(fallbackData);

      setConnectionState({
        isConnected: false,
        lastUpdate: now,
        isChecking: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      });
    }
  }, [addHistoryPoint]);

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
  }, [fetchData]);

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
 * Lighter weight if you don't need history
 */
export const useCurrentSensorData = () => {
  const { sensorData, connectionState, refresh } = useSensorData();
  return { sensorData, connectionState, refresh };
};

/**
 * Hook to get only history data
 * Useful for chart-only components
 */
export const useSensorHistory = () => {
  const { historyData } = useSensorData();
  return historyData;
};

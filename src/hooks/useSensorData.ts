// src/hooks/useSensorData.ts
import { useState, useEffect, useCallback } from 'react';
import { api, SensorData, DeviceStatus } from '../services/api';

const POLL_INTERVAL = 5000; // 5 seconds

interface SensorDataState {
  soilMoisture: number;
  light: number;
}

interface ConnectionState {
  isConnected: boolean;
  lastUpdate: Date | null;
  isChecking: boolean;
}

export function useSensorData() {
  const [sensorData, setSensorData] = useState<SensorDataState>({
    soilMoisture: 0,
    light: 0,
  });

  const [historyData, setHistoryData] = useState<SensorData[]>([]);
  
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    lastUpdate: null,
    isChecking: false,
  });

  const [config] = useState({
    endpoint: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    updateInterval: POLL_INTERVAL,
  });

  const fetchLatestData = useCallback(async () => {
    setConnectionState(prev => ({ ...prev, isChecking: true }));
    
    try {
      // Fetch latest sensor data
      const latestData = await api.getLatestData();
      
      // Fetch device status
      const deviceStatus = await api.getDeviceStatus();

      if (latestData) {
        setSensorData({
          soilMoisture: latestData.soilValue,
          light: latestData.ldrValue,
        });

        setConnectionState({
          isConnected: deviceStatus?.status === 'online' || false,
          lastUpdate: new Date(latestData.timestamp),
          isChecking: false,
        });
      } else {
        setConnectionState(prev => ({
          ...prev,
          isConnected: false,
          isChecking: false,
        }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setConnectionState(prev => ({
        ...prev,
        isConnected: false,
        isChecking: false,
      }));
    }
  }, []);

  const fetchHistoricalData = useCallback(async () => {
    try {
      const data = await api.getHistoricalData(24, 100);
      setHistoryData(data);
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchLatestData();
    fetchHistoricalData();
  }, [fetchLatestData, fetchHistoricalData]);

  // Poll for updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLatestData();
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchLatestData]);

  // Refresh historical data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchHistoricalData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchHistoricalData]);

  const refresh = useCallback(() => {
    fetchLatestData();
    fetchHistoricalData();
  }, [fetchLatestData, fetchHistoricalData]);

  return {
    sensorData,
    historyData,
    connectionState,
    config,
    refresh,
  };
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { generateMockHistoryData } from '@/data/mockData';

export interface ESP32Config {
  endpoint: string;
  updateInterval: number;
}

interface SensorData {
  soilMoisture: number;
  light: number;
}

interface HistoryDataPoint {
  time: string;
  timestamp: number;
  soilMoisture: number;
  light: number;
}

export interface ESP32ConnectionState {
  isConnected: boolean;
  lastUpdate: Date | null;
  isChecking: boolean;
  error: string | null;
}

const DEFAULT_CONFIG: ESP32Config = {
  endpoint: '192.168.137.77',
  updateInterval: 5,
};

export const useEsp32Connection = (config: ESP32Config = DEFAULT_CONFIG) => {
  const [connectionState, setConnectionState] = useState<ESP32ConnectionState>({
    isConnected: false,
    lastUpdate: null,
    isChecking: false,
    error: null,
  });

  const [sensorData, setSensorData] = useState<SensorData>({
    soilMoisture: 1200,
    light: 3200,
  });

  const [historyData, setHistoryData] = useState<HistoryDataPoint[]>(() =>
    generateMockHistoryData(20)
  );

  const lastUpdateRef = useRef<Date | null>(null);

  const addHistoryPoint = useCallback((soilMoisture: number, light: number) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    setHistoryData((prev) => {
      const newData = [
        ...prev,
        {
          time: timeStr,
          timestamp: now.getTime(),
          soilMoisture,
          light,
        },
      ];
      return newData.slice(-30); // Keep last 30 points
    });
  }, []);

  const checkConnection = useCallback(async () => {
    setConnectionState((prev) => ({ ...prev, isChecking: true, error: null }));

    try {
      // ESP32 API endpoint will be connected here
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`http://${config.endpoint}/`, {
        method: 'GET',
        signal: controller.signal,
        mode: 'cors',
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const now = new Date();
        lastUpdateRef.current = now;

        // Update sensor data from ESP32
        const newSoilMoisture = data.soilMoisture ?? sensorData.soilMoisture;
        const newLight = data.light ?? sensorData.light;

        setSensorData({
          soilMoisture: newSoilMoisture,
          light: newLight,
        });

        addHistoryPoint(newSoilMoisture, newLight);

        setConnectionState({
          isConnected: true,
          lastUpdate: now,
          isChecking: false,
          error: null,
        });
      } else {
        throw new Error('ESP32 response not OK');
      }
    } catch (error) {
      // Connection failed - use simulated data for demo
      const now = new Date();
      lastUpdateRef.current = now;

      // Generate realistic fluctuating values for demo
      const newSoilMoisture = Math.floor(800 + Math.random() * 2000);
      const newLight = Math.floor(2000 + Math.random() * 2000);

      setSensorData({
        soilMoisture: newSoilMoisture,
        light: newLight,
      });

      addHistoryPoint(newSoilMoisture, newLight);

      setConnectionState({
        isConnected: false,
        lastUpdate: now,
        isChecking: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      });
    }
  }, [config.endpoint, sensorData.soilMoisture, sensorData.light, addHistoryPoint]);

  // Auto-check connection on mount and at intervals
  useEffect(() => {
    checkConnection();

    const intervalId = setInterval(checkConnection, config.updateInterval * 1000);

    return () => clearInterval(intervalId);
  }, [config.updateInterval, checkConnection]);

  return {
    ...connectionState,
    config,
    refresh: checkConnection,
    sensorData,
    historyData,
  };
};

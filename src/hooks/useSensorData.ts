// src/hooks/useSensorData.ts - DIRECT API CALLS (NO SERVICE ABSTRACTION)
import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://plant-monitor-api.onrender.com';

interface SensorDataState {
  soilMoisture: number;
  light: number;
}

export interface UseSensorDataResult {
  sensorData: SensorDataState;
  historyData: any[];
  connectionState: {
    isConnected: boolean;
    lastUpdate: Date | null;
    isChecking: boolean;
  };
  config: {
    endpoint: string;
    updateInterval: number;
  };
  refresh: () => void;
}

export function useSensorData(): UseSensorDataResult {
  const [sensorData, setSensorData] = useState<SensorDataState>({
    soilMoisture: 0,
    light: 0,
  });
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [connectionState, setConnectionState] = useState({
    isConnected: false,
    lastUpdate: null,
    isChecking: false,
  });

  const [config] = useState({
    endpoint: API_BASE_URL + '/api/sensor-data',
    updateInterval: 5000,
  });

  const fetchLatestData = useCallback(async () => {
    setConnectionState(prev => ({ ...prev, isChecking: true }));
    
    try {
      console.log('🔄 DIRECT API CALL:', config.endpoint);
      const response = await fetch(config.endpoint);
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const result = await response.json();
      console.log('✅ DIRECT API RESPONSE:', result);
      
      const latest = result.data?.[0] || result.latest;
      if (latest) {
        setSensorData({
          soilMoisture: latest.soilValue || 0,
          light: latest.ldrValue || 0,
        });
        setConnectionState({
          isConnected: true,
          lastUpdate: new Date(),
          isChecking: false,
        });
      }
    } catch (error) {
      console.error('❌ DIRECT API ERROR:', error);
      setConnectionState(prev => ({
        ...prev,
        isConnected: false,
        isChecking: false,
      }));
    }
  }, [config.endpoint]);

  const fetchHistoricalData = useCallback(async () => {
    try {
      const url = `${config.endpoint}?limit=100`;
      console.log('📈 History:', url);
      const response = await fetch(url);
      const result = await response.json();
      setHistoryData(result.data || []);
    } catch (error) {
      console.error('❌ History error:', error);
    }
  }, [config.endpoint]);

  useEffect(() => {
    fetchLatestData();
    fetchHistoricalData();
  }, [fetchLatestData, fetchHistoricalData]);

  useEffect(() => {
    const interval = setInterval(fetchLatestData, config.updateInterval);
    return () => clearInterval(interval);
  }, [fetchLatestData, config.updateInterval]);

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

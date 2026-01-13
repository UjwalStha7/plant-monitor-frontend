import { useState, useEffect, useCallback } from 'react';
import { api, POLL_INTERVAL } from '../services/api';

/**
 * Custom hook for fetching and managing plant monitoring data
 */
export function usePlantData() {
  const [latestData, setLatestData] = useState(null);
  const [deviceStatus, setDeviceStatus] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch latest sensor data
  const fetchLatestData = useCallback(async () => {
    try {
      const data = await api.getLatestData();
      setLatestData(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch latest data');
      console.error(err);
    }
  }, []);

  // Fetch device status
  const fetchDeviceStatus = useCallback(async () => {
    try {
      const status = await api.getDeviceStatus();
      setDeviceStatus(status);
    } catch (err) {
      console.error('Failed to fetch device status:', err);
    }
  }, []);

  // Fetch historical data
  const fetchHistoricalData = useCallback(async (hours = 24, limit = 100) => {
    try {
      const data = await api.getHistoricalData(hours, limit);
      setHistoricalData(data);
    } catch (err) {
      console.error('Failed to fetch historical data:', err);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      await Promise.all([
        fetchLatestData(),
        fetchDeviceStatus(),
        fetchHistoricalData()
      ]);
      setLoading(false);
    };

    fetchInitialData();
  }, [fetchLatestData, fetchDeviceStatus, fetchHistoricalData]);

  // Set up polling for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLatestData();
      fetchDeviceStatus();
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchLatestData, fetchDeviceStatus]);

  // Refresh historical data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchHistoricalData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchHistoricalData]);

  return {
    latestData,
    deviceStatus,
    historicalData,
    loading,
    error,
    refetch: {
      latest: fetchLatestData,
      status: fetchDeviceStatus,
      history: fetchHistoricalData
    }
  };
}

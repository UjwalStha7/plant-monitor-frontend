// API Service for Plant Monitoring System

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 
  || 'https://plant-monitor-api.onrender.com/api';  // ← Use production URL by default!

const POLL_INTERVAL = parseInt(import.meta.env.VITE_POLL_INTERVAL) || 5000;

class PlantMonitoringAPI {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Fetch latest sensor data
   * @returns {Promise<Object>} Latest sensor reading object
   */
  async getLatestData(deviceId = 'ESP32_001') {
    try {
      const url = deviceId 
        ? `${this.baseUrl}/readings/latest?deviceId=${deviceId}`
        : `${this.baseUrl}/readings/latest`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        return result.reading;  // ← Return the reading object directly
      } else {
        throw new Error(result.message || 'No data available yet');
      }
    } catch (error) {
      console.error('Error fetching latest data:', error);
      throw error;
    }
  }

  /**
   * Fetch historical sensor data
   * @param {number} hours - Number of hours to look back (client-side filter)
   * @param {number} limit - Maximum number of records to request
   * @returns {Promise<Array>} Array of sensor readings
   */
  async getHistoricalData(hours = 24, limit = 100) {
    try {
      const response = await fetch(
        `${this.baseUrl}/sensor-data?limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Optional: filter client-side to approximate last X hours
        const cutoffTime = Date.now() - hours * 60 * 60 * 1000;
        const filtered = result.data.filter(item => 
          new Date(item.timestamp).getTime() >= cutoffTime
        );
        return filtered;
      } else {
        throw new Error(result.message || 'Failed to fetch historical data');
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
      throw error;
    }
  }

  // Optional: Simple health check using root endpoint
  async checkHealth() {
    try {
      const response = await fetch(this.baseUrl.replace('/api', '')); // hits root /
      const result = await response.json();
      return result.status === 'online';
    } catch {
      return false;
    }
  }

  // If you need stats → use root / for now
  async getStats() {
    try {
      const response = await fetch(this.baseUrl.replace('/api', ''));
      const result = await response.json();
      return {
        totalReadings: result.statistics?.totalReadings || 0,
        totalDevices: result.statistics?.totalDevices || 0,
        latestReading: result.statistics?.latestReading || null
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }

  // getDeviceStatus – not implemented in backend yet; stub or remove for now
  async getDeviceStatus(deviceId = 'ESP32_001') {
    // Backend doesn't have this → return mock or throw
    throw new Error('Device status endpoint not implemented in backend yet');
  }
}

export const api = new PlantMonitoringAPI();
export { POLL_INTERVAL };
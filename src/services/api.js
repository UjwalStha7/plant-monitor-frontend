// API Service for Plant Monitoring System

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const POLL_INTERVAL = parseInt(import.meta.env.VITE_POLL_INTERVAL) || 5000;

class PlantMonitoringAPI {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Fetch latest sensor data
   * @returns {Promise<Object>} Latest sensor reading
   */
  async getLatestData() {
    try {
      const response = await fetch(`${this.baseUrl}/sensor-data/latest`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch latest data');
      }
    } catch (error) {
      console.error('Error fetching latest data:', error);
      throw error;
    }
  }

  /**
   * Fetch historical sensor data
   * @param {number} hours - Number of hours to look back
   * @param {number} limit - Maximum number of records
   * @returns {Promise<Array>} Array of sensor readings
   */
  async getHistoricalData(hours = 24, limit = 100) {
    try {
      const response = await fetch(
        `${this.baseUrl}/sensor-data/history?hours=${hours}&limit=${limit}`
      );
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch historical data');
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
      throw error;
    }
  }

  /**
   * Get device status (online/offline)
   * @param {string} deviceId - Device identifier
   * @returns {Promise<Object>} Device status info
   */
  async getDeviceStatus(deviceId = 'ESP32_001') {
    try {
      const response = await fetch(
        `${this.baseUrl}/device/status?deviceId=${deviceId}`
      );
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch device status');
      }
    } catch (error) {
      console.error('Error fetching device status:', error);
      throw error;
    }
  }

  /**
   * Get system statistics
   * @returns {Promise<Object>} System stats
   */
  async getStats() {
    try {
      const response = await fetch(`${this.baseUrl}/stats`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }

  /**
   * Check backend health
   * @returns {Promise<boolean>} True if backend is healthy
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      const result = await response.json();
      return result.status === 'ok';
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const api = new PlantMonitoringAPI();
export { POLL_INTERVAL };

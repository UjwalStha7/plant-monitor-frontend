// src/services/api.ts - FIXED FOR RENDER BACKEND
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://plant-monitor-api.onrender.com';
// 🔄 REPLACE "YOUR-RENDER-APP.onrender.com" with your actual Render URL

export interface SensorData {
  _id: string;
  deviceId: string;
  soilValue: number;
  ldrValue: number;
  soilCondition: 'Good' | 'Okay' | 'Bad';
  lightCondition: 'Good' | 'Okay' | 'Bad';
  timestamp: string;
}

export interface DeviceStatus {
  deviceId: string;
  status: 'online' | 'offline';
  lastSeen: string;
}

class PlantMonitoringAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // ✅ FIXED: Matches your backend /api/sensor-data
  async getLatestData(): Promise<SensorData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/readings/latest`);  // Backend has this
      const result = await response.json();
      
      if (result.success) {
        return result.reading;  // Backend returns {success: true, reading: data}
      }
      return null;
    } catch (error) {
      console.error('Error fetching latest data:', error);
      return null;
    }
  }

  // ✅ FIXED: Use actual backend endpoint
  async getHistoricalData(hours = 24, limit = 100): Promise<SensorData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/sensor-data?limit=${limit}`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;  // Backend returns {success: true, data: [...]}
      }
      return [];
    } catch (error) {
      console.error('Error fetching historical data:', error);
      return [];
    }
  }

  async getDeviceStatus(deviceId = 'ESP32_001'): Promise<DeviceStatus | null> {
    try {
      const response = await fetch(`${this.baseUrl}/readings?deviceId=${deviceId}&limit=1`);
      const result = await response.json();
      
      if (result.success && result.readings.length > 0) {
        const latest = result.readings[0];
        return {
          deviceId: latest.deviceId,
          status: 'online',
          lastSeen: latest.receivedAt
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching device status:', error);
      return null;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl.replace('/api', '')}/`);  // Root endpoint
      const result = await response.json();
      return result.status === 'online';
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }
}

export const api = new PlantMonitoringAPI();

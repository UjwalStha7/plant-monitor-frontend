// src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

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

  async getLatestData(): Promise<SensorData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/sensor-data/latest`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching latest data:', error);
      return null;
    }
  }

  async getHistoricalData(hours = 24, limit = 100): Promise<SensorData[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/sensor-data/history?hours=${hours}&limit=${limit}`
      );
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching historical data:', error);
      return [];
    }
  }

  async getDeviceStatus(deviceId = 'ESP32_001'): Promise<DeviceStatus | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/device/status?deviceId=${deviceId}`
      );
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching device status:', error);
      return null;
    }
  }

  async checkHealth(): Promise<boolean> {
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

export const api = new PlantMonitoringAPI();

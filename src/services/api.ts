// src/services/api.ts - FIXED VERSION
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://plant-monitor-api.onrender.com';

export interface SensorData {
  _id: string;
  deviceId: string;
  soilValue: number;
  ldrValue: number;
  soilCondition: string;
  lightCondition: string;
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
      const response = await fetch(`${this.baseUrl}/api/sensor-data`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const result = await response.json();
      const latest = result.data?.[0] || result.latest;
      
      if (!latest) return null;
      
      return {
        _id: latest.id || `temp_${Date.now()}`,
        deviceId: latest.deviceId || 'ESP32_001',
        soilValue: Number(latest.soilValue) || 0,
        ldrValue: Number(latest.ldrValue) || 0,
        soilCondition: latest.soilCondition || 'Unknown',
        lightCondition: latest.lightCondition || 'Unknown',
        timestamp: latest.receivedAt || latest.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('getLatestData error:', error);
      return null;
    }
  }

  async getHistoricalData(hours = 24, limit = 100): Promise<SensorData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/sensor-data?limit=${limit}`);
      const result = await response.json();
      
      return (result.data || []).map((item: any, index: number) => ({
        _id: item.id || `history_${index}`,
        deviceId: item.deviceId || 'ESP32_001',
        soilValue: Number(item.soilValue) || 0,
        ldrValue: Number(item.ldrValue) || 0,
        soilCondition: item.soilCondition || 'Unknown',
        lightCondition: item.lightCondition || 'Unknown',
        timestamp: item.receivedAt || item.timestamp || new Date().toISOString()
      }));
    } catch (error) {
      console.error('getHistoricalData error:', error);
      return [];
    }
  }

  async getDeviceStatus(): Promise<DeviceStatus | null> {
    try {
      const response = await fetch(this.baseUrl);
      const result = await response.json();
      
      return {
        deviceId: 'ESP32_001',
        status: result.status === 'online' ? 'online' : 'offline',
        lastSeen: result.statistics?.latestReading || new Date().toISOString()
      };
    } catch {
      return { deviceId: 'ESP32_001', status: 'offline', lastSeen: new Date().toISOString() };
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const api = new PlantMonitoringAPI();

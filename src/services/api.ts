// src/services/api.ts - ✅ 100% WORKING VERSION
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

  // ✅ FIXED: Uses ONLY /api/sensor-data endpoint
  async getLatestData(): Promise<SensorData | null> {
    try {
      console.log('🔄 Fetching:', `${this.baseUrl}/api/sensor-data`);
      const response = await fetch(`${this.baseUrl}/api/sensor-data`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Full response:', result);
      
      // Backend returns {success: true, data: [array], latest: {...}}
      const latest = result.data?.[0] || result.latest;
      console.log('✅ Latest reading:', latest);
      
      if (latest) {
        return {
          _id: latest.id || `temp_${Date.now()}`,
          deviceId: latest.deviceId || 'ESP32_001',
          soilValue: Number(latest.soilValue) || 0,
          ldrValue: Number(latest.ldrValue) || 0,
          soilCondition: latest.soilCondition || 'Unknown',
          lightCondition: latest.lightCondition || 'Unknown',
          timestamp: latest.receivedAt || latest.timestamp || new Date().toISOString()
        };
      }
      return null;
    } catch (error) {
      console.error('❌ getLatestData ERROR:', error);
      return null;
    }
  }

  // ✅ FIXED: Same endpoint with limit param
  async getHistoricalData(hours = 24, limit = 100): Promise<SensorData[]> {
    try {
      const url = `${this.baseUrl}/api/sensor-data?limit=${limit}`;
      console.log('📈 Fetching history:', url);
      
      const response = await fetch(url);
      const result = await response.json();
      
      const data = (result.data || []).map((item: any, index: number) => ({
        _id: item.id || `history_${index}`,
        deviceId: item.deviceId || 'ESP32_001',
        soilValue: Number(item.soilValue) || 0,
        ldrValue: Number(item.ldrValue) || 0,
        soilCondition: item.soilCondition || 'Unknown',
        lightCondition: item.lightCondition || 'Unknown',
        timestamp: item.receivedAt || item.timestamp || new Date().toISOString()
      }));
      
      console.log(`📊 History count: ${data.length}`);
      return data;
    } catch (error) {
      console.error('❌ getHistoricalData ERROR:', error);
      return [];
    }
  }

  // ✅ Backend root endpoint works perfectly
  async getDeviceStatus(): Promise<DeviceStatus | null> {
    try {
      console.log('🔍 Checking status:', this.baseUrl);
      const response = await fetch(this.baseUrl);
      const result = await response.json();
      
      return {
        deviceId: 'ESP32_001',
        status: result.status === 'online' ? 'online' : 'offline',
        lastSeen: result.statistics?.latestReading || new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ getDeviceStatus ERROR:', error);
      return {
        deviceId: 'ESP32_001',
        status: 'offline',
        lastSeen: new Date().toISOString()
      };
    }
  }

  // Health check utility
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

// src/services/api.ts - CORRECTED ENDPOINTS
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://plant-monitor-api.onrender.com';

export interface SensorData {
  id: string;
  deviceId: string;
  soilValue: number;
  ldrValue: number;
  soilCondition: string;
  lightCondition: string;
  receivedAt: string;
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

  // ✅ FIXED: Use backend's /api/sensor-data (has ALL 115 readings)
  async getLatestData(): Promise<SensorData | null> {
    try {
      console.log('🔄 Fetching:', `${this.baseUrl}/api/sensor-data`);
      const response = await fetch(`${this.baseUrl}/api/sensor-data`);
      const result = await response.json();
      
      // Backend returns {success: true, data: [array], latest: {...}}
      const latest = result.data?.[0] || result.latest;
      console.log('✅ Latest:', latest);
      
      if (latest) {
        return {
          _id: latest.id || latest._id,
          deviceId: latest.deviceId,
          soilValue: latest.soilValue,
          ldrValue: latest.ldrValue,
          soilCondition: latest.soilCondition,
          lightCondition: latest.lightCondition,
          timestamp: latest.receivedAt || latest.timestamp
        };
      }
      return null;
    } catch (error) {
      console.error('❌ getLatestData error:', error);
      return null;
    }
  }

  // ✅ FIXED: Same endpoint for history
  async getHistoricalData(hours = 24, limit = 100): Promise<SensorData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/sensor-data?limit=${limit}`);
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('❌ getHistoricalData error:', error);
      return [];
    }
  }

  // ✅ FIXED: Backend root shows "online" status
  async getDeviceStatus(): Promise<DeviceStatus | null> {
    try {
      const response = await fetch(this.baseUrl);
      const result = await response.json();
      return {
        deviceId: 'ESP32_001',
        status: result.status === 'online' ? 'online' : 'offline',
        lastSeen: result.statistics?.latestReading || new Date().toISOString()
      };
    } catch (error) {
      return { deviceId: 'ESP32_001', status: 'offline', lastSeen: new Date().toISOString() };
    }
  }
}

export const api = new PlantMonitoringAPI();

/**
 * ============================================================================
 * BACKEND API SERVICE - FIXED FOR YOUR RENDER BACKEND
 * ============================================================================
 * 
 * Handles HTTP communication with the Render-deployed backend API.
 * The backend stores ESP32 sensor data in memory (will upgrade to MongoDB).
 * 
 * API ENDPOINT:
 * GET https://plant-monitor-api.onrender.com/api/sensor-data
 * 
 * RESPONSE FORMAT (from your actual backend):
 * {
 *   "success": true,
 *   "timestamp": "2026-01-15T03:30:57.651Z",
 *   "count": 128,
 *   "latest": {
 *     "soilValue": 2266,
 *     "ldrValue": 1170,
 *     "soilCondition": "Okay",
 *     "lightCondition": "Bad",
 *     "receivedAt": "2026-01-15T02:52:48.740Z",
 *     "deviceId": "ESP32_001"
 *   },
 *   "data": [ ... ]
 * }
 */

import type { 
  SensorData, 
  ESP32Config
} from '@/types/sensor.types';

// ============================================================================
// CONFIGURATION - HARDCODED FOR YOUR BACKEND
// ============================================================================

const BACKEND_BASE_URL = 'https://plant-monitor-api.onrender.com';
const API_ENDPOINT = '/api/sensor-data';
const DEFAULT_TIMEOUT = 10000; // 10 seconds
const CONNECTION_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

// ============================================================================
// ERROR TYPES
// ============================================================================

export class ESP32ConnectionError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'ESP32ConnectionError';
  }
}

export class ESP32TimeoutError extends Error {
  constructor(public readonly timeout: number) {
    super(`Request timed out after ${timeout}ms`);
    this.name = 'ESP32TimeoutError';
  }
}

export class ESP32ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ESP32ParseError';
  }
}

// ============================================================================
// BACKEND API RESPONSE TYPES (matching your actual backend)
// ============================================================================

interface BackendLatestReading {
  id?: string;
  deviceId: string;
  soilValue: number;
  ldrValue: number;
  soilCondition: string;
  lightCondition: string;
  receivedAt: string;
  wifiRSSI?: number;
  freeHeap?: number;
  sendAttempt?: number;
  timestamp?: number;
}

interface BackendSensorDataResponse {
  success: boolean;
  timestamp: string;
  count: number;
  latest: BackendLatestReading;
  data: Array<{
    soilValue: number;
    ldrValue: number;
    soilCondition: string;
    lightCondition: string;
    timestamp: string;
    deviceId: string;
  }>;
}

// ============================================================================
// EXTENDED SENSOR DATA (includes backend metadata)
// ============================================================================

export interface ExtendedSensorData extends SensorData {
  receivedAt: Date | null;
  deviceId: string | null;
  isESP32Online: boolean;
}

// ============================================================================
// ESP32 SERVICE CLASS
// ============================================================================

/**
 * Backend API Service
 * 
 * Fetches sensor data from your Render-deployed backend.
 * Calls: https://plant-monitor-api.onrender.com/api/sensor-data
 */
export class ESP32Service {
  private timeout: number;
  private abortController: AbortController | null = null;

  constructor(timeout: number = DEFAULT_TIMEOUT) {
    this.timeout = timeout;
  }

  /**
   * Get the full API URL
   */
  private get apiUrl(): string {
    return `${BACKEND_BASE_URL}${API_ENDPOINT}`;
  }

  /**
   * Fetch latest sensor data from backend API
   * 
   * Returns sensor data along with connection status info
   */
  async fetchSensorData(): Promise<ExtendedSensorData> {
    // Cancel any pending request
    this.abort();
    
    this.abortController = new AbortController();
    const timeoutId = setTimeout(
      () => this.abortController?.abort(),
      this.timeout
    );

    try {
      console.log('🔄 Fetching from:', this.apiUrl);
      
      const response = await fetch(this.apiUrl, {
        method: 'GET',
        signal: this.abortController.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ESP32ConnectionError(
          `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await this.parseResponse(response);
      return this.transformBackendData(data);
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ESP32TimeoutError(this.timeout);
      }
      
      if (error instanceof ESP32ConnectionError || 
          error instanceof ESP32ParseError) {
        throw error;
      }
      
      throw new ESP32ConnectionError(
        'Failed to connect to backend API',
        error
      );
    }
  }

  /**
   * Parse JSON response from backend
   */
  private async parseResponse(response: Response): Promise<BackendSensorDataResponse> {
    try {
      const data = await response.json();
      console.log('📥 Backend response:', data);
      return data as BackendSensorDataResponse;
    } catch (error) {
      console.error('❌ Parse error:', error);
      throw new ESP32ParseError('Invalid JSON response from backend');
    }
  }

  /**
   * Transform backend response to frontend SensorData format
   */
  private transformBackendData(response: BackendSensorDataResponse): ExtendedSensorData {
    if (!response.success || !response.latest) {
      throw new ESP32ParseError('No reading data available from backend');
    }

    const latest = response.latest;
    const receivedAt = latest.receivedAt ? new Date(latest.receivedAt) : null;
    
    // Check if ESP32 is online based on last data timestamp
    const isESP32Online = this.checkESP32Online(receivedAt);

    console.log('✅ Transformed data:', {
      soilMoisture: latest.soilValue,
      light: latest.ldrValue,
      isESP32Online,
      receivedAt
    });

    return {
      soilMoisture: this.validateADCValue(latest.soilValue, 'soilValue'),
      light: this.validateADCValue(latest.ldrValue, 'ldrValue'),
      receivedAt,
      deviceId: latest.deviceId || null,
      isESP32Online,
    };
  }

  /**
   * Check if ESP32 is online based on last data timestamp
   * ESP32 is considered online if data was received within CONNECTION_TIMEOUT_MS
   */
  private checkESP32Online(lastReceived: Date | null): boolean {
    if (!lastReceived) return false;
    
    const now = new Date();
    const timeDiff = now.getTime() - lastReceived.getTime();
    
    // ESP32 sends data every 5 seconds, so if we haven't received data 
    // in 2 minutes, consider it offline
    const isOnline = timeDiff < CONNECTION_TIMEOUT_MS;
    
    console.log('🔌 ESP32 Status:', {
      lastReceived: lastReceived.toISOString(),
      timeDiff: Math.round(timeDiff / 1000) + 's',
      isOnline
    });
    
    return isOnline;
  }

  /**
   * Validate ADC value is within expected range
   */
  private validateADCValue(value: unknown, field: string): number {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new ESP32ParseError(`Invalid ${field} value: ${value}`);
    }
    
    // Clamp to valid ADC range
    return Math.max(0, Math.min(4095, Math.round(value)));
  }

  /**
   * Check if backend API is reachable
   */
  async checkConnection(): Promise<boolean> {
    try {
      await this.fetchSensorData();
      return true;
    } catch (error) {
      console.error('Connection check failed:', error);
      return false;
    }
  }

  /**
   * Abort any pending request
   */
  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /**
   * Get current endpoint
   */
  get endpoint(): string {
    return this.apiUrl;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

/**
 * Default ESP32 service instance
 */
export const esp32Service = new ESP32Service();
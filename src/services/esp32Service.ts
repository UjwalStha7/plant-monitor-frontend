/**
 * ============================================================================
 * BACKEND API SERVICE
 * ============================================================================
 * 
 * Handles HTTP communication with the Render-deployed backend API.
 * The backend stores ESP32 sensor data in MongoDB Atlas.
 * 
 * API ENDPOINT:
 * GET /api/sensor-data
 * 
 * RESPONSE FORMAT:
 * {
 *   "success": true,
 *   "timestamp": "2026-01-22T...",
 *   "count": 50,
 *   "deviceStatus": "Connected",  // ← Backend calculates this!
 *   "timeSinceLastReading": 45,
 *   "latest": {
 *     "soilValue": 2067,
 *     "ldrValue": 2858,
 *     "soilCondition": "Okay",
 *     "lightCondition": "Okay",
 *     "timestamp": "2026-01-14T09:03:00.102Z",
 *     "deviceId": "ESP32_Plant_Monitor",
 *     "lastUpdated": "2026-01-14T09:03:00.102Z"
 *   }
 * }
 */

import type { 
  SensorData, 
  ESP32Config
} from '@/types/sensor.types';
import { ESP32_CONFIG } from '@/config/app.config';

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
// BACKEND API RESPONSE INTERFACES
// ============================================================================

interface BackendLatestReading {
  soilValue: number;
  ldrValue: number;
  soilCondition: string;
  lightCondition: string;
  timestamp: string;
  deviceId: string;
  wifiRSSI?: number;
  lastUpdated: string;
}

interface BackendAPIResponse {
  success: boolean;
  timestamp: string;
  count: number;
  deviceStatus: 'Connected' | 'Disconnected';
  timeSinceLastReading?: number;
  latest: BackendLatestReading | null;
  error?: string;
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
 * The backend stores data from ESP32 in MongoDB Atlas and calculates connection status.
 */
export class ESP32Service {
  private config: ESP32Config;
  private abortController: AbortController | null = null;

  constructor(config: ESP32Config = ESP32_CONFIG) {
    this.config = config;
  }

  /**
   * Get the full API URL
   */
  private get apiUrl(): string {
    return this.config.endpoint;
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
      this.config.timeout
    );

    try {
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
        throw new ESP32TimeoutError(this.config.timeout);
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
  private async parseResponse(response: Response): Promise<BackendAPIResponse> {
    try {
      const data = await response.json();
      return data as BackendAPIResponse;
    } catch {
      throw new ESP32ParseError('Invalid JSON response from backend');
    }
  }

  /**
   * Transform backend response to frontend SensorData format
   */
  private transformBackendData(response: BackendAPIResponse): ExtendedSensorData {
    if (!response.success || !response.latest) {
      throw new ESP32ParseError(response.error || 'No reading data available');
    }

    const reading = response.latest;
    const receivedAt = reading.timestamp ? new Date(reading.timestamp) : null;
    
    // Backend already calculates device status for us!
    const isESP32Online = response.deviceStatus === 'Connected';

    return {
      soilMoisture: this.validateADCValue(reading.soilValue, 'soilValue'),
      light: this.validateADCValue(reading.ldrValue, 'ldrValue'),
      receivedAt,
      deviceId: reading.deviceId || null,
      isESP32Online,
    };
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
    } catch {
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
   * Update configuration
   */
  updateConfig(config: Partial<ESP32Config>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current endpoint
   */
  get endpoint(): string {
    return this.config.endpoint;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

/**
 * Default ESP32 service instance
 */
export const esp32Service = new ESP32Service();
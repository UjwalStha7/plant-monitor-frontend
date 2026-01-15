/**
 * ============================================================================
 * MOCK DATA SERVICE
 * ============================================================================
 * 
 * Provides simulated sensor data for development and demo purposes.
 * This service mimics the behavior of a real ESP32 connection.
 * 
 * USAGE:
 * This service is used when DATA_SOURCE_MODE is set to 'mock' in app.config.ts
 * It generates realistic fluctuating sensor values for testing the UI.
 */

import type { SensorData, HistoryDataPoint } from '@/types/sensor.types';

// ============================================================================
// MOCK DATA GENERATION
// ============================================================================

/**
 * Default mock sensor values
 */
export const DEFAULT_MOCK_DATA: SensorData = {
  soilMoisture: 1200,
  light: 3200,
};

/**
 * ADC value constraints (ESP32 12-bit ADC)
 */
const ADC_MIN = 0;
const ADC_MAX = 4095;

/**
 * Clamp value to valid ADC range
 */
const clampToADCRange = (value: number): number => {
  return Math.max(ADC_MIN, Math.min(ADC_MAX, value));
};

/**
 * Format timestamp to time string
 */
export const formatTimeString = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

/**
 * Generate a single random sensor reading
 * Creates realistic fluctuating values that simulate actual sensor behavior
 */
export const generateRandomSensorData = (): SensorData => {
  return {
    // Soil moisture: fluctuates around 800-2800 range
    soilMoisture: clampToADCRange(Math.floor(800 + Math.random() * 2000)),
    // Light: fluctuates around 2000-4000 range
    light: clampToADCRange(Math.floor(2000 + Math.random() * 2000)),
  };
};

/**
 * Generate sensor data with sinusoidal patterns
 * Creates more natural-looking data for demo charts
 */
export const generatePatternedSensorData = (index: number): SensorData => {
  const soilBase = 800 + Math.random() * 1500;
  const soilWave = Math.sin(index * 0.3) * 500;
  
  const lightBase = 2000 + Math.random() * 1500;
  const lightWave = Math.cos(index * 0.2) * 800;
  
  return {
    soilMoisture: clampToADCRange(Math.floor(soilBase + soilWave)),
    light: clampToADCRange(Math.floor(lightBase + lightWave)),
  };
};

/**
 * Generate initial mock history data
 * Creates a set of historical data points for chart initialization
 * 
 * @param points - Number of data points to generate
 * @param intervalSeconds - Time interval between points in seconds
 */
export const generateMockHistoryData = (
  points: number = 20,
  intervalSeconds: number = 5
): HistoryDataPoint[] => {
  const now = Date.now();
  const data: HistoryDataPoint[] = [];

  for (let i = points - 1; i >= 0; i--) {
    const timestamp = now - i * intervalSeconds * 1000;
    const time = new Date(timestamp);
    const sensorData = generatePatternedSensorData(i);

    data.push({
      time: formatTimeString(time),
      timestamp,
      soilMoisture: sensorData.soilMoisture,
      light: sensorData.light,
    });
  }

  return data;
};

/**
 * Create a new history data point from current sensor data
 * @param sensorData - Current sensor readings
 * @param timestamp - Optional timestamp (defaults to now)
 */
export const createHistoryPoint = (
  sensorData: SensorData, 
  timestamp?: Date
): HistoryDataPoint => {
  const time = timestamp || new Date();
  return {
    time: formatTimeString(time),
    timestamp: time.getTime(),
    soilMoisture: sensorData.soilMoisture,
    light: sensorData.light,
  };
};

// ============================================================================
// MOCK DATA SERVICE CLASS
// ============================================================================

/**
 * Mock Data Service
 * 
 * Provides a service-like interface for mock data generation.
 * Can be swapped with a real ESP32 service without changing consumer code.
 */
export class MockDataService {
  private intervalId: NodeJS.Timeout | null = null;
  private listeners: Set<(data: SensorData) => void> = new Set();

  /**
   * Start generating mock data at specified interval
   */
  start(intervalSeconds: number = 5): void {
    if (this.intervalId) {
      this.stop();
    }

    this.intervalId = setInterval(() => {
      const data = generateRandomSensorData();
      this.notifyListeners(data);
    }, intervalSeconds * 1000);
  }

  /**
   * Stop generating mock data
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Subscribe to mock data updates
   */
  subscribe(callback: (data: SensorData) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of new data
   */
  private notifyListeners(data: SensorData): void {
    this.listeners.forEach((listener) => listener(data));
  }

  /**
   * Get a single mock reading (simulates API call)
   */
  async fetchData(): Promise<SensorData> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    return generateRandomSensorData();
  }
}

// Export singleton instance
export const mockDataService = new MockDataService();

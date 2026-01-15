/**
 * ============================================================================
 * SENSOR DATA TYPES & INTERFACES
 * ============================================================================
 * 
 * Central type definitions for all sensor-related data.
 * These interfaces are designed to be compatible with ESP32 firmware output.
 * 
 * FUTURE INTEGRATION:
 * When connecting to ESP32, ensure the firmware returns JSON matching these types.
 * 
 * Example ESP32 JSON response:
 * {
 *   "soilMoisture": 1234,
 *   "light": 3456,
 *   "temperature": 25.5,     // Optional: for future expansion
 *   "humidity": 65.0         // Optional: for future expansion
 * }
 */

// ============================================================================
// CORE SENSOR DATA TYPES
// ============================================================================

/**
 * Condition status for sensor readings
 * Used across all sensor types for consistent status indication
 */
export type SensorCondition = 'Good' | 'Okay' | 'Bad';

/**
 * Available sensor types in the system
 * Extend this as you add more sensors to the ESP32
 */
export type SensorType = 'soil' | 'light' | 'temperature' | 'humidity';

/**
 * Current sensor readings from ESP32
 * 
 * FUTURE SENSORS: Add new properties here when expanding the ESP32:
 * - temperature?: number;  // DHT11/DHT22 temperature in Celsius
 * - humidity?: number;     // DHT11/DHT22 humidity percentage
 */
export interface SensorData {
  soilMoisture: number;  // ADC value 0-4095
  light: number;         // ADC value 0-4095
  // Future sensor fields (uncomment when ESP32 supports them):
  // temperature?: number;  // Celsius
  // humidity?: number;     // Percentage 0-100
}

/**
 * Single data point for historical charts
 * Each point represents a reading at a specific time
 */
export interface HistoryDataPoint {
  time: string;          // Formatted time string for display
  timestamp: number;     // Unix timestamp for calculations
  soilMoisture: number;  // ADC value at this time
  light: number;         // ADC value at this time
  // Future fields:
  // temperature?: number;
  // humidity?: number;
}

// ============================================================================
// CONNECTION & STATE TYPES
// ============================================================================

/**
 * Connection state for the ESP32 device
 */
export interface ConnectionState {
  isConnected: boolean;
  lastUpdate: Date | null;
  isChecking: boolean;
  error: string | null;
}

/**
 * Data source mode - easily toggle between mock and real data
 */
export type DataSourceMode = 'mock' | 'esp32' | 'websocket';

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

/**
 * ESP32 connection configuration
 * 
 * INTEGRATION NOTES:
 * - endpoint: Your ESP32's IP address on the local network
 * - updateInterval: How often to poll for new data (seconds)
 * - timeout: Request timeout in milliseconds
 */
export interface ESP32Config {
  endpoint: string;
  updateInterval: number;
  timeout: number;
}

/**
 * WebSocket configuration for real-time updates
 * 
 * FUTURE INTEGRATION:
 * Use WebSocket for lower latency updates instead of polling.
 * ESP32 would need to run a WebSocket server or connect to an MQTT broker.
 */
export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
}

/**
 * Complete application configuration
 */
export interface AppConfig {
  dataSource: DataSourceMode;
  esp32: ESP32Config;
  websocket?: WebSocketConfig;
  historyMaxPoints: number;
}

// ============================================================================
// THRESHOLD TYPES
// ============================================================================

/**
 * Threshold configuration for a single condition boundary
 */
export interface ThresholdLevel {
  value: number;
  label: SensorCondition;
  color: string;
}

/**
 * Complete threshold configuration for a sensor type
 */
export interface SensorThresholds {
  good: number;
  okay: number;
  levels: ThresholdLevel[];
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Backend API Reading object
 * This matches the format returned by your Render/MongoDB backend
 */
export interface BackendReading {
  id: string;
  deviceId: string;
  soilValue: number;        // Maps to soilMoisture
  ldrValue: number;         // Maps to light
  soilCondition: string;
  lightCondition: string;
  wifiRSSI?: number;
  freeHeap?: number;
  sendAttempt?: number;
  receivedAt: string;       // ISO timestamp for connection status
  timestamp?: number;
}

/**
 * Backend API response format from /api/readings/latest
 */
export interface BackendAPIResponse {
  success: boolean;
  reading?: BackendReading;
  error?: string;
}

/**
 * Legacy ESP32 direct response format (for local network use)
 */
export interface ESP32Response {
  soilMoisture: number;
  light: number;
  temperature?: number;
  humidity?: number;
  uptime?: number;
  freeHeap?: number;
}

/**
 * WebSocket message types for real-time communication
 */
export type WebSocketMessageType = 'sensor_data' | 'connection_status' | 'error';

export interface WebSocketMessage {
  type: WebSocketMessageType;
  data: SensorData | ConnectionState | string;
  timestamp: number;
}

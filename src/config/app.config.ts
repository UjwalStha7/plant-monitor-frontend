/**
 * ============================================================================
 * APPLICATION CONFIGURATION
 * ============================================================================
 * 
 * Centralized configuration for the entire application.
 * Modify these values to configure data sources, thresholds, and behavior.
 * 
 * INTEGRATION GUIDE:
 * 1. To connect to real ESP32: Set DATA_SOURCE_MODE to 'esp32'
 * 2. Update ESP32_CONFIG.endpoint to your device's IP address
 * 3. For WebSocket: Set DATA_SOURCE_MODE to 'websocket' and configure WEBSOCKET_CONFIG
 */

import type { 
  AppConfig, 
  DataSourceMode, 
  ESP32Config, 
  WebSocketConfig,
  SensorThresholds,
  ThresholdLevel
} from '@/types/sensor.types';

// ============================================================================
// DATA SOURCE CONFIGURATION
// ============================================================================

/**
 * Current data source mode
 * 
 * Options:
 * - 'mock': Use simulated data (for development/demo)
 * - 'esp32': Connect to real ESP32 via HTTP polling
 * - 'websocket': Use WebSocket for real-time updates (future)
 * 
 * TOGGLE THIS to switch between mock and real data
 */
export const DATA_SOURCE_MODE: DataSourceMode = 'esp32';

// ============================================================================
// BACKEND API CONFIGURATION
// ============================================================================

/**
 * Backend API Configuration
 * 
 * Your Render-deployed backend with MongoDB Atlas storage.
 * The ESP32 sends data to this backend, and the frontend fetches from it.
 * 
 * API Response format from /api/readings/latest:
 * {
 *   "success": true,
 *   "reading": {
 *     "soilValue": 2067,
 *     "ldrValue": 2858,
 *     "soilCondition": "Okay",
 *     "lightCondition": "Okay",
 *     "receivedAt": "2026-01-14T09:03:00.102Z"
 *   }
 * }
 */
export const ESP32_CONFIG: ESP32Config = {
  endpoint: 'https://plant-monitor-api.onrender.com/api/readings/latest',
  updateInterval: 5,           // Poll every 5 seconds
  timeout: 15000,              // 15 second timeout (Render cold starts can be slow)
};

/**
 * Connection timeout threshold in milliseconds
 * If no data received within this time, ESP32 is considered disconnected
 * 
 * NOTE: This should match the backend's timeout (120 seconds / 2 minutes)
 * The backend considers ESP32 "Connected" if data was received within 2 minutes
 */
export const CONNECTION_TIMEOUT_MS = 120000; // 2 minutes (matches backend)

// ============================================================================
// WEBSOCKET CONFIGURATION (FUTURE)
// ============================================================================

/**
 * WebSocket Configuration for real-time updates
 * 
 * FUTURE INTEGRATION:
 * For lower latency, implement WebSocket on ESP32 using AsyncWebSocket library.
 * 
 * Example ESP32 WebSocket URL: ws://192.168.137.77:81/
 */
export const WEBSOCKET_CONFIG: WebSocketConfig = {
  url: 'ws://192.168.137.77:81/',  // ← UPDATE for WebSocket mode
  reconnectInterval: 5000,          // Reconnect every 5 seconds on disconnect
  maxReconnectAttempts: 10,         // Maximum reconnection attempts
};

// ============================================================================
// SENSOR THRESHOLDS
// ============================================================================

/**
 * Soil Moisture Thresholds (based on capacitive soil sensor ADC values)
 * 
 * ADC Range: 0-4095 (12-bit ESP32 ADC)
 * Lower values = More moisture
 * Higher values = Less moisture (dry soil)
 * 
 * Calibration: Adjust these based on your specific sensor and soil type
 */
export const SOIL_MOISTURE_THRESHOLDS: SensorThresholds = {
  good: 1500,   // value ≤ 1500 = Good (wet)
  okay: 2500,   // value 1501-2500 = Okay (moderate)
  // value > 2500 = Bad (dry, needs water)
  levels: [
    { value: 1500, label: 'Good', color: 'hsl(var(--success))' },
    { value: 2500, label: 'Okay', color: 'hsl(var(--warning))' },
    { value: 4095, label: 'Bad', color: 'hsl(var(--destructive))' },
  ] as ThresholdLevel[],
};

/**
 * Light Sensor Thresholds (LDR ADC values)
 * 
 * ADC Range: 0-4095 (12-bit ESP32 ADC)
 * Lower values = Less light (dark)
 * Higher values = More light (bright)
 * 
 * Calibration: Adjust based on your LDR and lighting conditions
 */
export const LIGHT_THRESHOLDS: SensorThresholds = {
  good: 3000,   // value ≥ 3000 = Good (bright)
  okay: 1500,   // value 1500-2999 = Okay (moderate)
  // value < 1500 = Bad (too dark)
  levels: [
    { value: 1500, label: 'Bad', color: 'hsl(var(--destructive))' },
    { value: 3000, label: 'Okay', color: 'hsl(var(--warning))' },
    { value: 4095, label: 'Good', color: 'hsl(var(--success))' },
  ] as ThresholdLevel[],
};

// ============================================================================
// HISTORY & CHART CONFIGURATION
// ============================================================================

/**
 * Maximum number of data points to keep in history
 * Higher values = more memory usage but longer history
 */
export const HISTORY_MAX_POINTS = 30;

/**
 * Chart Y-axis configuration
 */
export const CHART_CONFIG = {
  yAxisMin: 0,
  yAxisMax: 5000,
  yAxisTicks: [0, 1000, 2000, 3000, 4000, 5000],
};

// ============================================================================
// COMPLETE APP CONFIG OBJECT
// ============================================================================

/**
 * Complete application configuration
 * Import this single object for all configuration needs
 */
export const APP_CONFIG: AppConfig = {
  dataSource: DATA_SOURCE_MODE,
  esp32: ESP32_CONFIG,
  websocket: WEBSOCKET_CONFIG,
  historyMaxPoints: HISTORY_MAX_POINTS,
};

// ============================================================================
// CONDITION EVALUATION FUNCTIONS
// ============================================================================

/**
 * Evaluate soil moisture condition based on ADC value
 * Logic: Lower value = More moisture = Better
 */
export const getSoilMoistureCondition = (value: number): 'Good' | 'Okay' | 'Bad' => {
  if (value <= SOIL_MOISTURE_THRESHOLDS.good) return 'Good';
  if (value <= SOIL_MOISTURE_THRESHOLDS.okay) return 'Okay';
  return 'Bad';
};

/**
 * Evaluate light condition based on ADC value
 * Logic: Higher value = More light = Better
 */
export const getLightCondition = (value: number): 'Good' | 'Okay' | 'Bad' => {
  if (value < LIGHT_THRESHOLDS.okay) return 'Bad';
  if (value < LIGHT_THRESHOLDS.good) return 'Okay';
  return 'Good';
};

/**
 * Get condition for any sensor type
 * Extensible for future sensor types
 */
export const getSensorCondition = (
  type: 'soil' | 'light', 
  value: number
): 'Good' | 'Okay' | 'Bad' => {
  return type === 'soil' 
    ? getSoilMoistureCondition(value) 
    : getLightCondition(value);
};

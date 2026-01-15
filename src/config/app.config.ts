/**
 * ============================================================================
 * APPLICATION CONFIGURATION - FIXED FOR YOUR BACKEND
 * ============================================================================
 * 
 * Centralized configuration for the entire application.
 * 
 * ✅ CONFIGURED FOR YOUR RENDER BACKEND:
 * Base URL: https://plant-monitor-api.onrender.com
 * Endpoint: /api/sensor-data
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
 * ✅ SET TO 'esp32' - Will fetch real data from Render backend
 */
export const DATA_SOURCE_MODE: DataSourceMode = 'esp32';

// ============================================================================
// BACKEND API CONFIGURATION - FIXED!
// ============================================================================

/**
 * Backend API Configuration
 * 
 * ✅ CORRECTED ENDPOINT: /api/sensor-data
 * 
 * Your Render backend stores ESP32 data in memory.
 * ESP32 sends to: POST /api/readings
 * Frontend fetches from: GET /api/sensor-data
 * 
 * API Response format from /api/sensor-data:
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
 *   "data": [ ... array of readings ... ]
 * }
 */
export const ESP32_CONFIG: ESP32Config = {
  endpoint: 'https://plant-monitor-api.onrender.com/api/sensor-data',  // ← FIXED!
  updateInterval: 5,           // Poll every 5 seconds
  timeout: 15000,              // 15 second timeout (Render cold starts)
};

/**
 * Connection timeout threshold in milliseconds
 * If no data received within this time, ESP32 is considered disconnected
 * 
 * ESP32 sends every 5 seconds, so 2 minutes is a safe threshold
 */
export const CONNECTION_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

// ============================================================================
// WEBSOCKET CONFIGURATION (FUTURE)
// ============================================================================

export const WEBSOCKET_CONFIG: WebSocketConfig = {
  url: 'ws://192.168.137.77:81/',
  reconnectInterval: 5000,
  maxReconnectAttempts: 10,
};

// ============================================================================
// SENSOR THRESHOLDS
// ============================================================================

/**
 * Soil Moisture Thresholds (based on your ESP32 code)
 * 
 * From your ESP32 code:
 * - value ≤ 1500: Good
 * - value 1501-2500: Okay
 * - value > 2500: Bad
 */
export const SOIL_MOISTURE_THRESHOLDS: SensorThresholds = {
  good: 1500,
  okay: 2500,
  levels: [
    { value: 1500, label: 'Good', color: 'hsl(var(--success))' },
    { value: 2500, label: 'Okay', color: 'hsl(var(--warning))' },
    { value: 4095, label: 'Bad', color: 'hsl(var(--destructive))' },
  ] as ThresholdLevel[],
};

/**
 * Light Sensor Thresholds (based on your ESP32 code)
 * 
 * From your ESP32 code:
 * - value < 1500: Bad
 * - value 1500-2999: Okay
 * - value ≥ 3000: Good
 */
export const LIGHT_THRESHOLDS: SensorThresholds = {
  good: 3000,
  okay: 1500,
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
 */
export const getSensorCondition = (
  type: 'soil' | 'light', 
  value: number
): 'Good' | 'Okay' | 'Bad' => {
  return type === 'soil' 
    ? getSoilMoistureCondition(value) 
    : getLightCondition(value);
};
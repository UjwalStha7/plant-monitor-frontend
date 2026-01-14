// src/config/app.config.ts

// ESP32 Device Configuration
export const ESP32_CONFIG = {
  baseUrl: import.meta.env.VITE_ESP32_URL || 'http://192.168.1.100',
  timeout: 5000,
  retryAttempts: 3,
  retryDelay: 1000,
};

// WebSocket Configuration
export const WEBSOCKET_CONFIG = {
  url: import.meta.env.VITE_WEBSOCKET_URL || 'ws://192.168.1.100:81',
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
  heartbeatInterval: 30000,
};

// API Configuration
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  pollInterval: 5000,
};

// Sensor thresholds based on ESP32 logic
export const SENSOR_THRESHOLDS = {
  soil: {
    good: 1500,      // <= 1500 is Good
    okay: 2500,      // 1501-2500 is Okay
    // > 2500 is Bad
  },
  light: {
    bad: 1500,       // < 1500 is Bad
    okay: 3000,      // 1500-2999 is Okay
    // >= 3000 is Good
  },
};

export type Condition = 'Good' | 'Okay' | 'Bad';

export function getSoilMoistureCondition(value: number): Condition {
  if (value <= SENSOR_THRESHOLDS.soil.good) return 'Good';
  if (value <= SENSOR_THRESHOLDS.soil.okay) return 'Okay';
  return 'Bad';
}

export function getLightCondition(value: number): Condition {
  if (value < SENSOR_THRESHOLDS.light.bad) return 'Bad';
  if (value < SENSOR_THRESHOLDS.light.okay) return 'Okay';
  return 'Good';
}

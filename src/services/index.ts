/**
 * SERVICES INDEX - FIXED VERSION
 */

// Mock Data Service
export { 
  mockDataService, 
  MockDataService,
  generateMockHistoryData,
  generateRandomSensorData,
  createHistoryPoint,
  formatTimeString,
  DEFAULT_MOCK_DATA,
} from './mockDataService';

// ESP32 REST API Service (OLD - but keep for compatibility)
export { 
  esp32Service, 
  ESP32Service,
  ESP32ConnectionError,
  ESP32TimeoutError,
  ESP32ParseError,
} from './esp32Service';

// ✅ NEW: Your working API (MAIN FIX)
export { api } from './api';
export type { SensorData, DeviceStatus } from './api';

// WebSocket Service
export { 
  webSocketService, 
  WebSocketService,
} from './webSocketService';
export type { 
  WebSocketEvent, 
  WebSocketEventType, 
  WebSocketEventHandler 
} from './webSocketService';

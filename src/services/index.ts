/**
 * ============================================================================
 * SERVICES INDEX
 * ============================================================================
 * 
 * Central export for all data services.
 * Import from here for cleaner imports throughout the app.
 * 
 * ARCHITECTURE OVERVIEW:
 * ----------------------
 * 
 * ┌─────────────────────────────────────────────────────────────────┐
 * │                        DATA SERVICES                            │
 * ├─────────────────────────────────────────────────────────────────┤
 * │                                                                 │
 * │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
 * │  │  MockService    │  │  ESP32Service   │  │ WebSocketService│  │
 * │  │  (Development)  │  │  (HTTP Polling) │  │ (Real-time)     │  │
 * │  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  │
 * │           │                    │                    │           │
 * │           └────────────────────┼────────────────────┘           │
 * │                                │                                │
 * │                    ┌───────────▼───────────┐                    │
 * │                    │   useSensorData Hook  │                    │
 * │                    │   (Unified Interface) │                    │
 * │                    └───────────┬───────────┘                    │
 * │                                │                                │
 * └────────────────────────────────┼────────────────────────────────┘
 *                                  │
 *                      ┌───────────▼───────────┐
 *                      │      React UI         │
 *                      │   (Components/Pages)  │
 *                      └───────────────────────┘
 * 
 * USAGE:
 * ------
 * 
 * 1. For mock data (development):
 *    import { mockDataService } from '@/services';
 * 
 * 2. For ESP32 HTTP polling:
 *    import { esp32Service } from '@/services';
 * 
 * 3. For WebSocket (future):
 *    import { webSocketService } from '@/services';
 * 
 * 4. For unified data access (recommended):
 *    import { useSensorData } from '@/hooks/useSensorData';
 */

// Mock Data Service - for development and demos
export { 
  mockDataService, 
  MockDataService,
  generateMockHistoryData,
  generateRandomSensorData,
  createHistoryPoint,
  formatTimeString,
  DEFAULT_MOCK_DATA,
} from './mockDataService';

// ESP32 REST API Service - for HTTP polling
export { 
  esp32Service, 
  ESP32Service,
  ESP32ConnectionError,
  ESP32TimeoutError,
  ESP32ParseError,
} from './esp32Service';

// WebSocket Service - for real-time updates (future)
export { 
  webSocketService, 
  WebSocketService,
} from './webSocketService';
export type { 
  WebSocketEvent, 
  WebSocketEventType, 
  WebSocketEventHandler 
} from './webSocketService';

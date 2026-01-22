/**
 * ============================================================================
 * WEBSOCKET SERVICE (FUTURE IMPLEMENTATION)
 * ============================================================================
 * 
 * Provides real-time sensor data updates via WebSocket connection.
 * This is an alternative to HTTP polling for lower latency updates.
 * 
 * STATUS: Ready for integration, not yet connected to ESP32
 * 
 * INTEGRATION GUIDE:
 * ==================
 * 
 * 1. ESP32 WEBSOCKET SERVER SETUP:
 *    Use the AsyncWebSocket library on ESP32:
 *    
 *    ```cpp
 *    #include <ESPAsyncWebServer.h>
 *    
 *    AsyncWebServer server(80);
 *    AsyncWebSocket ws("/ws");
 *    
 *    void onWsEvent(AsyncWebSocket *server, AsyncWebSocketClient *client,
 *                   AwsEventType type, void *arg, uint8_t *data, size_t len) {
 *      if (type == WS_EVT_CONNECT) {
 *        Serial.println("WebSocket client connected");
 *      }
 *    }
 *    
 *    void setup() {
 *      ws.onEvent(onWsEvent);
 *      server.addHandler(&ws);
 *      server.begin();
 *    }
 *    
 *    void loop() {
 *      // Send data periodically
 *      StaticJsonDocument<200> doc;
 *      doc["soilMoisture"] = analogRead(SOIL_PIN);
 *      doc["light"] = analogRead(LDR_PIN);
 *      
 *      String message;
 *      serializeJson(doc, message);
 *      ws.textAll(message);
 *      
 *      delay(1000);
 *    }
 *    ```
 * 
 * 2. MESSAGE FORMAT:
 *    {
 *      "soilMoisture": 1234,
 *      "light": 3456
 *    }
 */

import type { SensorData, WebSocketConfig, ConnectionState } from '@/types/sensor.types';
import { WEBSOCKET_CONFIG } from '@/config/app.config';

// ============================================================================
// WEBSOCKET EVENT TYPES
// ============================================================================

export type WebSocketEventType = 'connect' | 'disconnect' | 'data' | 'error';

export interface WebSocketEvent {
  type: WebSocketEventType;
  data?: SensorData;
  error?: Error;
  timestamp: number;
}

export type WebSocketEventHandler = (event: WebSocketEvent) => void;

// ============================================================================
// WEBSOCKET SERVICE CLASS
// ============================================================================

/**
 * WebSocket Service for real-time sensor updates
 * 
 * USAGE:
 * ```typescript
 * const wsService = new WebSocketService(config);
 * 
 * wsService.subscribe((event) => {
 *   if (event.type === 'data') {
 *     console.log('Sensor data:', event.data);
 *   }
 * });
 * 
 * wsService.connect();
 * ```
 */
export class WebSocketService {
  private config: WebSocketConfig;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimeoutId: NodeJS.Timeout | null = null;
  private listeners: Set<WebSocketEventHandler> = new Set();
  private _connectionState: ConnectionState = {
    isConnected: false,
    lastUpdate: null,
    isChecking: false,
    error: null,
  };

  constructor(config: WebSocketConfig = WEBSOCKET_CONFIG) {
    this.config = config;
  }

  /**
   * Current connection state
   */
  get connectionState(): ConnectionState {
    return { ...this._connectionState };
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this._connectionState.isChecking = true;
    this.notifyListeners({ type: 'connect', timestamp: Date.now() });

    try {
      this.ws = new WebSocket(this.config.url);
      this.setupEventHandlers();
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.clearReconnectTimeout();
    this.reconnectAttempts = 0;

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this._connectionState = {
      isConnected: false,
      lastUpdate: this._connectionState.lastUpdate,
      isChecking: false,
      error: null,
    };
  }

  /**
   * Subscribe to WebSocket events
   */
  subscribe(handler: WebSocketEventHandler): () => void {
    this.listeners.add(handler);
    return () => this.listeners.delete(handler);
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this._connectionState = {
        isConnected: true,
        lastUpdate: new Date(),
        isChecking: false,
        error: null,
      };
      this.notifyListeners({ type: 'connect', timestamp: Date.now() });
    };

    this.ws.onclose = () => {
      this._connectionState.isConnected = false;
      this.notifyListeners({ type: 'disconnect', timestamp: Date.now() });
      this.scheduleReconnect();
    };

    this.ws.onerror = (event) => {
      const error = new Error('WebSocket error');
      this.handleError(error);
    };

    this.ws.onmessage = (event) => {
      this.handleMessage(event.data);
    };
  }

  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(rawData: string): void {
    try {
      const data = JSON.parse(rawData) as SensorData;
      
      // Validate data structure
      if (typeof data.soilMoisture !== 'number' || typeof data.light !== 'number') {
        throw new Error('Invalid sensor data format');
      }

      this._connectionState.lastUpdate = new Date();
      
      this.notifyListeners({
        type: 'data',
        data,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  /**
   * Handle errors
   */
  private handleError(error: Error): void {
    this._connectionState = {
      ...this._connectionState,
      isConnected: false,
      isChecking: false,
      error: error.message,
    };
    
    this.notifyListeners({
      type: 'error',
      error,
      timestamp: Date.now(),
    });
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.warn('Max WebSocket reconnection attempts reached');
      return;
    }

    this.clearReconnectTimeout();
    
    this.reconnectTimeoutId = setTimeout(() => {
      this.reconnectAttempts++;
      console.log(`WebSocket reconnect attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts}`);
      this.connect();
    }, this.config.reconnectInterval);
  }

  /**
   * Clear reconnection timeout
   */
  private clearReconnectTimeout(): void {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(event: WebSocketEvent): void {
    this.listeners.forEach((handler) => handler(event));
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<WebSocketConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const webSocketService = new WebSocketService();

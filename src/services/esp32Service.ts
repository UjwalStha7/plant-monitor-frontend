/**
 * ============================================================================
 * ESP32 REST API SERVICE
 * ============================================================================
 * 
 * Handles HTTP communication with the ESP32 device.
 * 
 * INTEGRATION GUIDE:
 * ==================
 * 
 * 1. ESP32 FIRMWARE REQUIREMENTS:
 *    Your ESP32 code must:
 *    - Run a web server (use ESPAsyncWebServer library)
 *    - Serve JSON at the root endpoint (/)
 *    - Include CORS headers
 * 
 * 2. EXPECTED JSON FORMAT:
 *    {
 *      "soilMoisture": 1234,
 *      "light": 3456
 *    }
 * 
 * 3. SAMPLE ESP32 CODE:
 *    See the comments in fetchSensorData() for Arduino code example
 * 
 * 4. CORS HEADERS (Required in ESP32 response):
 *    Access-Control-Allow-Origin: *
 *    Access-Control-Allow-Methods: GET, POST, OPTIONS
 *    Content-Type: application/json
 */

import type { SensorData, ESP32Config, ESP32Response } from '@/types/sensor.types';
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
// ESP32 SERVICE CLASS
// ============================================================================

/**
 * ESP32 REST API Service
 * 
 * Handles all HTTP communication with the ESP32 device.
 * 
 * USAGE:
 * ```typescript
 * const service = new ESP32Service(ESP32_CONFIG);
 * const data = await service.fetchSensorData();
 * ```
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
    return `http://${this.config.endpoint}/`;
  }

  /**
   * Fetch sensor data from ESP32
   * 
   * INTEGRATION NOTE:
   * This method expects your ESP32 to return JSON in this format:
   * {
   *   "soilMoisture": 1234,  // ADC value 0-4095
   *   "light": 3456          // ADC value 0-4095
   * }
   * 
   * SAMPLE ESP32 ARDUINO CODE:
   * ```cpp
   * #include <ESPAsyncWebServer.h>
   * #include <ArduinoJson.h>
   * 
   * AsyncWebServer server(80);
   * 
   * void setup() {
   *   // ... WiFi setup ...
   *   
   *   server.on("/", HTTP_GET, [](AsyncWebServerRequest *request) {
   *     StaticJsonDocument<200> doc;
   *     doc["soilMoisture"] = analogRead(SOIL_PIN);
   *     doc["light"] = analogRead(LDR_PIN);
   *     
   *     String response;
   *     serializeJson(doc, response);
   *     
   *     request->send(200, "application/json", response);
   *   });
   *   
   *   // CORS headers
   *   DefaultHeaders::Instance().addHeader("Access-Control-Allow-Origin", "*");
   *   
   *   server.begin();
   * }
   * ```
   */
  async fetchSensorData(): Promise<SensorData> {
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
        mode: 'cors',
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
      return this.validateSensorData(data);
      
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
        'Failed to connect to ESP32',
        error
      );
    }
  }

  /**
   * Parse JSON response from ESP32
   */
  private async parseResponse(response: Response): Promise<ESP32Response> {
    try {
      const data = await response.json();
      return data as ESP32Response;
    } catch {
      throw new ESP32ParseError('Invalid JSON response from ESP32');
    }
  }

  /**
   * Validate and normalize sensor data
   */
  private validateSensorData(data: ESP32Response): SensorData {
    const soilMoisture = this.validateADCValue(data.soilMoisture, 'soilMoisture');
    const light = this.validateADCValue(data.light, 'light');

    return {
      soilMoisture,
      light,
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
   * Check if ESP32 is reachable
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
 * Use this for most cases, or create a new instance for custom config
 */
export const esp32Service = new ESP32Service();

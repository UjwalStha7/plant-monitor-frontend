// ESP32 API Configuration
// Update this with your ESP32's actual IP address to connect to real sensors
export const API_CONFIG = {
  // ESP32 API endpoint will be connected here
  endpoint: '192.168.137.77',
  updateInterval: 5, // seconds
};

// Sensor thresholds based on ESP32 logic
export const SOIL_MOISTURE_THRESHOLDS = {
  GOOD: 1500,    // value ≤ 1500 = Good
  OKAY: 2500,    // 1501 – 2500 = Okay
  // value > 2500 = Bad
};

export const LIGHT_THRESHOLDS = {
  BAD: 1500,     // value < 1500 = Bad
  OKAY: 3000,    // 1500 – 2999 = Okay
  // value ≥ 3000 = Good
};

// Condition evaluation functions matching ESP32 logic
export const getSoilMoistureCondition = (value: number): 'Good' | 'Okay' | 'Bad' => {
  if (value <= SOIL_MOISTURE_THRESHOLDS.GOOD) return 'Good';
  if (value <= SOIL_MOISTURE_THRESHOLDS.OKAY) return 'Okay';
  return 'Bad';
};

export const getLightCondition = (value: number): 'Good' | 'Okay' | 'Bad' => {
  if (value < LIGHT_THRESHOLDS.BAD) return 'Bad';
  if (value < LIGHT_THRESHOLDS.OKAY) return 'Okay';
  return 'Good';
};

// Mock sensor data for testing (simulates ESP32 readings)
export const mockSensorData = {
  soilMoisture: 1200,
  light: 3200,
};

// Generate realistic mock history data
export const generateMockHistoryData = (points: number = 20) => {
  const now = Date.now();
  const data = [];
  
  for (let i = points - 1; i >= 0; i--) {
    const time = new Date(now - i * 5000); // 5 second intervals
    const timeStr = time.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false 
    });
    
    // Simulate realistic sensor fluctuations
    const soilMoisture = Math.floor(800 + Math.random() * 2000 + Math.sin(i * 0.3) * 500);
    const light = Math.floor(2000 + Math.random() * 2000 + Math.cos(i * 0.2) * 800);
    
    data.push({
      time: timeStr,
      timestamp: time.getTime(),
      soilMoisture: Math.max(0, Math.min(4095, soilMoisture)),
      light: Math.max(0, Math.min(4095, light)),
    });
  }
  
  return data;
};

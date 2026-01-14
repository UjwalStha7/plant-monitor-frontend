// src/config/app.config.ts

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

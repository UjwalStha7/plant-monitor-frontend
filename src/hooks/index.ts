/**
 * ============================================================================
 * HOOKS INDEX
 * ============================================================================
 * 
 * Central export for all custom hooks.
 * Import from here for cleaner imports throughout the app.
 */

// Sensor data hooks
export { 
  useSensorData, 
  useCurrentSensorData, 
  useSensorHistory 
} from './useSensorData';
export type { UseSensorDataResult } from './useSensorData';

// Mobile detection hook
export { useIsMobile } from './use-mobile';

// Toast hook
export { useToast } from './use-toast';

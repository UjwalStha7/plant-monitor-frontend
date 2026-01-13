/**
 * Format timestamp to readable date/time
 */
export function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Get condition badge color
 */
export function getConditionColor(condition) {
  const colors = {
    Good: 'bg-green-100 text-green-800',
    Okay: 'bg-yellow-100 text-yellow-800',
    Bad: 'bg-red-100 text-red-800'
  };
  return colors[condition] || 'bg-gray-100 text-gray-800';
}

/**
 * Calculate time since last update
 */
export function getTimeSince(timestamp) {
  const now = new Date();
  const then = new Date(timestamp);
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/**
 * Format sensor value with unit
 */
export function formatSensorValue(value, type) {
  if (value === null || value === undefined) return 'N/A';
  
  switch (type) {
    case 'soil':
      return `${value} (${getSoilPercentage(value)}%)`;
    case 'light':
      return `${value} lux`;
    default:
      return value;
  }
}

/**
 * Convert soil value to percentage (inverse scale)
 */
function getSoilPercentage(value) {
  // Assuming dry = 4095, wet = 0
  // Invert and scale to 0-100%
  const percentage = ((4095 - value) / 4095) * 100;
  return Math.round(Math.max(0, Math.min(100, percentage)));
}
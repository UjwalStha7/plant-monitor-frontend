/**
 * Format timestamp to readable time string
 */
export function formatTimestamp(timestamp: string | number | Date): string {
  const date = new Date(timestamp);
  
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  if (isToday) {
    return `${hours}:${minutes}:${seconds}`;
  }
  
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  return `${month}/${day} ${hours}:${minutes}`;
}
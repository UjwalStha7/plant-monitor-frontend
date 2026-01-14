// src/components/ConnectionStatusBar.tsx
import { usePlantData } from '../hooks/usePlantData';

export default function ConnectionStatusBar() {
  const { deviceStatus, latestData } = usePlantData();
  
  const isOnline = deviceStatus?.status === 'online';
  const lastSeen = deviceStatus?.lastSeen 
    ? new Date(deviceStatus.lastSeen).toLocaleString() 
    : 'Unknown';

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Device Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span 
              className={`inline-block w-3 h-3 rounded-full ${
                isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`}
            />
            <span className={`font-semibold ${
              isOnline ? 'text-green-600' : 'text-red-600'
            }`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Device: {deviceStatus?.deviceId || 'ESP32_001'}
          </span>
        </div>

        {/* Last Update */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Last seen: {lastSeen}
        </div>
      </div>
    </div>
  );
}

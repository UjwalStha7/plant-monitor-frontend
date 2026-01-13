/**
 * ============================================================================
 * INDEX PAGE - PLANT MONITORING DASHBOARD
 * ============================================================================
 * 
 * Main dashboard page that displays sensor data and charts.
 * Uses the refactored useSensorData hook for data access.
 * 
 * ARCHITECTURE:
 * - Data is provided by useSensorData hook
 * - Condition evaluation uses functions from app.config.ts
 * - Components receive data via props (no direct service access)
 */

import { ConnectionStatusBar } from '@/components/ConnectionStatusBar';
import { SystemConfigCard } from '@/components/SystemConfigCard';
import { SensorCard } from '@/components/SensorCard';
import { SensorChart } from '@/components/SensorChart';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useSensorData } from '@/hooks/useSensorData';
import { getSoilMoistureCondition, getLightCondition } from '@/config/app.config';
import { Leaf } from 'lucide-react';

const Index = () => {
  // Get sensor data from the unified hook
  const {
    sensorData,
    historyData,
    connectionState,
    config,
    refresh,
  } = useSensorData();

  // Destructure connection state for cleaner access
  const { isConnected, lastUpdate, isChecking } = connectionState;

  // Calculate conditions based on current sensor values
  const soilCondition = getSoilMoistureCondition(sensorData.soilMoisture);
  const lightCondition = getLightCondition(sensorData.light);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            {/* Logo and Title */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold text-foreground truncate">
                  Plant Monitoring
                </h1>
                <p className="text-[10px] sm:text-sm text-muted-foreground">
                  ESP32 Sensor Dashboard
                </p>
              </div>
            </div>
            
            {/* Status and Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              <ConnectionStatusBar
                isConnected={isConnected}
                lastUpdate={lastUpdate}
                isChecking={isChecking}
                onRefresh={refresh}
              />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          
          {/* Current Readings Section */}
          <section>
            <h2 className="text-sm sm:text-lg font-semibold mb-3 sm:mb-4 text-foreground">
              Current Readings
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
              <SensorCard 
                type="soil"
                value={sensorData.soilMoisture}
                condition={soilCondition}
              />
              <SensorCard 
                type="light"
                value={sensorData.light}
                condition={lightCondition}
              />
            </div>
          </section>

          {/* Historical Data Section */}
          <section>
            <h2 className="text-sm sm:text-lg font-semibold mb-3 sm:mb-4 text-foreground">
              Sensor History
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
              <SensorChart type="soil" data={historyData} />
              <SensorChart type="light" data={historyData} />
            </div>
          </section>

          {/* System Configuration Section */}
          <section>
            <h2 className="text-sm sm:text-lg font-semibold mb-3 sm:mb-4 text-foreground">
              System Information
            </h2>
            <div className="max-w-md">
              <SystemConfigCard
                isConnected={isConnected}
                endpoint={config.endpoint}
                updateInterval={config.updateInterval}
                lastUpdate={lastUpdate}
              />
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto py-4 sm:py-6">
        <div className="container mx-auto px-3 sm:px-4 lg:px-8">
          <p className="text-center text-xs sm:text-sm text-muted-foreground">
            Plant Monitoring System by UK DJ's
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

<<<<<<< HEAD
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

=======
>>>>>>> f71a7567a7f5156dd0223126a2c48459fe88a53e
import { ConnectionStatusBar } from '@/components/ConnectionStatusBar';
import { SystemConfigCard } from '@/components/SystemConfigCard';
import { SensorCard } from '@/components/SensorCard';
import { SensorChart } from '@/components/SensorChart';
import { ThemeToggle } from '@/components/ThemeToggle';
<<<<<<< HEAD
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
=======
import { useEsp32Connection } from '@/hooks/useEsp32Connection';
import { API_CONFIG, getSoilMoistureCondition, getLightCondition } from '@/data/mockData';
import { Leaf } from 'lucide-react';

const Index = () => {
  const {
    isConnected,
    lastUpdate,
    isChecking,
    refresh,
    config,
    sensorData,
    historyData,
  } = useEsp32Connection(API_CONFIG);

  // Calculate conditions based on ESP32 logic
>>>>>>> f71a7567a7f5156dd0223126a2c48459fe88a53e
  const soilCondition = getSoilMoistureCondition(sensorData.soilMoisture);
  const lightCondition = getLightCondition(sensorData.light);

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            {/* Logo and Title */}
=======
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
>>>>>>> f71a7567a7f5156dd0223126a2c48459fe88a53e
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
<<<<<<< HEAD
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
=======
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground leading-tight">
                  Plant Monitoring System
                </h1>
                <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                  ESP32 IoT Dashboard
                </p>
              </div>
            </div>
>>>>>>> f71a7567a7f5156dd0223126a2c48459fe88a53e
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
<<<<<<< HEAD
      <main className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          
          {/* Current Readings Section */}
          <section>
            <h2 className="text-sm sm:text-lg font-semibold mb-3 sm:mb-4 text-foreground">
              Current Readings
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
              <SensorCard 
=======
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 flex-1">
        <div className="space-y-4 sm:space-y-6">
          {/* Sensor Cards Row */}
          <section>
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-foreground">
              Live Sensor Data
            </h2>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              <SensorCard
>>>>>>> f71a7567a7f5156dd0223126a2c48459fe88a53e
                type="soil"
                value={sensorData.soilMoisture}
                condition={soilCondition}
              />
<<<<<<< HEAD
              <SensorCard 
=======
              <SensorCard
>>>>>>> f71a7567a7f5156dd0223126a2c48459fe88a53e
                type="light"
                value={sensorData.light}
                condition={lightCondition}
              />
            </div>
          </section>

<<<<<<< HEAD
          {/* Historical Data Section */}
          <section>
            <h2 className="text-sm sm:text-lg font-semibold mb-3 sm:mb-4 text-foreground">
              Sensor History
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
=======
          {/* Charts Row */}
          <section>
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-foreground">
              Data Visualization
            </h2>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
>>>>>>> f71a7567a7f5156dd0223126a2c48459fe88a53e
              <SensorChart type="soil" data={historyData} />
              <SensorChart type="light" data={historyData} />
            </div>
          </section>

<<<<<<< HEAD
          {/* System Configuration Section */}
          <section>
            <h2 className="text-sm sm:text-lg font-semibold mb-3 sm:mb-4 text-foreground">
              System Information
            </h2>
            <div className="max-w-md">
=======
          {/* System Config */}
          <section>
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-foreground">
              System Configuration
            </h2>
            <div className="max-w-full lg:max-w-xl">
>>>>>>> f71a7567a7f5156dd0223126a2c48459fe88a53e
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
<<<<<<< HEAD
      <footer className="border-t mt-auto py-4 sm:py-6">
        <div className="container mx-auto px-3 sm:px-4 lg:px-8">
          <p className="text-center text-xs sm:text-sm text-muted-foreground">
            Plant Monitoring System by UK DJ's
=======
      <footer className="border-t bg-card py-3 sm:py-4 mt-auto">
        <div className="container mx-auto px-3 sm:px-4">
          <p className="text-center text-xs sm:text-sm text-muted-foreground">
            Plant Monitoring System by <span className="font-semibold text-primary">UK DJ's</span>
>>>>>>> f71a7567a7f5156dd0223126a2c48459fe88a53e
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

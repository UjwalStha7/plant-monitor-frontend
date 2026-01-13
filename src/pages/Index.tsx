import { ConnectionStatusBar } from '@/components/ConnectionStatusBar';
import { SystemConfigCard } from '@/components/SystemConfigCard';
import { SensorCard } from '@/components/SensorCard';
import { SensorChart } from '@/components/SensorChart';
import { ThemeToggle } from '@/components/ThemeToggle';
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
  const soilCondition = getSoilMoistureCondition(sensorData.soilMoisture);
  const lightCondition = getLightCondition(sensorData.light);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground leading-tight">
                  Plant Monitoring System
                </h1>
                <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                  ESP32 IoT Dashboard
                </p>
              </div>
            </div>
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
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 flex-1">
        <div className="space-y-4 sm:space-y-6">
          {/* Sensor Cards Row */}
          <section>
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-foreground">
              Live Sensor Data
            </h2>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
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

          {/* Charts Row */}
          <section>
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-foreground">
              Data Visualization
            </h2>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
              <SensorChart type="soil" data={historyData} />
              <SensorChart type="light" data={historyData} />
            </div>
          </section>

          {/* System Config */}
          <section>
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-foreground">
              System Configuration
            </h2>
            <div className="max-w-full lg:max-w-xl">
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
      <footer className="border-t bg-card py-3 sm:py-4 mt-auto">
        <div className="container mx-auto px-3 sm:px-4">
          <p className="text-center text-xs sm:text-sm text-muted-foreground">
            Plant Monitoring System by <span className="font-semibold text-primary">UK DJ's</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

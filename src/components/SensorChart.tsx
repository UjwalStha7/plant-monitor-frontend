/**
 * ============================================================================
 * SENSOR CHART COMPONENT
 * ============================================================================
 * 
 * Displays historical sensor data in an area chart with threshold lines.
 * Uses data from useSensorData hook.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts';
import { Droplets, Sun } from 'lucide-react';
import type { HistoryDataPoint, SensorType } from '@/types/sensor.types';
import { 
  SOIL_MOISTURE_THRESHOLDS, 
  LIGHT_THRESHOLDS,
  getSoilMoistureCondition,
  getLightCondition,
  CHART_CONFIG,
} from '@/config/app.config';

// ============================================================================
// COMPONENT PROPS
// ============================================================================

interface SensorChartProps {
  type: SensorType;
  data: HistoryDataPoint[];
}

// ============================================================================
// CHART CONFIGURATION
// ============================================================================

const getChartConfig = (type: SensorType) => {
  const isSoil = type === 'soil';
  
  return {
    dataKey: isSoil ? 'soilMoisture' : 'light',
    title: isSoil ? 'Soil Moisture' : 'Light (LDR)',
    icon: isSoil ? Droplets : Sun,
    thresholds: isSoil 
      ? SOIL_MOISTURE_THRESHOLDS.levels 
      : LIGHT_THRESHOLDS.levels,
    getCondition: isSoil ? getSoilMoistureCondition : getLightCondition,
  };
};

// ============================================================================
// COMPONENT
// ============================================================================

export const SensorChart = ({ type, data }: SensorChartProps) => {
  const config = getChartConfig(type);
  const Icon = config.icon;
  
  // Chart colors - using primary theme color
  const chartColor = 'hsl(142, 70%, 45%)';

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    
    const value = payload[0].value;
    const condition = config.getCondition(value);
    
    const conditionColors = {
      Good: 'text-success',
      Okay: 'text-warning',
      Bad: 'text-destructive',
    };
    
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-lg font-bold">{value}</p>
        <p className={`text-sm font-medium ${conditionColors[condition]}`}>
          Status: {condition}
        </p>
      </div>
    );
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center gap-2 pb-3 sm:pb-4 px-4 sm:px-6">
        <div className="p-1.5 sm:p-2 rounded-full bg-primary/10 text-primary">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <CardTitle className="text-sm sm:text-base font-semibold truncate">
            {config.title} History
          </CardTitle>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Real-time ADC values
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="px-3 sm:px-6">
        <div className="h-[220px] sm:h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 50, left: 5, bottom: 5 }}
            >
              <defs>
                <linearGradient id={`gradient-${type}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                vertical={false}
              />
              
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
                interval="preserveStartEnd"
                tickMargin={8}
              />
              
              <YAxis 
                domain={[CHART_CONFIG.yAxisMin, CHART_CONFIG.yAxisMax]}
                ticks={CHART_CONFIG.yAxisTicks}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
                width={45}
                tickMargin={8}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              {/* Threshold reference lines */}
              {config.thresholds.slice(0, -1).map((threshold, index) => (
                <ReferenceLine
                  key={index}
                  y={threshold.value}
                  stroke={threshold.color}
                  strokeWidth={1.5}
                  strokeDasharray="6 3"
                  strokeOpacity={0.7}
                />
              ))}
              
              <Area
                type="monotone"
                dataKey={config.dataKey}
                stroke={chartColor}
                strokeWidth={2}
                fill={`url(#gradient-${type})`}
                dot={false}
                activeDot={{ r: 3, fill: chartColor }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Threshold legend */}
        <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border px-2 sm:px-0">
          {config.thresholds.slice(0, -1).map((threshold, index) => (
            <div key={index} className="flex items-center gap-1.5 sm:gap-2">
              <div 
                className="w-2.5 sm:w-3 h-0.5"
                style={{ backgroundColor: threshold.color }}
              />
              <span className="text-[10px] sm:text-xs text-muted-foreground">
                {threshold.label} ({threshold.value})
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

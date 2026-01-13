<<<<<<< HEAD
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
=======
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
>>>>>>> f71a7567a7f5156dd0223126a2c48459fe88a53e
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
<<<<<<< HEAD
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
=======
import { SOIL_MOISTURE_THRESHOLDS, LIGHT_THRESHOLDS } from '@/data/mockData';

interface HistoryDataPoint {
  time: string;
  timestamp: number;
  soilMoisture: number;
  light: number;
}

interface SensorChartProps {
  type: 'soil' | 'light';
  data: HistoryDataPoint[];
}

export const SensorChart = ({ type, data }: SensorChartProps) => {
  const isSoil = type === 'soil';
  const dataKey = isSoil ? 'soilMoisture' : 'light';
  
  // Colors for the chart
  const chartColor = 'hsl(142, 70%, 45%)';
  const chartColorLight = 'hsl(142, 70%, 45%, 0.1)';
  
  // Get thresholds for reference lines with distinct colors
  const thresholds = isSoil 
    ? [
        { value: SOIL_MOISTURE_THRESHOLDS.GOOD, label: 'Good', color: 'hsl(142, 70%, 45%)' },
        { value: SOIL_MOISTURE_THRESHOLDS.OKAY, label: 'Okay', color: 'hsl(45, 95%, 50%)' },
        { value: 2500, label: 'Bad', color: 'hsl(0, 75%, 55%)' },
      ]
    : [
        { value: LIGHT_THRESHOLDS.BAD, label: 'Bad', color: 'hsl(0, 75%, 55%)' },
        { value: LIGHT_THRESHOLDS.OKAY, label: 'Okay', color: 'hsl(45, 95%, 50%)' },
        { value: 3000, label: 'Good', color: 'hsl(142, 70%, 45%)' },
      ];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      let condition = '';
      let conditionColor = '';
      
      if (isSoil) {
        if (value <= SOIL_MOISTURE_THRESHOLDS.GOOD) {
          condition = 'Good';
          conditionColor = 'text-success';
        } else if (value <= SOIL_MOISTURE_THRESHOLDS.OKAY) {
          condition = 'Okay';
          conditionColor = 'text-warning';
        } else {
          condition = 'Bad';
          conditionColor = 'text-destructive';
        }
      } else {
        if (value < LIGHT_THRESHOLDS.BAD) {
          condition = 'Bad';
          conditionColor = 'text-destructive';
        } else if (value < LIGHT_THRESHOLDS.OKAY) {
          condition = 'Okay';
          conditionColor = 'text-warning';
        } else {
          condition = 'Good';
          conditionColor = 'text-success';
        }
      }
      
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-xs text-muted-foreground mb-1">{label}</p>
          <p className="text-lg font-bold">{value}</p>
          <p className={`text-sm font-medium ${conditionColor}`}>
            Status: {condition}
          </p>
        </div>
      );
    }
    return null;
>>>>>>> f71a7567a7f5156dd0223126a2c48459fe88a53e
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center gap-2 pb-3 sm:pb-4 px-4 sm:px-6">
        <div className="p-1.5 sm:p-2 rounded-full bg-primary/10 text-primary">
<<<<<<< HEAD
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <CardTitle className="text-sm sm:text-base font-semibold truncate">
            {config.title} History
=======
          {isSoil ? (
            <Droplets className="h-4 w-4 sm:h-5 sm:w-5" />
          ) : (
            <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <CardTitle className="text-sm sm:text-base font-semibold truncate">
            {isSoil ? 'Soil Moisture' : 'Light (LDR)'} History
>>>>>>> f71a7567a7f5156dd0223126a2c48459fe88a53e
          </CardTitle>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Real-time ADC values
          </p>
        </div>
      </CardHeader>
<<<<<<< HEAD
      
=======
>>>>>>> f71a7567a7f5156dd0223126a2c48459fe88a53e
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
<<<<<<< HEAD
              
=======
>>>>>>> f71a7567a7f5156dd0223126a2c48459fe88a53e
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                vertical={false}
              />
<<<<<<< HEAD
              
=======
>>>>>>> f71a7567a7f5156dd0223126a2c48459fe88a53e
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
                interval="preserveStartEnd"
                tickMargin={8}
              />
<<<<<<< HEAD
              
              <YAxis 
                domain={[CHART_CONFIG.yAxisMin, CHART_CONFIG.yAxisMax]}
                ticks={CHART_CONFIG.yAxisTicks}
=======
              <YAxis 
                domain={[0, 5000]}
                ticks={[0, 1000, 2000, 3000, 4000, 5000]}
>>>>>>> f71a7567a7f5156dd0223126a2c48459fe88a53e
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
                width={45}
                tickMargin={8}
              />
<<<<<<< HEAD
              
              <Tooltip content={<CustomTooltip />} />
              
              {/* Threshold reference lines */}
              {config.thresholds.slice(0, -1).map((threshold, index) => (
=======
              <Tooltip content={<CustomTooltip />} />
              
              {/* Reference lines for thresholds */}
              {thresholds.map((threshold, index) => (
>>>>>>> f71a7567a7f5156dd0223126a2c48459fe88a53e
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
<<<<<<< HEAD
                dataKey={config.dataKey}
=======
                dataKey={dataKey}
>>>>>>> f71a7567a7f5156dd0223126a2c48459fe88a53e
                stroke={chartColor}
                strokeWidth={2}
                fill={`url(#gradient-${type})`}
                dot={false}
                activeDot={{ r: 3, fill: chartColor }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
<<<<<<< HEAD
        {/* Threshold legend */}
        <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border px-2 sm:px-0">
          {config.thresholds.slice(0, -1).map((threshold, index) => (
=======
        {/* Legend - Responsive grid */}
        <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border px-2 sm:px-0">
          {thresholds.map((threshold, index) => (
>>>>>>> f71a7567a7f5156dd0223126a2c48459fe88a53e
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

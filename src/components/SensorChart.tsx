// src/components/SensorChart.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Sun } from 'lucide-react';
import type { SensorData } from '@/services/api';

interface SensorChartProps {
  type: 'soil' | 'light';
  data: SensorData[];
}

export function SensorChart({ type, data }: SensorChartProps) {
  const isSoil = type === 'soil';
  
  const chartData = data
    .map((item) => ({
      time: new Date(item.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      value: isSoil ? item.soilValue : item.ldrValue,
      timestamp: new Date(item.timestamp).getTime(),
    }))
    .reverse() // Show oldest to newest
    .slice(-20); // Show last 20 points

  const config = {
    soil: {
      title: 'Soil Moisture History',
      color: '#3b82f6',
      icon: TrendingUp,
      unit: '',
    },
    light: {
      title: 'Light Level History',
      color: '#f59e0b',
      icon: Sun,
      unit: '',
    },
  };

  const { title, color, icon: Icon } = config[type];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={60}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[250px] text-muted-foreground">
            <p className="text-sm">No historical data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

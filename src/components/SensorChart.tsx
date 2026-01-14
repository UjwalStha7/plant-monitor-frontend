// src/components/SensorChart.tsx
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { SensorData } from '../services/api';

interface SensorChartProps {
  data: SensorData[];
  type?: 'soil' | 'light' | 'both';
}

export default function SensorChart({ data, type = 'both' }: SensorChartProps) {
  // Transform data for chart
  const chartData = data
    .map(item => ({
      time: new Date(item.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      timestamp: new Date(item.timestamp).getTime(),
      soil: item.soilValue,
      light: item.ldrValue
    }))
    .reverse(); // Oldest to newest

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Historical Data (Last 24 Hours)
      </h3>
      
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 12, fill: '#9CA3AF' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: 'none',
              borderRadius: '8px',
              color: '#F9FAFB'
            }}
          />
          <Legend />
          
          {(type === 'both' || type === 'soil') && (
            <Line
              type="monotone"
              dataKey="soil"
              stroke="#3B82F6"
              name="Soil Moisture"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          )}
          
          {(type === 'both' || type === 'light') && (
            <Line
              type="monotone"
              dataKey="light"
              stroke="#F59E0B"
              name="Light Level"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

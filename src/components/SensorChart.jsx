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
import { formatTimestamp } from '../utils/formatters';

export function SensorChart({ data, type = 'both' }) {
  // Transform data for chart
  const chartData = data.map(item => ({
    time: formatTimestamp(item.timestamp),
    timestamp: new Date(item.timestamp).getTime(),
    soil: item.soilValue,
    light: item.ldrValue
  })).reverse(); // Reverse to show oldest to newest

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis />
        <Tooltip />
        <Legend />
        
        {(type === 'both' || type === 'soil') && (
          <Line
            type="monotone"
            dataKey="soil"
            stroke="#3b82f6"
            name="Soil Moisture"
            strokeWidth={2}
            dot={false}
          />
        )}
        
        {(type === 'both' || type === 'light') && (
          <Line
            type="monotone"
            dataKey="light"
            stroke="#f59e0b"
            name="Light Level"
            strokeWidth={2}
            dot={false}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}

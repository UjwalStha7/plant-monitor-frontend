import React from 'react';
import { usePlantData } from './hooks/usePlantData';

export default function Dashboard() {
  const { latestData, deviceStatus, historicalData, loading, error } = usePlantData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading plant data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Device Status */}
      <div className="mb-6">
        <DeviceStatusCard status={deviceStatus} />
      </div>

      {/* Latest Readings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <SensorCard
          title="Soil Moisture"
          value={latestData?.soilValue}
          condition={latestData?.soilCondition}
          icon="💧"
        />
        <SensorCard
          title="Light Level"
          value={latestData?.ldrValue}
          condition={latestData?.lightCondition}
          icon="☀️"
        />
      </div>

      {/* Historical Charts */}
      <div className="mt-6">
        <ChartSection data={historicalData} />
      </div>
    </div>
  );
}

// Device Status Component
function DeviceStatusCard({ status }) {
  const isOnline = status?.status === 'online';
  const lastSeen = status?.lastSeen ? new Date(status.lastSeen).toLocaleString() : 'Unknown';

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">ESP32 Status</h3>
          <p className="text-sm text-gray-600">Device ID: {status?.deviceId}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-block w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className={`font-semibold ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">Last seen: {lastSeen}</p>
    </div>
  );
}

// Sensor Card Component
function SensorCard({ title, value, condition, icon }) {
  const getConditionColor = (cond) => {
    switch (cond) {
      case 'Good': return 'text-green-600 bg-green-50';
      case 'Okay': return 'text-yellow-600 bg-yellow-50';
      case 'Bad': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="text-3xl">{icon}</span>
      </div>
      <div className="space-y-2">
        <div className="text-3xl font-bold">{value || '---'}</div>
        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getConditionColor(condition)}`}>
          {condition || 'Unknown'}
        </div>
      </div>
    </div>
  );
}

// Chart Section Component
function ChartSection({ data }) {
  // Use your preferred charting library (recharts, chart.js, etc.)
  // This is a placeholder - implement based on your existing charts
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Historical Data</h3>
      <div className="h-64 flex items-center justify-center text-gray-400">
        Chart Component Here
        <br />
        Data points: {data.length}
      </div>
    </div>
  );
}

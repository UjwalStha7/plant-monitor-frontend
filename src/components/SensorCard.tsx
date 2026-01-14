// src/components/SensorCard.tsx
import React from 'react';

interface SensorCardProps {
  title: string;
  value: number | null;
  condition: 'Good' | 'Okay' | 'Bad' | null;
  icon: string;
  unit?: string;
}

export default function SensorCard({ 
  title, 
  value, 
  condition, 
  icon,
  unit = ''
}: SensorCardProps) {
  
  const getConditionColor = (cond: string | null) => {
    switch (cond) {
      case 'Good':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Okay':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Bad':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <span className="text-4xl">{icon}</span>
      </div>

      {/* Value */}
      <div className="space-y-3">
        <div className="text-4xl font-bold text-gray-900 dark:text-white">
          {value !== null ? `${value}${unit}` : '---'}
        </div>

        {/* Condition Badge */}
        <div className="inline-flex">
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getConditionColor(condition)}`}>
            {condition || 'Unknown'}
          </span>
        </div>
      </div>
    </div>
  );
}

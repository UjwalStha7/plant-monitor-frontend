// src/components/SensorCard.tsx
import React from 'react';
import { Droplets, Sun } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Condition } from '@/config/app.config';

export interface SensorCardProps {
  type: 'soil' | 'light';
  value: number;
  condition: Condition;
}

export default function SensorCard({ 
  type, 
  value, 
  condition,
}: SensorCardProps) {
  
  const config = {
    soil: {
      title: 'Soil Moisture',
      icon: Droplets,
      unit: '',
      description: 'ADC Value',
    },
    light: {
      title: 'Light Level',
      icon: Sun,
      unit: '',
      description: 'ADC Value',
    },
  }[type];

  const getConditionColor = (cond: Condition) => {
    switch (cond) {
      case 'Good':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Okay':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Bad':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    }
  };

  const Icon = config.icon;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {config.title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Value */}
          <div className="text-2xl font-bold">
            {value}{config.unit}
          </div>
          
          {/* Description */}
          <p className="text-xs text-muted-foreground">
            {config.description}
          </p>

          {/* Condition Badge */}
          <div className="inline-flex">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getConditionColor(condition)}`}>
              {condition}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// src/components/ConnectionStatusBar.tsx
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConnectionStatusBarProps {
  isConnected: boolean;
  lastUpdate: Date | null;
  isChecking: boolean;
  onRefresh: () => void;
}

export default function ConnectionStatusBar({
  isConnected,
  lastUpdate,
  isChecking,
  onRefresh,
}: ConnectionStatusBarProps) {
  const formatLastUpdate = (date: Date | null) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    
    if (diffSecs < 10) return 'Just now';
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    
    return date.toLocaleTimeString();
  };

  return (
    <div className="flex items-center gap-2">
      {/* Status Indicator */}
      <div className="flex items-center gap-1.5">
        <span
          className={`inline-block w-2 h-2 rounded-full ${
            isConnected
              ? 'bg-green-500 animate-pulse'
              : 'bg-red-500'
          }`}
        />
        <span className="text-xs sm:text-sm font-medium">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Last Update */}
      <span className="hidden sm:inline text-xs text-muted-foreground">
        {formatLastUpdate(lastUpdate)}
      </span>

      {/* Refresh Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onRefresh}
        disabled={isChecking}
        className="h-8 w-8 p-0"
      >
        <RefreshCw
          className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`}
        />
      </Button>
    </div>
  );
}

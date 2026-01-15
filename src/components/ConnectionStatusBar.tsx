import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ConnectionStatusBarProps {
  isConnected: boolean;
  lastUpdate: Date | null;
  isChecking: boolean;
  onRefresh: () => void;
}

export const ConnectionStatusBar = ({
  isConnected,
  lastUpdate,
  isChecking,
  onRefresh,
}: ConnectionStatusBarProps) => {
  const formatLastUpdate = (date: Date | null): string => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 5) return 'Just now';
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    
    return date.toLocaleTimeString();
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 px-3 sm:px-4 py-2 bg-card rounded-lg border shadow-sm">
      <div className="flex items-center gap-2">
        {isConnected ? (
          <Wifi className="h-4 w-4 text-success flex-shrink-0" />
        ) : (
          <WifiOff className="h-4 w-4 text-destructive flex-shrink-0" />
        )}
        <span
          className={cn(
            'text-xs sm:text-sm font-medium whitespace-nowrap',
            isConnected ? 'text-success' : 'text-destructive'
          )}
        >
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      <span className="text-xs sm:text-sm text-muted-foreground hidden md:inline">
        Last updated: {formatLastUpdate(lastUpdate)}
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isChecking}
        className="gap-1.5 sm:gap-2 h-8 px-2 sm:px-3 text-xs sm:text-sm"
      >
        <RefreshCw className={cn('h-3.5 w-3.5 sm:h-4 sm:w-4', isChecking && 'animate-spin')} />
        <span className="hidden xs:inline">Refresh</span>
      </Button>
    </div>
  );
};

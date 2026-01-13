import { Settings, Server, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SystemConfigCardProps {
  isConnected: boolean;
  endpoint: string;
  updateInterval: number;
  lastUpdate: Date | null;
}

export const SystemConfigCard = ({
  isConnected,
  endpoint,
  updateInterval,
  lastUpdate,
}: SystemConfigCardProps) => {
  const formatLastUpdate = (date: Date | null): string => {
    if (!date) return 'N/A';
    return date.toLocaleString();
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg font-semibold">
          <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
          <span className="truncate">System Configuration</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0 px-4 sm:px-6">
        {/* Connection Status */}
        <div className="flex items-center justify-between py-3 sm:py-4 border-b gap-2">
          <span className="text-xs sm:text-sm text-muted-foreground">Connection Status</span>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span
              className={cn(
                'h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full status-pulse flex-shrink-0',
                isConnected ? 'bg-success' : 'bg-destructive'
              )}
            />
            <span
              className={cn(
                'text-xs sm:text-sm font-medium',
                isConnected ? 'text-success' : 'text-destructive'
              )}
            >
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* ESP32 Endpoint */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 sm:py-4 border-b gap-1 sm:gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
            <Server className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">ESP32 Endpoint</span>
          </div>
          <code className="px-2 sm:px-3 py-0.5 sm:py-1 bg-muted rounded text-[10px] sm:text-sm font-mono truncate max-w-full sm:max-w-[200px]">
            {endpoint}
          </code>
        </div>

        {/* Update Interval */}
        <div className="flex items-center justify-between py-3 sm:py-4 border-b gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">Update Interval</span>
          </div>
          <span className="text-xs sm:text-sm font-medium">{updateInterval}s</span>
        </div>

        {/* Last Data Update */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 sm:py-4 gap-1 sm:gap-2">
          <span className="text-xs sm:text-sm text-muted-foreground">Last Data Update</span>
          <span className="text-xs sm:text-sm font-medium truncate">{formatLastUpdate(lastUpdate)}</span>
        </div>

      </CardContent>
    </Card>
  );
};

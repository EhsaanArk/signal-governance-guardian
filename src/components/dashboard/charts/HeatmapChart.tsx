
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { HeatmapData } from '@/lib/api/dashboard';
import { useDashboardTimeRange } from '@/hooks/useDashboardTimeRange';

interface HeatmapChartProps {
  heatmapData: HeatmapData | undefined;
  heatmapLoading: boolean;
}

const HeatmapChart: React.FC<HeatmapChartProps> = ({ heatmapData, heatmapLoading }) => {
  const { timeRange } = useDashboardTimeRange();
  
  const getSubtitle = () => {
    if (timeRange.preset === '24h') return 'Distribution of stop-loss events across markets and time periods (last 24 hours)';
    if (timeRange.preset === '7d') return 'Distribution of stop-loss events across markets and time periods (last 7 days)';
    if (timeRange.preset === '30d') return 'Distribution of stop-loss events across markets and time periods (last 30 days)';
    if (timeRange.preset === '90d') return 'Distribution of stop-loss events across markets and time periods (last 90 days)';
    return 'Distribution of stop-loss events across markets and time periods (selected period)';
  };

  if (heatmapLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-base lg:text-lg font-semibold">Loss-Events Activity Map</h3>
          <p className="text-xs lg:text-sm text-muted-foreground">{getSubtitle()}</p>
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Define trading sessions with their time ranges
  const tradingSessions = [
    { name: 'Sydney', time: '21:00-00:00 UTC' },
    { name: 'Tokyo', time: '00:00-06:00 UTC' },
    { name: 'London', time: '06:00-12:00 UTC' },
    { name: 'New York', time: '12:00-17:00 UTC' },
    { name: 'After-hours', time: '17:00-21:00 UTC' }
  ];

  const markets = ['Forex', 'Crypto', 'Indices'];

  // Mock data transformation - you'll need to adjust this based on your actual data structure
  const getEventCount = (market: string, session: string) => {
    // This is a placeholder - replace with actual data mapping logic
    if (market === 'Forex' && session === 'After-hours') return 1;
    return 0;
  };

  const getIntensityClass = (count: number) => {
    if (count === 0) return 'bg-gray-100';
    if (count <= 2) return 'bg-yellow-200'; // Low (1-2)
    if (count <= 5) return 'bg-orange-300'; // Medium (3-5)
    if (count <= 10) return 'bg-red-400'; // High (6-10)
    return 'bg-red-600'; // Critical (10+)
  };

  const getTotalForMarket = (market: string) => {
    return tradingSessions.reduce((total, session) => total + getEventCount(market, session.name), 0);
  };

  const getTotalForSession = (session: string) => {
    return markets.reduce((total, market) => total + getEventCount(market, session), 0);
  };

  const grandTotal = markets.reduce((total, market) => total + getTotalForMarket(market), 0);
  const mostActiveSession = tradingSessions.reduce((max, session) => 
    getTotalForSession(session.name) > getTotalForSession(max.name) ? session : max
  );
  const mostActiveMarket = markets.reduce((max, market) => 
    getTotalForMarket(market) > getTotalForMarket(max) ? market : max
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base lg:text-lg font-semibold">Loss-Events Activity Map</h3>
        <p className="text-xs lg:text-sm text-muted-foreground">{getSubtitle()}</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="font-medium">Loss Events Intensity:</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-100 rounded border"></div>
          <span>None (0)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-yellow-200 rounded border"></div>
          <span>Low (1-2)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-orange-300 rounded border"></div>
          <span>Medium (3-5)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-400 rounded border"></div>
          <span>High (6-10)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-600 rounded border"></div>
          <span>Critical (10+)</span>
        </div>
      </div>

      {/* Heatmap Table */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            <div className="text-sm font-medium text-muted-foreground">Market</div>
            {tradingSessions.map((session) => (
              <div key={session.name} className="text-center">
                <div className="text-sm font-medium">{session.name}</div>
                <div className="text-xs text-muted-foreground">{session.time}</div>
              </div>
            ))}
            <div className="text-center">
              <div className="text-sm font-medium">Σ Total</div>
              <div className="text-xs text-muted-foreground">All Sessions</div>
            </div>
          </div>

          {/* Market Rows */}
          {markets.map((market) => (
            <div key={market} className="grid grid-cols-7 gap-2 mb-2">
              <div className="flex items-center text-sm font-medium">{market}</div>
              {tradingSessions.map((session) => {
                const count = getEventCount(market, session.name);
                return (
                  <div
                    key={session.name}
                    className={`h-16 rounded-lg border flex flex-col items-center justify-center text-center ${getIntensityClass(count)}`}
                  >
                    <div className="text-lg font-bold">{count}</div>
                    <div className="text-xs text-muted-foreground">events</div>
                  </div>
                );
              })}
              <div className="h-16 rounded-lg border border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-center">
                <div className="text-lg font-bold">{getTotalForMarket(market)}</div>
                <div className="text-xs text-muted-foreground">total</div>
              </div>
            </div>
          ))}

          {/* Total Row */}
          <div className="grid grid-cols-7 gap-2 mt-4">
            <div className="flex items-center text-sm font-medium">Σ Total</div>
            {tradingSessions.map((session) => (
              <div
                key={session.name}
                className="h-16 rounded-lg border border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-center"
              >
                <div className="text-lg font-bold">{getTotalForSession(session.name)}</div>
                <div className="text-xs text-muted-foreground">total</div>
              </div>
            ))}
            <div className="h-16 rounded-lg border border-blue-300 bg-blue-50 flex flex-col items-center justify-center text-center">
              <div className="text-lg font-bold text-blue-600">{grandTotal}</div>
              <div className="text-xs text-blue-600">grand</div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="text-sm text-muted-foreground space-y-1">
        <div>Total Events: <span className="font-medium">{grandTotal}</span></div>
        <div>Most Active Session: <span className="font-medium">{mostActiveSession.name}</span></div>
        <div>Most Active Market: <span className="font-medium">{mostActiveMarket}</span></div>
      </div>
    </div>
  );
};

export default HeatmapChart;

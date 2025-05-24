import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { HeatmapData } from '@/lib/api/dashboard';
import { useDashboardTimeRange } from '@/hooks/useDashboardTimeRange';

interface HeatmapChartProps {
  heatmapData: HeatmapData | undefined;
  heatmapLoading: boolean;
}

// Predefined trading sessions - keep the original design
const TRADING_SESSIONS = [
  { name: 'Sydney', startHour: 21, endHour: 0 },
  { name: 'Tokyo', startHour: 0, endHour: 6 },
  { name: 'London', startHour: 6, endHour: 12 },
  { name: 'New York', startHour: 12, endHour: 17 },
  { name: 'After-hours', startHour: 17, endHour: 21 }
];

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

  if (!heatmapData) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-base lg:text-lg font-semibold">Loss-Events Activity Map</h3>
          <p className="text-xs lg:text-sm text-muted-foreground">{getSubtitle()}</p>
        </div>
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          No data available for the selected period
        </div>
      </div>
    );
  }

  const markets = ['Forex', 'Crypto', 'Indices'];

  const getEventCount = (market: string, session: { startHour: number; endHour: number }) => {
    const marketData = heatmapData.markets[market] || {};
    let count = 0;
    
    // Handle sessions that cross midnight (like Sydney 21-0)
    if (session.startHour > session.endHour) {
      // Count from startHour to 23
      for (let hour = session.startHour; hour <= 23; hour++) {
        count += marketData[hour] || 0;
      }
      // Count from 0 to endHour
      for (let hour = 0; hour <= session.endHour; hour++) {
        count += marketData[hour] || 0;
      }
    } else {
      // Normal session range
      for (let hour = session.startHour; hour <= session.endHour; hour++) {
        count += marketData[hour] || 0;
      }
    }
    
    return count;
  };

  const getIntensityClass = (count: number) => {
    if (count === 0) return 'bg-gray-100';
    if (count <= 2) return 'bg-yellow-200'; // Low (1-2)
    if (count <= 5) return 'bg-orange-300'; // Medium (3-5)
    if (count <= 10) return 'bg-red-400'; // High (6-10)
    return 'bg-red-600'; // Critical (10+)
  };

  const formatSessionTime = (session: { startHour: number; endHour: number }) => {
    const formatHour = (hour: number) => `${hour.toString().padStart(2, '0')}:00`;
    return `${formatHour(session.startHour)}–${formatHour(session.endHour)} UTC`;
  };

  const getTotalForMarket = (market: string) => {
    return heatmapData.totalsByMarket[market] || 0;
  };

  const getTotalForSession = (session: { startHour: number; endHour: number }) => {
    let total = 0;
    markets.forEach(market => {
      total += getEventCount(market, session);
    });
    return total;
  };

  const grandTotal = heatmapData.grandTotal || 0;
  
  const mostActiveSession = TRADING_SESSIONS.reduce((max, session) => 
    getTotalForSession(session) > getTotalForSession(max) ? session : max
  , TRADING_SESSIONS[0]);
  
  const mostActiveMarket = markets.reduce((max, market) => 
    getTotalForMarket(market) > getTotalForMarket(max) ? market : max
  , markets[0]);

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
          <div className={`grid gap-2 mb-2`} style={{ gridTemplateColumns: `minmax(120px, 1fr) repeat(${TRADING_SESSIONS.length}, 1fr) 120px` }}>
            <div className="text-sm font-medium text-muted-foreground">Market</div>
            {TRADING_SESSIONS.map((session) => (
              <div key={session.name} className="text-center">
                <div className="text-sm font-medium">{session.name}</div>
                <div className="text-xs text-muted-foreground">{formatSessionTime(session)}</div>
              </div>
            ))}
            <div className="text-center">
              <div className="text-sm font-medium">Σ Total</div>
              <div className="text-xs text-muted-foreground">All Sessions</div>
            </div>
          </div>

          {/* Market Rows */}
          {markets.map((market) => (
            <div key={market} className={`grid gap-2 mb-2`} style={{ gridTemplateColumns: `minmax(120px, 1fr) repeat(${TRADING_SESSIONS.length}, 1fr) 120px` }}>
              <div className="flex items-center text-sm font-medium">{market}</div>
              {TRADING_SESSIONS.map((session) => {
                const count = getEventCount(market, session);
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
          <div className={`grid gap-2 mt-4`} style={{ gridTemplateColumns: `minmax(120px, 1fr) repeat(${TRADING_SESSIONS.length}, 1fr) 120px` }}>
            <div className="flex items-center text-sm font-medium">Σ Total</div>
            {TRADING_SESSIONS.map((session) => (
              <div
                key={session.name}
                className="h-16 rounded-lg border border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-center"
              >
                <div className="text-lg font-bold">{getTotalForSession(session)}</div>
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

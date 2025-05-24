
import React from 'react';
import { HeatmapData } from '@/lib/api/dashboard';
import { 
  TRADING_SESSIONS, 
  getEventCount, 
  getIntensityClass, 
  formatSessionTime, 
  getTotalForMarket, 
  getTotalForSession 
} from './utils/heatmapUtils';

interface HeatmapTableProps {
  heatmapData: HeatmapData;
  markets: string[];
}

const HeatmapTable: React.FC<HeatmapTableProps> = ({ heatmapData, markets }) => {
  return (
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
              const count = getEventCount(heatmapData.markets, market, session);
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
              <div className="text-lg font-bold">{getTotalForMarket(heatmapData.totalsByMarket, market)}</div>
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
              <div className="text-lg font-bold">{getTotalForSession(heatmapData.markets, markets, session)}</div>
              <div className="text-xs text-muted-foreground">total</div>
            </div>
          ))}
          <div className="h-16 rounded-lg border border-blue-300 bg-blue-50 flex flex-col items-center justify-center text-center">
            <div className="text-lg font-bold text-blue-600">{heatmapData.grandTotal}</div>
            <div className="text-xs text-blue-600">grand</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapTable;

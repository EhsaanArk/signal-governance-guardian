
import React from 'react';
import { HeatmapData } from '@/lib/api/dashboard';
import { TRADING_SESSIONS, getTotalForMarket, getTotalForSession } from './utils/heatmapUtils';

interface HeatmapSummaryProps {
  heatmapData: HeatmapData;
  markets: string[];
}

const HeatmapSummary: React.FC<HeatmapSummaryProps> = ({ heatmapData, markets }) => {
  const mostActiveSession = TRADING_SESSIONS.reduce((max, session) => 
    getTotalForSession(heatmapData.markets, markets, session) > getTotalForSession(heatmapData.markets, markets, max) ? session : max
  , TRADING_SESSIONS[0]);
  
  const mostActiveMarket = markets.reduce((max, market) => 
    getTotalForMarket(heatmapData.totalsByMarket, market) > getTotalForMarket(heatmapData.totalsByMarket, max) ? market : max
  , markets[0]);

  return (
    <div className="text-sm text-muted-foreground space-y-1">
      <div>Total Events: <span className="font-medium">{heatmapData.grandTotal}</span></div>
      <div>Most Active Session: <span className="font-medium">{mostActiveSession.name}</span></div>
      <div>Most Active Market: <span className="font-medium">{mostActiveMarket}</span></div>
    </div>
  );
};

export default HeatmapSummary;

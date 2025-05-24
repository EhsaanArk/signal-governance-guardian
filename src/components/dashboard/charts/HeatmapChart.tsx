
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';
import { HeatmapData } from '@/lib/api/dashboard';
import { TRADING_SESSIONS, getSessionEvents, TradingSession } from '@/utils/tradingSessions';
import { useDashboardTimeRange } from '@/hooks/useDashboardTimeRange';

interface HeatmapChartProps {
  heatmapData: HeatmapData | undefined;
  heatmapLoading: boolean;
}

const HeatmapChart: React.FC<HeatmapChartProps> = ({ heatmapData, heatmapLoading }) => {
  const navigate = useNavigate();
  const { timeRange } = useDashboardTimeRange();

  if (heatmapLoading) {
    return <Skeleton className="h-80 w-full" />;
  }

  const getPeriodLabel = () => {
    switch (timeRange.preset) {
      case '24h': return 'last 24 hours';
      case '7d': return 'last 7 days';
      case '30d': return 'last 30 days';
      case '90d': return 'last 90 days';
      case 'custom': return 'selected period';
      default: return 'last 7 days';
    }
  };

  const markets = ['Forex', 'Crypto', 'Indices'];

  const getIntensityColor = (count: number) => {
    if (count === 0) return 'bg-gray-100 border border-gray-200';
    if (count <= 2) return 'bg-yellow-200 border border-yellow-300';
    if (count <= 5) return 'bg-orange-300 border border-orange-400';
    if (count <= 10) return 'bg-red-400 border border-red-500';
    return 'bg-red-600 border border-red-700';
  };

  const getTextColor = (count: number) => {
    if (count === 0) return 'text-gray-400';
    if (count <= 2) return 'text-yellow-800';
    if (count <= 5) return 'text-orange-800';
    return 'text-white';
  };

  const getTooltipText = (session: TradingSession, market: string, count: number) => {
    const eventText = count === 1 ? 'SL event' : 'SL events';
    return `${session.name} • ${market} • ${count} ${eventText} (${getPeriodLabel()})`;
  };

  const getSessionTotal = (session: TradingSession) => {
    return markets.reduce((total, market) => {
      return total + getSessionEvents(heatmapData, market, session);
    }, 0);
  };

  return (
    <TooltipProvider>
      <div className="space-y-4 overflow-hidden">
        {/* Updated title with dynamic period */}
        <div className="mb-4">
          <h3 className="text-base lg:text-lg font-semibold">Loss-Events Activity Map</h3>
          <p className="text-xs lg:text-sm text-muted-foreground">
            Distribution of stop-loss events across markets and time periods ({getPeriodLabel()})
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 lg:gap-4 text-xs lg:text-sm">
          <span className="font-medium text-gray-700 text-xs lg:text-sm">Loss Events Intensity:</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
            <span className="text-gray-600 text-xs">None (0)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-200 border border-yellow-300 rounded"></div>
            <span className="text-gray-600 text-xs">Low (1-2)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-300 border border-orange-400 rounded"></div>
            <span className="text-gray-600 text-xs">Medium (3-5)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-400 border border-red-500 rounded"></div>
            <span className="text-gray-600 text-xs">High (6-10)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-600 border border-red-700 rounded"></div>
            <span className="text-gray-600 text-xs">Critical (10+)</span>
          </div>
        </div>

        {/* Heatmap Grid - Responsive */}
        <div className="space-y-3">
          {/* Desktop Layout (md and up) */}
          <div className="hidden md:block overflow-x-auto">
            {/* Session Headers */}
            <div className="grid grid-cols-7 gap-2 min-w-[700px]">
              <div className="text-xs lg:text-sm font-medium text-gray-600">Market</div>
              {TRADING_SESSIONS.map(session => (
                <div key={session.name} className="text-center">
                  <div className="text-xs lg:text-sm font-medium text-gray-700">{session.label}</div>
                  <div className="text-xs text-gray-500">{session.utcRange} UTC</div>
                </div>
              ))}
              <div className="text-center">
                <div className="text-xs lg:text-sm font-medium text-gray-700">Σ Total</div>
                <div className="text-xs text-gray-500">All Sessions</div>
              </div>
            </div>

            {/* Market Rows */}
            {markets.map(market => {
              const marketTotal = TRADING_SESSIONS.reduce((total, session) => {
                return total + getSessionEvents(heatmapData, market, session);
              }, 0);

              return (
                <div key={market} className="grid grid-cols-7 gap-2 items-center min-w-[700px]">
                  <div className="text-xs lg:text-sm font-medium text-gray-700 py-2">
                    {market}
                  </div>
                  {TRADING_SESSIONS.map(session => {
                    const totalEvents = getSessionEvents(heatmapData, market, session);

                    return (
                      <Tooltip key={`${market}-${session.name}`}>
                        <TooltipTrigger asChild>
                          <div
                            className={`
                              h-12 lg:h-16 rounded-lg flex items-center justify-center 
                              cursor-pointer transition-all duration-200 
                              hover:scale-105 hover:shadow-md
                              ${getIntensityColor(totalEvents)}
                            `}
                            onClick={() => navigate(`/admin/breaches?market=${market}&session=${session.name}`)}
                          >
                            <div className="text-center">
                              <div className={`text-sm lg:text-lg font-bold ${getTextColor(totalEvents)}`}>
                                {totalEvents || '0'}
                              </div>
                              <div className={`text-xs ${getTextColor(totalEvents)}`}>
                                events
                              </div>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{getTooltipText(session, market, totalEvents)}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                  {/* Market Total Column */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`
                          h-12 lg:h-16 rounded-lg flex items-center justify-center 
                          border-2 border-gray-300 bg-gray-50
                          cursor-pointer transition-all duration-200 
                          hover:scale-105 hover:shadow-md
                        `}
                        onClick={() => navigate(`/admin/breaches?market=${market}`)}
                      >
                        <div className="text-center">
                          <div className="text-sm lg:text-lg font-bold text-gray-700">
                            {marketTotal || '0'}
                          </div>
                          <div className="text-xs text-gray-500">
                            total
                          </div>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{market} • {marketTotal} total events ({getPeriodLabel()})</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              );
            })}

            {/* Session Totals Row */}
            <div className="grid grid-cols-7 gap-2 items-center min-w-[700px] pt-2 border-t border-gray-200">
              <div className="text-xs lg:text-sm font-medium text-gray-700 py-2">
                Σ Total
              </div>
              {TRADING_SESSIONS.map(session => {
                const sessionTotal = getSessionTotal(session);
                return (
                  <Tooltip key={`total-${session.name}`}>
                    <TooltipTrigger asChild>
                      <div
                        className={`
                          h-12 lg:h-16 rounded-lg flex items-center justify-center 
                          border-2 border-gray-300 bg-gray-50
                          cursor-pointer transition-all duration-200 
                          hover:scale-105 hover:shadow-md
                        `}
                        onClick={() => navigate(`/admin/breaches?session=${session.name}`)}
                      >
                        <div className="text-center">
                          <div className="text-sm lg:text-lg font-bold text-gray-700">
                            {sessionTotal || '0'}
                          </div>
                          <div className="text-xs text-gray-500">
                            total
                          </div>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{session.name} • {sessionTotal} total events ({getPeriodLabel()})</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
              {/* Grand Total */}
              <div className="h-12 lg:h-16 rounded-lg flex items-center justify-center bg-blue-50 border-2 border-blue-200">
                <div className="text-center">
                  <div className="text-sm lg:text-lg font-bold text-blue-700">
                    {Object.values(heatmapData || {}).reduce((total, marketData) => {
                      return total + Object.values(marketData).reduce((sum, count) => sum + count, 0);
                    }, 0)}
                  </div>
                  <div className="text-xs text-blue-500">
                    grand
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Layout (sm and below) - Horizontal Scroll */}
          <div className="md:hidden">
            {/* Session Headers - Mobile */}
            <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory">
              <div className="flex-shrink-0 w-20 text-xs font-medium text-gray-600 snap-start">Market</div>
              {TRADING_SESSIONS.map(session => (
                <div key={session.name} className="flex-shrink-0 w-20 text-center snap-start">
                  <div className="text-xs font-medium text-gray-700">{session.label}</div>
                  <div className="text-xs text-gray-500">{session.utcRange}</div>
                </div>
              ))}
              <div className="flex-shrink-0 w-20 text-center snap-start">
                <div className="text-xs font-medium text-gray-700">Σ Total</div>
                <div className="text-xs text-gray-500">All</div>
              </div>
            </div>

            {/* Market Rows - Mobile */}
            {markets.map(market => {
              const marketTotal = TRADING_SESSIONS.reduce((total, session) => {
                return total + getSessionEvents(heatmapData, market, session);
              }, 0);

              return (
                <div key={market} className="flex gap-2 items-center overflow-x-auto snap-x snap-mandatory py-1">
                  <div className="flex-shrink-0 w-20 text-xs font-medium text-gray-700 snap-start">
                    {market}
                  </div>
                  {TRADING_SESSIONS.map(session => {
                    const totalEvents = getSessionEvents(heatmapData, market, session);

                    return (
                      <Tooltip key={`${market}-${session.name}`}>
                        <TooltipTrigger asChild>
                          <div
                            className={`
                              flex-shrink-0 w-20 h-12 rounded-lg flex items-center justify-center 
                              cursor-pointer transition-all duration-200 
                              hover:scale-105 hover:shadow-md snap-start
                              ${getIntensityColor(totalEvents)}
                            `}
                            onClick={() => navigate(`/admin/breaches?market=${market}&session=${session.name}`)}
                          >
                            <div className="text-center">
                              <div className={`text-sm font-bold ${getTextColor(totalEvents)}`}>
                                {totalEvents || '0'}
                              </div>
                              <div className={`text-xs ${getTextColor(totalEvents)}`}>
                                events
                              </div>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{getTooltipText(session, market, totalEvents)}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                  {/* Market Total - Mobile */}
                  <div className="flex-shrink-0 w-20 h-12 rounded-lg flex items-center justify-center border-2 border-gray-300 bg-gray-50 snap-start">
                    <div className="text-center">
                      <div className="text-sm font-bold text-gray-700">
                        {marketTotal || '0'}
                      </div>
                      <div className="text-xs text-gray-500">
                        total
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200">
          <div className="text-xs lg:text-sm text-gray-600">
            <span className="font-medium">Total Events:</span> {
              Object.values(heatmapData || {}).reduce((total, marketData) => {
                return total + Object.values(marketData).reduce((sum, count) => sum + count, 0);
              }, 0)
            }
          </div>
          <div className="text-xs lg:text-sm text-gray-600">
            <span className="font-medium">Most Active Session:</span> {
              (() => {
                let maxCount = 0;
                let maxSession = '';
                TRADING_SESSIONS.forEach(session => {
                  const sessionTotal = getSessionTotal(session);
                  if (sessionTotal > maxCount) {
                    maxCount = sessionTotal;
                    maxSession = session.label;
                  }
                });
                return maxSession || 'None';
              })()
            }
          </div>
          <div className="text-xs lg:text-sm text-gray-600">
            <span className="font-medium">Most Active Market:</span> {
              (() => {
                let maxCount = 0;
                let maxMarket = '';
                Object.entries(heatmapData || {}).forEach(([market, hours]) => {
                  const marketTotal = Object.values(hours).reduce((sum, count) => sum + count, 0);
                  if (marketTotal > maxCount) {
                    maxCount = marketTotal;
                    maxMarket = market;
                  }
                });
                return maxMarket || 'None';
              })()
            }
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default HeatmapChart;

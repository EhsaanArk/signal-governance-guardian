
import { supabase } from '@/integrations/supabase/client';
import { Market } from '@/types/database';
import { 
  ApiParams, 
  DashboardMetrics, 
  HeatmapData, 
  TopBreachedRule, 
  RecentBreach, 
  ExpiringCooldown,
  TradingSession
} from './types';
import { getComparePeriod, toISODateString } from '@/lib/utils/dateUtils';

const handleApiError = (error: any, operation: string) => {
  console.error(`❌ Error in ${operation}:`, error);
  throw error;
};

const logApiCall = (operation: string, params: any) => {
  console.log(`📊 ${operation} - API params:`, params);
};

export class DashboardService {
  static async fetchMetrics(params: ApiParams): Promise<DashboardMetrics> {
    logApiCall('fetchMetrics', params);

    const { startDate, endDate, providerId } = params;
    
    // Calculate comparison period
    const mainStart = new Date(startDate!);
    const mainEnd = new Date(endDate!);
    const { from: compareStart, to: compareEnd } = getComparePeriod(mainStart, mainEnd);

    try {
      // Active cooldowns query
      let cooldownQuery = supabase
        .from('active_cooldowns')
        .select('id')
        .eq('status', 'active');
      
      if (providerId) {
        cooldownQuery = cooldownQuery.eq('provider_id', providerId);
      }

      // Main period breaches
      let breachMainQuery = supabase
        .from('breach_events')
        .select('id')
        .gte('occurred_at', startDate!)
        .lte('occurred_at', endDate!);
      
      if (providerId) {
        breachMainQuery = breachMainQuery.eq('provider_id', providerId);
      }

      // Comparison period breaches
      let breachCompareQuery = supabase
        .from('breach_events')
        .select('id')
        .gte('occurred_at', toISODateString(compareStart))
        .lt('occurred_at', toISODateString(compareEnd));
      
      if (providerId) {
        breachCompareQuery = breachCompareQuery.eq('provider_id', providerId);
      }

      // Win rate calculation
      let statsQuery = supabase
        .from('provider_statistics')
        .select('profitable_closes, sl_count')
        .gte('updated_at', startDate!)
        .lte('updated_at', endDate!);
      
      if (providerId) {
        statsQuery = statsQuery.eq('provider_id', providerId);
      }

      const [cooldownResult, breachMainResult, breachCompareResult, statsResult] = await Promise.all([
        cooldownQuery,
        breachMainQuery,
        breachCompareQuery,
        statsQuery
      ]);

      if (cooldownResult.error) throw cooldownResult.error;
      if (breachMainResult.error) throw breachMainResult.error;
      if (breachCompareResult.error) throw breachCompareResult.error;
      if (statsResult.error) throw statsResult.error;

      const totalWins = statsResult.data?.reduce((sum, stat) => sum + stat.profitable_closes, 0) || 0;
      const totalLosses = statsResult.data?.reduce((sum, stat) => sum + stat.sl_count, 0) || 0;
      const winRate = totalWins + totalLosses > 0 ? Math.round((totalWins / (totalWins + totalLosses)) * 100) : 0;

      const mainBreachCount = breachMainResult.data?.length || 0;
      const compareBreachCount = breachCompareResult.data?.length || 0;
      const breachChange = compareBreachCount > 0 
        ? Math.round(((mainBreachCount - compareBreachCount) / compareBreachCount) * 100)
        : mainBreachCount > 0 ? 100 : 0;

      const metrics: DashboardMetrics = {
        activeCooldowns: cooldownResult.data?.length || 0,
        breaches: mainBreachCount,
        winRate,
        providersInReview: 3, // Mock data
        cooldownChange: 0,
        breachChange,
        winRateChange: 0,
        reviewChange: 0,
      };

      console.log('✅ Dashboard metrics fetched:', metrics);
      return metrics;
    } catch (error) {
      handleApiError(error, 'fetchMetrics');
      throw error;
    }
  }

  static async fetchHeatmapData(params: ApiParams): Promise<HeatmapData> {
    logApiCall('fetchHeatmapData', params);

    const { startDate, endDate, providerId } = params;

    try {
      let query = supabase
        .from('breach_events')
        .select('occurred_at, market, action_taken')
        .gte('occurred_at', startDate!)
        .lte('occurred_at', endDate!);

      if (providerId) {
        query = query.eq('provider_id', providerId);
      }

      const { data: breaches, error } = await query;
      if (error) throw error;

      // Initialize market data
      const markets: { [market: string]: { [hour: number]: number } } = {
        Forex: {},
        Crypto: {},
        Indices: {}
      };

      const totalsByMarket: { [market: string]: number } = {
        Forex: 0,
        Crypto: 0,
        Indices: 0
      };

      let grandTotal = 0;

      // Process breach data
      breaches?.forEach(breach => {
        const hour = new Date(breach.occurred_at).getUTCHours();
        const market = breach.market;
        
        if (!markets[market]) {
          markets[market] = {};
        }
        
        markets[market][hour] = (markets[market][hour] || 0) + 1;
        totalsByMarket[market] = (totalsByMarket[market] || 0) + 1;
        grandTotal += 1;
      });

      // Generate sessions from aggregated hourly data
      const allHourlyData: { [hour: number]: number } = {};
      Object.values(markets).forEach(marketData => {
        Object.entries(marketData).forEach(([hour, count]) => {
          const h = parseInt(hour);
          allHourlyData[h] = (allHourlyData[h] || 0) + count;
        });
      });

      const sessions = this.generateTradingSessions(allHourlyData);
      
      const totalsBySessions: { [sessionName: string]: number } = {};
      sessions.forEach(session => {
        totalsBySessions[session.name] = session.count;
      });

      console.log('✅ Heatmap data processed:', { grandTotal, sessionsCount: sessions.length });

      return {
        markets,
        sessions,
        totalsByMarket,
        totalsBySessions,
        grandTotal
      };
    } catch (error) {
      handleApiError(error, 'fetchHeatmapData');
      throw error;
    }
  }

  private static generateTradingSessions(hourlyData: { [hour: number]: number }): TradingSession[] {
    const activeHours = Object.keys(hourlyData).map(h => parseInt(h)).sort((a, b) => a - b);
    
    if (activeHours.length === 0) {
      return [{ name: 'No Activity', startHour: 0, endHour: 23, count: 0 }];
    }

    const sessions: TradingSession[] = [];
    let sessionStart = activeHours[0];
    let sessionEnd = activeHours[0];
    let sessionCount = hourlyData[activeHours[0]] || 0;
    
    for (let i = 1; i < activeHours.length; i++) {
      const currentHour = activeHours[i];
      const prevHour = activeHours[i - 1];
      
      if (currentHour - prevHour <= 2) {
        sessionEnd = currentHour;
        sessionCount += hourlyData[currentHour] || 0;
      } else {
        sessions.push({
          name: `Session ${sessions.length + 1}`,
          startHour: sessionStart,
          endHour: sessionEnd,
          count: sessionCount
        });
        
        sessionStart = currentHour;
        sessionEnd = currentHour;
        sessionCount = hourlyData[currentHour] || 0;
      }
    }
    
    sessions.push({
      name: `Session ${sessions.length + 1}`,
      startHour: sessionStart,
      endHour: sessionEnd,
      count: sessionCount
    });

    return sessions;
  }

  static async fetchTopBreachedRules(market: Market | 'All' = 'All', params: ApiParams): Promise<TopBreachedRule[]> {
    logApiCall('fetchTopBreachedRules', { market, ...params });

    const { startDate, endDate, providerId } = params;
    
    const mainStart = new Date(startDate!);
    const mainEnd = new Date(endDate!);
    const { from: compareStart, to: compareEnd } = getComparePeriod(mainStart, mainEnd);

    try {
      let currentQuery = supabase
        .from('breach_events')
        .select(`rule_set_id, rule_sets(name)`)
        .gte('occurred_at', startDate!)
        .lte('occurred_at', endDate!);

      let previousQuery = supabase
        .from('breach_events')
        .select(`rule_set_id, rule_sets(name)`)
        .gte('occurred_at', toISODateString(compareStart))
        .lt('occurred_at', toISODateString(compareEnd));

      if (market && market !== 'All') {
        currentQuery = currentQuery.eq('market', market);
        previousQuery = previousQuery.eq('market', market);
      }

      if (providerId) {
        currentQuery = currentQuery.eq('provider_id', providerId);
        previousQuery = previousQuery.eq('provider_id', providerId);
      }

      const [currentResult, previousResult] = await Promise.all([
        currentQuery,
        previousQuery
      ]);

      if (currentResult.error) throw currentResult.error;
      if (previousResult.error) throw previousResult.error;

      // Count breaches by rule set
      const currentCounts: { [key: string]: { name: string; count: number } } = {};
      currentResult.data?.forEach(breach => {
        const ruleSetId = breach.rule_set_id;
        const ruleName = (breach.rule_sets as any)?.name || 'Unknown Rule';
        
        if (!currentCounts[ruleSetId]) {
          currentCounts[ruleSetId] = { name: ruleName, count: 0 };
        }
        currentCounts[ruleSetId].count += 1;
      });

      const previousCounts: { [key: string]: number } = {};
      previousResult.data?.forEach(breach => {
        const ruleSetId = breach.rule_set_id;
        previousCounts[ruleSetId] = (previousCounts[ruleSetId] || 0) + 1;
      });

      const totalCurrentBreaches = Object.values(currentCounts).reduce((sum, { count }) => sum + count, 0);

      const topRules = Object.entries(currentCounts)
        .map(([ruleSetId, { name, count }]) => {
          const previousCount = previousCounts[ruleSetId] || 0;
          const percentage = totalCurrentBreaches > 0 ? Math.round((count / totalCurrentBreaches) * 100) : 0;
          
          let deltaPercentage = 0;
          let trendDirection: 'up' | 'down' | 'flat' = 'flat';
          
          if (previousCount > 0) {
            deltaPercentage = Math.round(((count - previousCount) / previousCount) * 100);
            if (deltaPercentage >= 10) {
              trendDirection = 'up';
            } else if (deltaPercentage <= -10) {
              trendDirection = 'down';
            }
          } else if (count > 0) {
            deltaPercentage = 100;
            trendDirection = 'up';
          }

          return {
            ruleSetId,
            name,
            count,
            percentage,
            previousCount,
            deltaPercentage,
            trendDirection
          };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      console.log('✅ Top breached rules fetched:', topRules.length);
      return topRules;
    } catch (error) {
      handleApiError(error, 'fetchTopBreachedRules');
      throw error;
    }
  }
}

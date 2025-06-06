import { supabase } from '@/integrations/supabase/client';
import { Market } from '@/types/database';

export interface DashboardMetrics {
  activeCooldowns: number;
  breaches: number;
  winRate: number;
  providersInReview: number;
  cooldownChange: number;
  breachChange: number;
  winRateChange: number;
  reviewChange: number;
  // Keep backwards compatibility
  breaches24h: number;
  winRate24h: number;
}

export interface TradingSession {
  name: string;
  startHour: number;
  endHour: number;
  count: number;
}

export interface HeatmapData {
  markets: {
    [market: string]: {
      [hour: number]: number;
    };
  };
  sessions: TradingSession[];
  totalsByMarket: { [market: string]: number };
  totalsBySessions: { [sessionName: string]: number };
  grandTotal: number;
}

export interface TopBreachedRule {
  ruleSetId: string;
  name: string;
  count: number;
  percentage: number;
  previousCount: number;
  deltaPercentage: number;
  trendDirection: 'up' | 'down' | 'flat';
}

export interface RecentBreach {
  id: string;
  occurred_at: string;
  providerName: string;
  market: Market;
  ruleName: string;
  action_taken: string;
}

export interface ExpiringCooldown {
  id: string;
  providerName: string;
  market: Market;
  expires_at: string;
}

const generateTradingSessions = (hourlyData: { [hour: number]: number }): TradingSession[] => {
  const sessions: TradingSession[] = [];
  const activeHours = Object.keys(hourlyData).map(h => parseInt(h)).sort((a, b) => a - b);
  
  if (activeHours.length === 0) {
    // Return default sessions if no data
    return [
      { name: 'No Activity', startHour: 0, endHour: 23, count: 0 }
    ];
  }

  // Group consecutive hours into sessions
  let sessionStart = activeHours[0];
  let sessionEnd = activeHours[0];
  let sessionCount = hourlyData[activeHours[0]] || 0;
  
  for (let i = 1; i < activeHours.length; i++) {
    const currentHour = activeHours[i];
    const prevHour = activeHours[i - 1];
    
    // If hours are consecutive (within 2 hours), extend the session
    if (currentHour - prevHour <= 2) {
      sessionEnd = currentHour;
      sessionCount += hourlyData[currentHour] || 0;
    } else {
      // Create a session for the previous group
      sessions.push({
        name: `Session ${sessions.length + 1}`,
        startHour: sessionStart,
        endHour: sessionEnd,
        count: sessionCount
      });
      
      // Start a new session
      sessionStart = currentHour;
      sessionEnd = currentHour;
      sessionCount = hourlyData[currentHour] || 0;
    }
  }
  
  // Add the final session
  sessions.push({
    name: `Session ${sessions.length + 1}`,
    startHour: sessionStart,
    endHour: sessionEnd,
    count: sessionCount
  });

  return sessions;
};

export async function fetchDashboardMetrics(startDate?: string, endDate?: string, providerId?: string): Promise<DashboardMetrics> {
  console.log('📊 Fetching dashboard metrics...', { startDate, endDate, providerId });

  // Default to last 24h if no dates provided
  const now = new Date();
  const defaultEnd = endDate || now.toISOString();
  const defaultStart = startDate || new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  
  // Calculate comparison period (same duration preceding the main period)
  const mainDuration = new Date(defaultEnd).getTime() - new Date(defaultStart).getTime();
  const compareEnd = defaultStart;
  const compareStart = new Date(new Date(defaultStart).getTime() - mainDuration).toISOString();

  try {
    // Active cooldowns (current, optionally filtered by provider)
    let cooldownQuery = supabase
      .from('active_cooldowns')
      .select('id')
      .eq('status', 'active');
    
    if (providerId) {
      cooldownQuery = cooldownQuery.eq('provider_id', providerId);
    }

    const { data: cooldowns, error: cooldownError } = await cooldownQuery;
    if (cooldownError) throw cooldownError;

    // Main period breaches
    let breachMainQuery = supabase
      .from('breach_events')
      .select('id')
      .gte('occurred_at', defaultStart)
      .lte('occurred_at', defaultEnd);
    
    if (providerId) {
      breachMainQuery = breachMainQuery.eq('provider_id', providerId);
    }

    const { data: breachesMain, error: breachMainError } = await breachMainQuery;
    if (breachMainError) throw breachMainError;

    // Comparison period breaches
    let breachCompareQuery = supabase
      .from('breach_events')
      .select('id')
      .gte('occurred_at', compareStart)
      .lt('occurred_at', compareEnd);
    
    if (providerId) {
      breachCompareQuery = breachCompareQuery.eq('provider_id', providerId);
    }

    const { data: breachesCompare, error: breachCompareError } = await breachCompareQuery;
    if (breachCompareError) throw breachCompareError;

    // Win rate calculation from provider statistics
    let statsQuery = supabase
      .from('provider_statistics')
      .select('profitable_closes, sl_count')
      .gte('updated_at', defaultStart)
      .lte('updated_at', defaultEnd);
    
    if (providerId) {
      statsQuery = statsQuery.eq('provider_id', providerId);
    }

    const { data: stats, error: statsError } = await statsQuery;
    if (statsError) throw statsError;

    const totalWins = stats?.reduce((sum, stat) => sum + stat.profitable_closes, 0) || 0;
    const totalLosses = stats?.reduce((sum, stat) => sum + stat.sl_count, 0) || 0;
    const winRate = totalWins + totalLosses > 0 ? Math.round((totalWins / (totalWins + totalLosses)) * 100) : 0;

    // Calculate changes
    const mainBreachCount = breachesMain?.length || 0;
    const compareBreachCount = breachesCompare?.length || 0;
    const breachChange = compareBreachCount > 0 
      ? Math.round(((mainBreachCount - compareBreachCount) / compareBreachCount) * 100)
      : mainBreachCount > 0 ? 100 : 0;

    const providersInReview = 3; // Mock data

    console.log('✅ Dashboard metrics fetched:', {
      activeCooldowns: cooldowns?.length || 0,
      breaches: mainBreachCount,
      winRate,
      providersInReview,
      breachChange,
      providerId
    });

    return {
      activeCooldowns: cooldowns?.length || 0,
      breaches: mainBreachCount,
      winRate: winRate,
      providersInReview,
      cooldownChange: 0, // Would need historical cooldown data
      breachChange,
      winRateChange: 0, // Would need historical win rate data
      reviewChange: 0, // Would need historical review data
      // Keep backwards compatibility
      breaches24h: mainBreachCount,
      winRate24h: winRate,
    };
  } catch (error) {
    console.error('❌ Error fetching dashboard metrics:', error);
    throw error;
  }
}

export async function fetchHeatmapData(startDate?: string, endDate?: string, providerId?: string): Promise<HeatmapData> {
  console.log('📈 Fetching heatmap data...', { startDate, endDate, providerId });

  const defaultEnd = endDate || new Date().toISOString();
  const defaultStart = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  try {
    let query = supabase
      .from('breach_events')
      .select('occurred_at, market, action_taken')
      .gte('occurred_at', defaultStart)
      .lte('occurred_at', defaultEnd);

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

    const sessions = generateTradingSessions(allHourlyData);
    
    // Calculate totals by session
    const totalsBySessions: { [sessionName: string]: number } = {};
    sessions.forEach(session => {
      totalsBySessions[session.name] = session.count;
    });

    console.log('✅ Heatmap data processed with dynamic sessions:', {
      marketsCount: Object.keys(markets).length,
      sessionsCount: sessions.length,
      grandTotal
    });

    return {
      markets,
      sessions,
      totalsByMarket,
      totalsBySessions,
      grandTotal
    };
  } catch (error) {
    console.error('❌ Error fetching heatmap data:', error);
    throw error;
  }
}

export async function fetchTopBreachedRules(market?: Market | 'All', startDate?: string, endDate?: string, providerId?: string): Promise<TopBreachedRule[]> {
  console.log('📊 Fetching top breached rules...', { market, startDate, endDate, providerId });

  const now = new Date();
  const defaultEnd = endDate || now.toISOString();
  const defaultStart = startDate || new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  
  // Enhanced debug logging for date ranges
  console.log('📅 Date range processing:', {
    provided: { startDate, endDate },
    resolved: { defaultStart, defaultEnd },
    duration: Math.round((new Date(defaultEnd).getTime() - new Date(defaultStart).getTime()) / (1000 * 60 * 60 * 24)) + ' days'
  });
  
  // Calculate comparison period
  const mainDuration = new Date(defaultEnd).getTime() - new Date(defaultStart).getTime();
  const compareEnd = defaultStart;
  const compareStart = new Date(new Date(defaultStart).getTime() - mainDuration).toISOString();

  console.log('📊 Comparison period:', {
    compareStart,
    compareEnd,
    duration: Math.round(mainDuration / (1000 * 60 * 60 * 24)) + ' days'
  });

  try {
    // Current period breaches query
    let currentQuery = supabase
      .from('breach_events')
      .select(`
        rule_set_id,
        rule_sets(name)
      `)
      .gte('occurred_at', defaultStart)
      .lte('occurred_at', defaultEnd);

    // Previous period breaches query
    let previousQuery = supabase
      .from('breach_events')
      .select(`
        rule_set_id,
        rule_sets(name)
      `)
      .gte('occurred_at', compareStart)
      .lt('occurred_at', compareEnd);

    // Apply market filter if specified
    if (market && market !== 'All') {
      console.log('🎯 Applying market filter:', market);
      currentQuery = currentQuery.eq('market', market);
      previousQuery = previousQuery.eq('market', market);
    }

    // Apply provider filter if specified
    if (providerId) {
      console.log('👤 Applying provider filter:', providerId);
      currentQuery = currentQuery.eq('provider_id', providerId);
      previousQuery = previousQuery.eq('provider_id', providerId);
    }

    const [currentResult, previousResult] = await Promise.all([
      currentQuery,
      previousQuery
    ]);

    if (currentResult.error) throw currentResult.error;
    if (previousResult.error) throw previousResult.error;

    console.log('📈 Raw breach results:', {
      currentCount: currentResult.data?.length || 0,
      previousCount: previousResult.data?.length || 0,
      currentSample: currentResult.data?.slice(0, 3) || [],
      previousSample: previousResult.data?.slice(0, 3) || []
    });

    // Count current breaches by rule set
    const currentCounts: { [key: string]: { name: string; count: number } } = {};
    currentResult.data?.forEach(breach => {
      const ruleSetId = breach.rule_set_id;
      const ruleName = (breach.rule_sets as any)?.name || 'Unknown Rule';
      
      if (!currentCounts[ruleSetId]) {
        currentCounts[ruleSetId] = { name: ruleName, count: 0 };
      }
      currentCounts[ruleSetId].count += 1;
    });

    // Count previous breaches by rule set
    const previousCounts: { [key: string]: number } = {};
    previousResult.data?.forEach(breach => {
      const ruleSetId = breach.rule_set_id;
      previousCounts[ruleSetId] = (previousCounts[ruleSetId] || 0) + 1;
    });

    console.log('📊 Breach counts by rule set:', {
      current: currentCounts,
      previous: previousCounts,
      uniqueRuleSets: Object.keys(currentCounts).length
    });

    // Calculate total current breaches for percentages
    const totalCurrentBreaches = Object.values(currentCounts).reduce((sum, { count }) => sum + count, 0);

    // Convert to array and calculate trends
    const topRules = Object.entries(currentCounts)
      .map(([ruleSetId, { name, count }]) => {
        const previousCount = previousCounts[ruleSetId] || 0;
        const percentage = totalCurrentBreaches > 0 ? Math.round((count / totalCurrentBreaches) * 100) : 0;
        
        // Calculate trend
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
          // New rule that didn't have breaches before
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

    console.log('✅ Top breached rules result:', {
      totalRules: topRules.length,
      totalBreaches: totalCurrentBreaches,
      rules: topRules.map(r => ({ name: r.name, count: r.count, percentage: r.percentage }))
    });
    
    return topRules;
  } catch (error) {
    console.error('❌ Error fetching top breached rules:', error);
    throw error;
  }
}

export async function fetchRecentBreaches(limit: number = 10, startDate?: string, endDate?: string, providerId?: string): Promise<RecentBreach[]> {
  console.log('📋 Fetching recent breaches...', { limit, startDate, endDate, providerId });

  try {
    let query = supabase
      .from('breach_events')
      .select(`
        id,
        occurred_at,
        market,
        action_taken,
        signal_providers(provider_name),
        rule_sets(name)
      `)
      .order('occurred_at', { ascending: false })
      .limit(limit);

    if (startDate) {
      query = query.gte('occurred_at', startDate);
    }
    if (endDate) {
      query = query.lte('occurred_at', endDate);
    }
    if (providerId) {
      query = query.eq('provider_id', providerId);
    }

    const { data: breaches, error } = await query;
    if (error) throw error;

    const recentBreaches: RecentBreach[] = breaches?.map(breach => ({
      id: breach.id,
      occurred_at: breach.occurred_at,
      providerName: (breach.signal_providers as any)?.provider_name || 'Unknown',
      market: breach.market,
      ruleName: (breach.rule_sets as any)?.name || 'Unknown Rule',
      action_taken: breach.action_taken
    })) || [];

    console.log('✅ Recent breaches fetched:', recentBreaches.length);
    return recentBreaches;
  } catch (error) {
    console.error('❌ Error fetching recent breaches:', error);
    throw error;
  }
}

export async function fetchExpiringCooldowns(limit: number = 10, providerId?: string): Promise<ExpiringCooldown[]> {
  console.log('⏰ Fetching expiring cooldowns...', { limit, providerId });

  try {
    let query = supabase
      .from('active_cooldowns')
      .select(`
        id,
        market,
        expires_at,
        signal_providers(provider_name)
      `)
      .eq('status', 'active')
      .order('expires_at', { ascending: true })
      .limit(limit);

    if (providerId) {
      query = query.eq('provider_id', providerId);
    }

    const { data: cooldowns, error } = await query;
    if (error) throw error;

    const expiringCooldowns: ExpiringCooldown[] = cooldowns?.map(cooldown => ({
      id: cooldown.id,
      providerName: (cooldown.signal_providers as any)?.provider_name || 'Unknown',
      market: cooldown.market,
      expires_at: cooldown.expires_at
    })) || [];

    console.log('✅ Expiring cooldowns fetched:', expiringCooldowns.length);
    return expiringCooldowns;
  } catch (error) {
    console.error('❌ Error fetching expiring cooldowns:', error);
    throw error;
  }
}

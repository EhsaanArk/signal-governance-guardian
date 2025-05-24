
export interface TradingSession {
  name: string;
  label: string;
  startHour: number;
  endHour: number;
  utcRange: string;
}

export const TRADING_SESSIONS: TradingSession[] = [
  {
    name: 'Sydney',
    label: 'Sydney',
    startHour: 21,
    endHour: 24, // 00:00 next day
    utcRange: '21:00–00:00',
  },
  {
    name: 'Tokyo',
    label: 'Tokyo',
    startHour: 0,
    endHour: 6,
    utcRange: '00:00–06:00',
  },
  {
    name: 'London',
    label: 'London',
    startHour: 6,
    endHour: 12,
    utcRange: '06:00–12:00',
  },
  {
    name: 'New York',
    label: 'New York',
    startHour: 12,
    endHour: 17,
    utcRange: '12:00–17:00',
  },
  {
    name: 'After-hours',
    label: 'After-hours',
    startHour: 17,
    endHour: 21,
    utcRange: '17:00–21:00',
  },
];

export const getSessionForHour = (hour: number): TradingSession => {
  // Handle Sydney session spanning midnight
  if (hour >= 21 || hour === 23) {
    return TRADING_SESSIONS[0]; // Sydney
  }
  
  // Find the session that contains this hour
  for (const session of TRADING_SESSIONS) {
    if (session.name === 'Sydney') continue; // Already handled above
    
    if (hour >= session.startHour && hour < session.endHour) {
      return session;
    }
  }
  
  // Default fallback (should not happen with proper configuration)
  return TRADING_SESSIONS[4]; // After-hours
};

export const getSessionEvents = (
  heatmapData: any,
  market: string,
  session: TradingSession
): number => {
  if (!heatmapData?.[market]) return 0;
  
  let totalEvents = 0;
  
  // Handle Sydney session spanning midnight
  if (session.name === 'Sydney') {
    // Count hours 21, 22, 23
    for (let hour = 21; hour <= 23; hour++) {
      totalEvents += heatmapData[market][hour] || 0;
    }
    // Count hour 0 (next day)
    totalEvents += heatmapData[market][0] || 0;
  } else {
    // Regular session within same day
    for (let hour = session.startHour; hour < session.endHour; hour++) {
      totalEvents += heatmapData[market][hour] || 0;
    }
  }
  
  return totalEvents;
};

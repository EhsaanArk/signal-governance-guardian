
export const TRADING_SESSIONS = [
  { name: 'Sydney', startHour: 21, endHour: 0 },
  { name: 'Tokyo', startHour: 0, endHour: 6 },
  { name: 'London', startHour: 6, endHour: 12 },
  { name: 'New York', startHour: 12, endHour: 17 },
  { name: 'After-hours', startHour: 17, endHour: 21 }
];

export const getEventCount = (
  markets: { [market: string]: { [hour: number]: number } },
  market: string,
  session: { startHour: number; endHour: number }
) => {
  const marketData = markets[market] || {};
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

export const getIntensityClass = (count: number) => {
  if (count === 0) return 'bg-gray-100';
  if (count <= 2) return 'bg-yellow-200'; // Low (1-2)
  if (count <= 5) return 'bg-orange-300'; // Medium (3-5)
  if (count <= 10) return 'bg-red-400'; // High (6-10)
  return 'bg-red-600'; // Critical (10+)
};

export const formatSessionTime = (session: { startHour: number; endHour: number }) => {
  const formatHour = (hour: number) => `${hour.toString().padStart(2, '0')}:00`;
  return `${formatHour(session.startHour)}–${formatHour(session.endHour)} UTC`;
};

export const getTotalForMarket = (
  totalsByMarket: { [market: string]: number },
  market: string
) => {
  return totalsByMarket[market] || 0;
};

export const getTotalForSession = (
  markets: { [market: string]: { [hour: number]: number } },
  marketNames: string[],
  session: { startHour: number; endHour: number }
) => {
  let total = 0;
  marketNames.forEach(market => {
    total += getEventCount(markets, market, session);
  });
  return total;
};

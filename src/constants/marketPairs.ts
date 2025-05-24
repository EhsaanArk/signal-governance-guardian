
export const FOREX_PAIRS = [
  // Major Pairs
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD',
  // Cross Pairs
  'EUR/GBP', 'EUR/JPY', 'EUR/CHF', 'EUR/AUD', 'EUR/CAD', 'EUR/NZD',
  'GBP/JPY', 'GBP/CHF', 'GBP/AUD', 'GBP/CAD', 'GBP/NZD',
  'AUD/JPY', 'AUD/CHF', 'AUD/CAD', 'AUD/NZD',
  'CAD/JPY', 'CAD/CHF', 'NZD/JPY', 'NZD/CHF', 'CHF/JPY'
];

export const CRYPTO_PAIRS = [
  'BTC/USD', 'ETH/USD', 'BNB/USD', 'XRP/USD', 'ADA/USD', 'SOL/USD', 'DOGE/USD',
  'DOT/USD', 'MATIC/USD', 'LTC/USD', 'SHIB/USD', 'TRX/USD', 'AVAX/USD', 'UNI/USD',
  'LINK/USD', 'ATOM/USD', 'XMR/USD', 'ETC/USD', 'BCH/USD', 'FIL/USD', 'APT/USD',
  'NEAR/USD', 'VET/USD', 'ICP/USD', 'ALGO/USD'
];

export const INDICES_PAIRS = [
  'SPX500', 'NAS100', 'DJI30', 'RUS2000', 'VIX',
  'DAX40', 'FTSE100', 'CAC40', 'IBEX35', 'SMI20',
  'NIKKEI225', 'TOPIX', 'ASX200', 'HSI50', 'CSI300'
];

export const getMarketPairs = (market: 'Forex' | 'Crypto' | 'Indices') => {
  switch (market) {
    case 'Forex':
      return FOREX_PAIRS;
    case 'Crypto':
      return CRYPTO_PAIRS;
    case 'Indices':
      return INDICES_PAIRS;
    default:
      return [];
  }
};

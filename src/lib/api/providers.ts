
import { supabase } from '@/integrations/supabase/client';
import { Provider } from '@/types/provider';
import { ProvidersFilters } from '@/hooks/useProvidersFilters';

export const fetchProviders = async (filters: ProvidersFilters): Promise<Provider[]> => {
  console.log('Fetching providers with filters:', filters);
  
  let query = supabase
    .from('signal_providers')
    .select('*');

  // Apply search filter
  if (filters.search) {
    query = query.ilike('provider_name', `%${filters.search}%`);
  }

  // Apply status filter
  if (filters.status !== 'All') {
    const isActive = filters.status === 'Active';
    query = query.eq('is_active', isActive);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching providers:', error);
    throw error;
  }

  // Transform the data and add mock data for display
  const providers: Provider[] = (data || []).map(provider => {
    // Mock data for demonstration - in real implementation, this would come from SFX API
    const mockMarkets = ['Forex', 'Crypto'][Math.floor(Math.random() * 2)] as any;
    const mockFollowers = Math.floor(Math.random() * 10000) + 100;
    const mockPnL = (Math.random() - 0.5) * 10; // -5% to +5%
    const mockDrawdown = Math.random() * 3; // 0% to 3%
    const mockBreaches = Math.floor(Math.random() * 10);
    
    return {
      id: provider.id,
      provider_name: provider.provider_name,
      email: provider.email,
      is_active: provider.is_active,
      created_at: provider.created_at,
      updated_at: provider.updated_at,
      metadata: provider.metadata,
      // Mock data
      markets: [mockMarkets],
      followers: mockFollowers,
      pnl30d: mockPnL,
      drawdown: mockDrawdown,
      breaches: mockBreaches,
      status: provider.is_active ? 'Active' : 'Suspended'
    };
  });

  // Apply client-side filters for mock data
  let filteredProviders = providers;

  // Apply market filter
  if (filters.market !== 'All') {
    filteredProviders = filteredProviders.filter(provider => 
      provider.markets.includes(filters.market as any)
    );
  }

  // Apply performance filter
  if (filters.performance !== 'All') {
    filteredProviders = filteredProviders.filter(provider => {
      const pnl = provider.pnl30d || 0;
      switch (filters.performance) {
        case 'Top':
          return pnl >= 2;
        case 'Neutral':
          return pnl > -2 && pnl < 2;
        case 'Under-perform':
          return pnl <= -2;
        default:
          return true;
      }
    });
  }

  console.log(`Fetched ${filteredProviders.length} providers`);
  return filteredProviders;
};

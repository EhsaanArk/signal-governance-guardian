
import { BreachEventFilters, RawBreachEvent } from '@/types/breach';

export class BreachFilters {
  static applyDateRangeFilter(breaches: RawBreachEvent[], dateRange: BreachEventFilters['dateRange']): RawBreachEvent[] {
    if (!dateRange?.from && !dateRange?.to) {
      return breaches;
    }

    const beforeDateFilter = breaches.length;
    const filtered = breaches.filter(breach => {
      const breachDate = new Date(breach.occurred_at);
      const fromMatch = !dateRange?.from || breachDate >= dateRange.from;
      const toMatch = !dateRange?.to || breachDate <= new Date(dateRange.to.getTime() + 24 * 60 * 60 * 1000);
      return fromMatch && toMatch;
    });
    
    console.log(`Date filter: ${beforeDateFilter} -> ${filtered.length} events`);
    return filtered;
  }

  static applyMarketFilter(breaches: RawBreachEvent[], selectedMarket: BreachEventFilters['selectedMarket']): RawBreachEvent[] {
    if (selectedMarket === 'All') {
      return breaches;
    }

    const beforeMarketFilter = breaches.length;
    const filtered = breaches.filter(breach => breach.market === selectedMarket);
    console.log(`Market filter (${selectedMarket}): ${beforeMarketFilter} -> ${filtered.length} events`);
    return filtered;
  }

  static applyRuleSetFilter(breaches: RawBreachEvent[], selectedRuleSet: string): RawBreachEvent[] {
    if (selectedRuleSet === 'all') {
      return breaches;
    }

    const beforeRuleSetFilter = breaches.length;
    const filtered = breaches.filter(breach => breach.rule_set_id === selectedRuleSet);
    console.log(`Rule set filter (${selectedRuleSet}): ${beforeRuleSetFilter} -> ${filtered.length} events`);
    return filtered;
  }

  static applyProviderSearchFilter(transformedBreaches: any[], providerSearch: string): any[] {
    if (!providerSearch.trim()) {
      return transformedBreaches;
    }

    const beforeProviderSearch = transformedBreaches.length;
    const searchTerm = providerSearch.toLowerCase();
    const filtered = transformedBreaches.filter(breach =>
      breach.provider.toLowerCase().includes(searchTerm)
    );
    console.log(`Provider search filter "${providerSearch}": ${beforeProviderSearch} -> ${filtered.length} results`);
    return filtered;
  }
}

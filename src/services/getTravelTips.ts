export type TravelStyle = 'budget traveler' | 'luxury' | 'solo';

export type TravelTipsResponse = {
  bestTimeToVisit: string;
  localEtiquette: string;
  safetyTips: string;
  budgetTips: string;
  mustKnowPhrases: string[];
  packingSuggestions: string[];
  style: TravelStyle;
};

const mockFallback = (place: string, style: TravelStyle): TravelTipsResponse => ({
  bestTimeToVisit: `${place} is best enjoyed during shoulder season, when temperatures are comfortable and prices are more balanced.`,
  localEtiquette: `Respect local customs, greet people politely, and follow dress or behavior norms in sensitive areas.`,
  safetyTips: `Keep your belongings secure, be aware of your surroundings, and use trusted transport or guided experiences when needed.`,
  budgetTips: `Choose local food spots, public transit, and affordable neighborhoods to keep costs down while still enjoying the destination.`,
  mustKnowPhrases: ['Hello', 'Thank you', 'How much?', 'Excuse me'],
  packingSuggestions: ['Light clothing', 'Comfortable shoes', 'Portable charger', 'Reusable water bottle'],
  style,
});

export async function getTravelTips(place: string, style: TravelStyle = 'budget traveler'): Promise<TravelTipsResponse> {
  try {
    const response = await fetch('/api/travel-tips', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ place, style }),
    });

    if (!response.ok) {
      throw new Error('Unable to fetch travel tips');
    }

    const data = await response.json();
    if (data && typeof data === 'object') {
      return {
        bestTimeToVisit: String(data.bestTimeToVisit ?? mockFallback(place, style).bestTimeToVisit),
        localEtiquette: String(data.localEtiquette ?? mockFallback(place, style).localEtiquette),
        safetyTips: String(data.safetyTips ?? mockFallback(place, style).safetyTips),
        budgetTips: String(data.budgetTips ?? mockFallback(place, style).budgetTips),
        mustKnowPhrases: Array.isArray(data.mustKnowPhrases)
          ? data.mustKnowPhrases.filter((item: unknown): item is string => typeof item === 'string')
          : mockFallback(place, style).mustKnowPhrases,
        packingSuggestions: Array.isArray(data.packingSuggestions)
          ? data.packingSuggestions.filter((item: unknown): item is string => typeof item === 'string')
          : mockFallback(place, style).packingSuggestions,
        style: data.style === 'luxury' || data.style === 'solo' || data.style === 'budget traveler'
          ? data.style
          : style,
      };
    }

    return mockFallback(place, style);
  } catch (error) {
    console.error('getTravelTips failed:', error);
    return mockFallback(place, style);
  }
}

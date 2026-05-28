import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { cleanAIJsonMessage, tryParseSafeJson } from '@/utils/safeJson';

const apiKey = process.env.GEMINI_API_KEY;
const aiClient = apiKey ? new GoogleGenerativeAI(apiKey) : null;

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

function mockTravelTips(place: string, style: TravelStyle): TravelTipsResponse {
  const placeLabel = place.trim() || 'your destination';

  const styleProfile: Record<TravelStyle, { budgetTips: string; packingSuggestions: string[]; safetyTips: string; localEtiquette: string; bestTimeToVisit: string; mustKnowPhrases: string[] }> = {
    'budget traveler': {
      bestTimeToVisit: `${placeLabel} is usually most affordable in the shoulder season, when crowds are lower and prices are more comfortable for budget stays.`,
      localEtiquette: `Respect local customs by greeting people politely, asking before taking photos, and following dress norms in religious or cultural sites.`,
      safetyTips: `Keep valuables secure, stay aware of local transport habits, and avoid isolated areas after dark.`,
      budgetTips: `Use local markets, public transit, and inexpensive neighborhoods for meals and lodging to stretch your budget further.`,
      mustKnowPhrases: ['Hello', 'Thank you', 'How much is this?', 'Where is the bathroom?'],
      packingSuggestions: ['Light layers', 'Comfortable walking shoes', 'Reusable water bottle', 'Universal adapter'],
    },
    luxury: {
      bestTimeToVisit: `${placeLabel} offers excellent luxury experiences during peak season, especially when weather is ideal for resorts, dining, and curated tours.`,
      localEtiquette: `Book premium guided experiences in advance, dress appropriately at upscale venues, and maintain a respectful tone in local interactions.`,
      safetyTips: `Use trusted transfers, keep emergency contacts ready, and confirm reservations and transport details before major excursions.`,
      budgetTips: `Focus on private transfers, boutique stays, high-end dining, and curated cultural experiences to maximize comfort and convenience.`,
      mustKnowPhrases: ['Good morning', 'Please', 'Excuse me', 'The bill, please'],
      packingSuggestions: ['Dressy outfits', 'Sun protection', 'Comfortable evening wear', 'Portable charger'],
    },
    solo: {
      bestTimeToVisit: `${placeLabel} is ideal for solo exploration during calmer months, when you can enjoy easier navigation, social spaces, and flexible movement.`,
      localEtiquette: `Be friendly but respectful, keep personal boundaries, and use local cues when joining groups or meeting new people.`,
      safetyTips: `Share your route with a friend, stay in well-lit areas, and trust local advice when planning day trips.`,
      budgetTips: `Stay in central areas, take group tours, and use flexible days to balance comfort and savings.`,
      mustKnowPhrases: ['I am alone', 'Can you help me?', 'Where is the train station?', 'Thank you very much'],
      packingSuggestions: ['Small daypack', 'Phone charger', 'Travel towel', 'Basic first aid kit'],
    },
  };

  const profile = styleProfile[style];

  return {
    bestTimeToVisit: profile.bestTimeToVisit,
    localEtiquette: profile.localEtiquette,
    safetyTips: profile.safetyTips,
    budgetTips: profile.budgetTips,
    mustKnowPhrases: profile.mustKnowPhrases,
    packingSuggestions: profile.packingSuggestions,
    style,
  };
}

function getAiResponseText(response: unknown): string {
  if (!response || typeof response !== 'object') {
    return '';
  }

  const anyResponse = response as Record<string, unknown>;

  if (typeof anyResponse.text === 'function') {
    const text = String((anyResponse.text as () => unknown)() ?? '').trim();
    if (text) {
      return text;
    }
  }

  const candidates = Array.isArray(anyResponse.candidates)
    ? anyResponse.candidates
    : [];
  const candidate = candidates[0] as Record<string, unknown> | undefined;
  const content = candidate?.content as { parts?: Array<Record<string, unknown>> } | undefined;

  if (Array.isArray(content?.parts)) {
    return content.parts
      .map((part) => {
        if (!part || typeof part !== 'object') {
          return '';
        }

        const partText = part.text;
        return typeof partText === 'string' ? partText : '';
      })
      .join('')
      .trim();
  }

  return '';
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const place = typeof body?.place === 'string' ? body.place.trim() : '';
    const style = (body?.style === 'luxury' || body?.style === 'solo' || body?.style === 'budget traveler')
      ? body.style
      : 'budget traveler';

    if (!place) {
      return NextResponse.json({ error: 'No place provided' }, { status: 400 });
    }

    if (!aiClient) {
      return NextResponse.json(mockTravelTips(place, style));
    }

    const model = aiClient.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a travel expert. Return valid JSON only. Provide structured travel tips for ${place} tailored to ${style}. Include these keys exactly: bestTimeToVisit, localEtiquette, safetyTips, budgetTips, mustKnowPhrases (array of 4 short phrases), packingSuggestions (array of 4 items), style.

Use concise but practical advice. Do not include markdown or extra explanation.`;

    const completion = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
        maxOutputTokens: 900,
      },
    });

    const rawMessage = getAiResponseText(completion?.response);

    if (!rawMessage) {
      return NextResponse.json(mockTravelTips(place, style));
    }

    const cleaned = cleanAIJsonMessage(rawMessage);
    const parsed = tryParseSafeJson<Partial<TravelTipsResponse>>(cleaned);

    if (!parsed) {
      return NextResponse.json(mockTravelTips(place, style));
    }

    const normalized: TravelTipsResponse = {
      bestTimeToVisit: typeof parsed.bestTimeToVisit === 'string' ? parsed.bestTimeToVisit : mockTravelTips(place, style).bestTimeToVisit,
      localEtiquette: typeof parsed.localEtiquette === 'string' ? parsed.localEtiquette : mockTravelTips(place, style).localEtiquette,
      safetyTips: typeof parsed.safetyTips === 'string' ? parsed.safetyTips : mockTravelTips(place, style).safetyTips,
      budgetTips: typeof parsed.budgetTips === 'string' ? parsed.budgetTips : mockTravelTips(place, style).budgetTips,
      mustKnowPhrases: Array.isArray(parsed.mustKnowPhrases)
        ? parsed.mustKnowPhrases.filter((item): item is string => typeof item === 'string')
        : mockTravelTips(place, style).mustKnowPhrases,
      packingSuggestions: Array.isArray(parsed.packingSuggestions)
        ? parsed.packingSuggestions.filter((item): item is string => typeof item === 'string')
        : mockTravelTips(place, style).packingSuggestions,
      style,
    };

    return NextResponse.json(normalized);
  } catch (error) {
    console.error('Travel tips API error:', error);
    return NextResponse.json({ error: 'Failed to generate travel tips' }, { status: 500 });
  }
}

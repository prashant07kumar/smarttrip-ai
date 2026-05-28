'use client';
import { useState } from 'react';
import { ItineraryItem } from '@/types/itineraryItem';
import { getAIPrompt } from '@/utils/getAiPrompt';
import { cleanAIJsonMessage, tryParseSafeJson } from '@/utils/safeJson';

export default function useTravelForm(destination: string) {
  const [form, setForm] = useState({
    travelerType: '',
    budget: '',
    days: 0,
    season: '',
    interests: [] as string[],
  });

  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<ItineraryItem[] | null>(null);

  const goNext = () => setStepIndex((prev) => Math.min(prev + 1, 5));
  const goBack = () => setStepIndex((prev) => Math.max(prev - 1, 0));

  const handleSelect = (key: string, value: string) => {
  setForm((prev) => ({
      ...prev,
      [key]: key === 'days' ? Number(value) : value,
    }));
  };

  const toggleInterest = (interest: string) => {
    setForm((prev) => {
      const updated = prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests: updated };
    });
  };

  const isStepValid = () => {
    if (stepIndex === 0) return !!form.travelerType;
    if (stepIndex === 1) return !!form.budget;
    if (stepIndex === 2) return form.days > 0;
    if (stepIndex === 3) return !!form.season;
    if (stepIndex === 4) return form.interests.length > 0;
    return true;
  };

  const generateItinerary = async () => {
    setLoading(true);
    const { travelerType, budget, days, season, interests } = form;
    const interestsString = interests.join(', ');
   const prompt = `
You are a travel planning AI.

Generate a strictly valid JSON itinerary.

Rules:
- Output ONLY a JSON array
- No markdown, no explanation, no extra text
- Each item must follow this exact structure:
  {
    "day": number,
    "title": string,
    "place": string,
    "description": string
  }

Generate a ${days}-day itinerary for:
Destination: ${destination}
Traveler type: ${travelerType}
Budget: ${budget}
Season: ${season}
Interests: ${interestsString}

Important:
- Return exactly ${days} items (one per day)
- Ensure valid JSON (must work with JSON.parse)
- If unsure, return []

Example:
[
  {
    "day": 1,
    "title": "Explore Local Market",
    "place": "Local Market",
    "description": "Walk around and explore local culture."
  }
]
`;

    const result = await getAIPrompt(prompt);
    try {
      if (result === null) {
        throw new Error('AI response is null');
      }

      const cleanedResult = cleanAIJsonMessage(result);
      let parsed = tryParseSafeJson<ItineraryItem[]>(cleanedResult);
      if ((!parsed || !Array.isArray(parsed)) && typeof cleanedResult === 'string') {
        const arrayMatch = cleanedResult.match(/\[[\s\S]*\]/m)?.[0];
        if (arrayMatch) {
          parsed = tryParseSafeJson<ItineraryItem[]>(arrayMatch);
        }
      }

      if (!parsed || !Array.isArray(parsed)) {
        console.warn('AI response could not be parsed as itinerary JSON, returning empty itinerary', {
          raw: result,
          cleanedResult,
        });
        setItinerary([]);
        return;
      }

      const targetDays = Math.max(0, days);
      const normalizedItinerary = parsed
        .slice(0, targetDays)
        .map((item, index) => ({
          day: index + 1,
          title: item.title,
          place: item.place || destination,
          description: item.description,
        } as ItineraryItem));

      if (normalizedItinerary.length < targetDays) {
        const missingDays = Array.from(
    { length: targetDays - normalizedItinerary.length },
    (_, index) => ({
      day: normalizedItinerary.length + index + 1,
      title: 'Free Exploration Day',
      place: destination,
      description:
        'Relax and explore nearby attractions, cafes, or local markets at your own pace.',
    })
  ) as ItineraryItem[];
        setItinerary([...normalizedItinerary, ...missingDays]);
        return;
      }

      setItinerary(normalizedItinerary);
    } catch (e) {
      console.error('Invalid AI response', e, { result });
      setItinerary(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    stepIndex,
    loading,
    itinerary,
    goNext,
    goBack,
    handleSelect,
    toggleInterest,
    isStepValid,
    generateItinerary,
    setStepIndex
  };
}
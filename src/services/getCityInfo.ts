export async function getCityInfo(city: string) {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(city)}`;

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Wiki API error: ${res.status}`);
    }

    const data = await res.json();

    // ❗ IMPORTANT: sometimes Wikipedia returns "not found"
    if (!data || data.type === 'https://mediawiki.org/wiki/HyperSwitch/errors/not_found') {
      return null;
    }

    return {
      title: data.title || city,
      description: data.extract || 'No description available.',
      image: data.thumbnail?.source || null,
    };

  } catch (error) {
    console.error('❌ City info error:', error);
    return null;
  }
}
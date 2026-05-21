export async function getAIPrompt(prompt: string): Promise<string | null> {
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('AI API error:', res.status, data?.error ?? data);
      return null;
    }

    if (typeof data.message !== 'string' || !data.message.trim()) {
      console.error('AI API returned invalid message payload:', data);
      return null;
    }

    return data.message.trim();
  } catch (error: unknown) {
    console.error('Failed to fetch AI response:', error);
    return null;
  }
}

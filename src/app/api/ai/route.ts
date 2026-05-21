// This file handles the AI API route for generating responses using Google Gemini.

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { cleanAIJsonMessage, tryParseSafeJson } from '@/utils/safeJson';

const apiKey = process.env.GEMINI_API_KEY;
const aiClient = apiKey ? new GoogleGenerativeAI(apiKey) : null;

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
    const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';

    if (!prompt) {
      return NextResponse.json({ error: 'No prompt provided' }, { status: 400 });
    }

    if (!aiClient) {
      throw new Error('Missing GEMINI_API_KEY');
    }

    // Use stable flash model for low-latency generation
    const model = aiClient.getGenerativeModel({ model: 'gemini-2.5-flash' }); /////
    const request = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
        maxOutputTokens: 1200,
      },
    };

    let completion;
    try {
      completion = await model.generateContent(request);
    } catch (err) {
      console.error('Gemini SDK error', err);
      return NextResponse.json({ error: 'AI provider error' }, { status: 502 });
    }

    const rawMessage = getAiResponseText(completion?.response);

    if (!rawMessage) {
      console.error('Gemini returned an empty response', { completion });
      return NextResponse.json({ error: 'Empty AI response from Gemini' }, { status: 502 });
    }

    // Clean and attempt safe parse. If parsing fails, still return a JSON text
    // string so the frontend never receives `null`/empty message.
    const cleaned = cleanAIJsonMessage(rawMessage);
    const parsed = tryParseSafeJson<unknown>(cleaned);

    if (parsed !== null) {
      // Ensure we always return a string containing valid JSON
      return NextResponse.json({ message: JSON.stringify(parsed) });
    }

    // Final fallback: return cleaned text only. The frontend can still attempt
    // to parse a JSON array from the cleaned content.
    console.warn('Gemini response could not be parsed as JSON, returning cleaned fallback text', { rawMessage, cleaned });
    return NextResponse.json({ message: cleaned });
  } catch (error: unknown) {
    console.error('FULL API ERROR:', error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : JSON.stringify(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

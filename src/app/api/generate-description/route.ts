import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export async function POST(request: Request) {
  try {
    const { name, category } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Meal name is required.' }, { status: 400 });
    }

    const ai = getAiClient();
    const prompt = `Write an extremely appetizing, elegant, and mouthwatering food description (maximum 20 words) for a meal named "${name}"${category ? ` under the category "${category}"` : ""}. Make it sound high-end, delicious, and engaging. Do not use quotation marks.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
    });

    const description = response.text?.trim() || '';
    return NextResponse.json({ description });
  } catch (error: any) {
    console.error('Gemini API error during description generation:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal GenAI service failure' },
      { status: 500 }
    );
  }
}

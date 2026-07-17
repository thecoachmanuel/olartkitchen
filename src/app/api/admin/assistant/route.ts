import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, context } = body;

    const systemPrompt = `You are the AI Assistant for the Olart Kitchen Pre-Order Platform admin panel. 
You are a helpful, professional, and knowledgeable copilot assisting the admin with managing their kitchen.
You have access to the current state of the platform:
- Food Items Count: ${context?.foodItemsCount || 0}
- Active Categories Count: ${context?.categoriesCount || 0}
- Total Orders: ${context?.ordersCount || 0}
- Total Revenue: ₦${context?.totalRevenue?.toLocaleString() || 0}

Recent Orders Summary: 
${context?.recentOrders?.map((o: any) => `- Order #${o.id.substring(0,6)}: ₦${o.total} (${o.status})`).join('\n') || 'None'}

Food Items Available:
${context?.foodItems?.map((f: any) => `- ${f.name} (₦${f.price}) ${f.inStock ? '[In Stock]' : '[Out of Stock]'}`).join('\n') || 'None'}

Provide concise, accurate, and helpful responses to the admin. If they ask about orders, revenue, or food items, use the context provided.
Do not make up fake data if it is not in the context. Answer professionally but warmly.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Understood. I am ready to assist.' }] },
        { role: 'user', parts: [{ text: message }] }
      ],
    });

    return NextResponse.json({ text: response.text });
  } catch (error) {
    console.error("AI Assistant API Error:", error);
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}

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
- Active Categories: ${context?.categories?.join(', ') || 'None'}
- Total Orders: ${context?.ordersCount || 0}
- Total Revenue: ₦${context?.totalRevenue?.toLocaleString() || 0}
- Promo Enabled: ${context?.settings?.promoEnabled ? `Yes (Min ₦${context?.settings?.promoMinAmount})` : 'No'}

All Orders Ledger: 
${context?.allOrders?.map((o: any) => `- Order #${o.id.substring(0,6)}: ₦${o.total} (${o.status}) | Items: ${o.items?.map((i:any) => `${i.quantity}x ${i.name}`).join(', ')} | Date: ${o.date}`).join('\n') || 'None'}

Food Items Inventory:
${context?.foodItems?.map((f: any) => `- ${f.name} (₦${f.price}) [${f.category}] ${f.inStock ? 'In Stock' : 'Out of Stock'} - Current Pre-orders: ${f.currentPreOrders}`).join('\n') || 'None'}

Provide concise, accurate, and helpful responses to the admin. If they ask about orders, revenue, or food items, use the context provided.
Do not make up fake data if it is not in the context. Answer professionally but warmly.
Format your responses properly using Markdown. Use bold for titles and subtitles. Use numbered lists and bullet points where appropriate for readability. Avoid unnecessary hyphens and asterisks. Keep the formatting clean and professional.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
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

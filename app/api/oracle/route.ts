import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

async function scoutImage(productName: string) {
  try {
    const res = await fetch("https://google.serper.dev/images", {
      method: "POST",
      headers: {
        "X-API-KEY": process.env.SERPER_API_KEY || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: productName + " product photo", num: 1 }),
    });

    const data = await res.json();
    console.log(`Scouting ${productName}:`, data.images?.[0]?.imageUrl);

    return (
      data.images?.[0]?.imageUrl ||
      `https://placehold.co/400x400/1a1a1a/ffffff?text=${encodeURIComponent(productName)}`
    );
  } catch (e) {
    console.error("Scout Error:", e);
    return `https://placehold.co/400x400/1a1a1a/ffffff?text=SIGNAL_LOST`;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subjectName, age, tags, relationship, budget } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("CRITICAL: GEMINI_API_KEY is missing from .env.local");
      return NextResponse.json({ error: "API Key Missing" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a high-end gift curator. Suggest 3 specific, searchable product gifts for a ${age} year old ${relationship} named ${subjectName}. 
    Interests: ${tags.join(", ")}. Budget window: ${budget} (all gifts must fall within this price range).
    
    IMPORTANT: Each gift name should be a specific, real product that can be searched online (e.g., "Sony WH-1000XM5 Headphones" not just "wireless headphones"). Ensure the products actually retail within the specified budget range.
    
    For each gift, provide:
    - "name": The specific product name (brand + model if applicable)
    - "description": A brief description of the gift
    - "why": Why this gift is perfect for them
    
    Return ONLY a JSON array of 3 objects with keys: "name", "description", "why". No prose.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const cleanedText = text.replace(/```json|```/g, "").trim();
    const gifts = JSON.parse(cleanedText);

    const enrichedGifts = await Promise.all(
      gifts.map(async (gift: { name: string; description: string; why: string }) => {
        const imageUrl = await scoutImage(gift.name);
        return { ...gift, imageUrl };
      })
    );

    return NextResponse.json(enrichedGifts);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("DETAILED SERVER ERROR:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

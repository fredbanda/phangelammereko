"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("❌ GEMINI_API_KEY is not defined in environment variables");
}

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateSummary(prompt: string): Promise<string> {
  try {
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

    // generateContent returns a GenerateContentResult, which already has .response
    const result = await model.generateContent(prompt);

    // No need for "await result.response" → it's not a Promise
    const text = result.response.text();

    return text;
  } catch (error) {
    console.error("❌ Gemini generation failed:", error);
    throw error;
  }
}


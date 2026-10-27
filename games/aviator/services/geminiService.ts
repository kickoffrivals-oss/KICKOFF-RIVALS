
import { GoogleGenAI } from "@google/genai";

const getApiKey = () => {
  try {
    if (typeof process !== "undefined" && process?.env?.API_KEY) {
      return process.env.API_KEY;
    }
  } catch {
    // ignore
  }
  return "";
};

export const generateHeadlines = async (multiplier: number): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) return "Flight Ends at " + multiplier.toFixed(2) + "x";

  try {
    const ai = new GoogleGenAI({ apiKey });
    const tone = multiplier < 1.5 ? "disastrous" : multiplier > 8 ? "legendary" : "historic";
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Write a punchy old-school newspaper headline (max 6 words) for a paper plane flight that crashed at ${multiplier.toFixed(2)}x. Tone: ${tone}. No quotes.`,
    });

    return response.text ? response.text.trim().toUpperCase() : `PAPER PLANE DOWN AT ${multiplier.toFixed(2)}X`;
  } catch {
    return `PAPER PLANE DOWN AT ${multiplier.toFixed(2)}X`;
  }
};


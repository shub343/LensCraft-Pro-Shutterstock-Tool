
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiAnalysisResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function analyzeImageContext(url: string): Promise<GeminiAnalysisResponse> {
  // Extracting slug from URL as context since we can't always pass the raw URL to vision for preview images
  const urlParts = url.split('/');
  const contextHint = urlParts[urlParts.length - 1] || 'shutterstock image';

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this Shutterstock resource path: "${contextHint}". 
      Return a JSON object containing a detailed description of the likely image content, 
      5 relevant SEO tags, and 3 creative AI generation prompts that would produce a similar aesthetic.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            tags: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            suggestedPrompts: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["description", "tags", "suggestedPrompts"]
        },
      },
    });

    const result = JSON.parse(response.text);
    return result as GeminiAnalysisResponse;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      description: "Analysis unavailable.",
      tags: ["photography", "stock", "digital"],
      suggestedPrompts: ["Similar image prompt 1", "Similar image prompt 2"]
    };
  }
}

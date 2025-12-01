import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile } from "../types";

// Initialize Gemini Client
// In a real production app, you would proxy this through your own backend to protect the key.
// For this demo, we assume the environment variable is set or the user provides it (not implemented UI for key input as per instruction).
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const generateBioOptimization = async (currentBio: string, traits: string[]): Promise<string> => {
  if (!apiKey) return currentBio;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Help me rewrite a dating profile bio to be more attractive, witty, and concise. 
      Current Bio: "${currentBio}". 
      Key traits/hobbies: ${traits.join(', ')}. 
      Return only the rewritten bio text, nothing else.`,
    });
    return response.text?.trim() || currentBio;
  } catch (error) {
    console.error("Gemini Bio Error:", error);
    return currentBio; // Fallback
  }
};
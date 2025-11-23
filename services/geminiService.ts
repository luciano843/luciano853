import { GoogleGenAI, Chat } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

let chatSession: Chat | null = null;

const getAiInstance = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY not found in environment variables");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const initializeChat = () => {
  const ai = getAiInstance();
  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
      tools: [{ googleMaps: {} }],
    },
  });
  return chatSession;
};

export const sendMessageToGemini = async (text: string, imageBase64?: string) => {
  if (!chatSession) {
    initializeChat();
  }

  if (!chatSession) {
    throw new Error("Failed to initialize chat session");
  }

  try {
    let response;
    
    if (imageBase64) {
      // Remove header if present (e.g., data:image/jpeg;base64,)
      const cleanBase64 = imageBase64.split(',')[1] || imageBase64;
      
      response = await chatSession.sendMessage({
        message: {
          parts: [
            { text: text || "Segue a imagem." },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: cleanBase64
              }
            }
          ]
        }
      });
    } else {
      response = await chatSession.sendMessage({ message: text });
    }

    let finalText = response.text || "";

    // Extract Google Maps Grounding Metadata if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks && groundingChunks.length > 0) {
        const sources = groundingChunks
            .filter((chunk: any) => chunk.web?.uri || chunk.web?.title)
            .map((chunk: any) => `[${chunk.web?.title || 'Google Maps'}](${chunk.web?.uri})`)
            .join('\n');
        
        if (sources) {
            finalText += `\n\n📍 Fontes:\n${sources}`;
        }
    }

    return finalText;
  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    throw error;
  }
};

export const extractJsonFromResponse = (text: string | undefined): any | null => {
  if (!text) return null;
  
  // Attempt to find JSON pattern
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/{[\s\S]*}/);
  
  if (jsonMatch) {
    try {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse JSON from response", e);
      return null;
    }
  }
  return null;
};
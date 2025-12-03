import { TextBlock, BlockLabel } from "../types";
import { GoogleGenAI, Type } from "@google/genai";
import { OCR_LAYOUT_PROMPT } from "../constants";

const processPageWithGemini = async (
  base64Image: string,
  mimeType: string,
  modelName: string = 'gemini-2.5-flash'
): Promise<TextBlock[]> => {
  
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please checking your settings.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Define the schema for structured output
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      blocks: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            label: { 
              type: Type.STRING, 
              enum: [
                'TITLE', 'MAIN_TEXT', 'FOOTNOTE', 'HEADER', 
                'FOOTER', 'CAPTION', 'UNKNOWN'
              ] 
            },
            box_2d: {
              type: Type.ARRAY,
              items: { type: Type.NUMBER },
              description: "Bounding box [ymin, xmin, ymax, xmax] normalized 0-1000"
            }
          },
          required: ["text", "label"]
        }
      }
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          role: 'user',
          parts: [
            { text: OCR_LAYOUT_PROMPT },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Image
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1,
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' }
        ]
      }
    });

    const text = response.text;

    if (!text) {
      throw new Error("No text response from AI.");
    }

    const parsed = JSON.parse(text);
    
    // Add unique IDs to blocks for React keys
    const blocksWithIds = (parsed.blocks || []).map((b: any) => ({
      ...b,
      id: crypto.randomUUID(),
      // Ensure boxes are present even if model omits them
      box_2d: b.box_2d || [0, 0, 0, 0] 
    }));

    return blocksWithIds;

  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    throw new Error(error.message || "Failed to process document");
  }
};

const generateAppLogo = async (): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: "A minimalist, modern vector logo for an app called 'DocuClean AI'. The icon should feature a stylized document or sheet of paper being cleaned or sparkling, implying clarity and organization. Use a color palette of Royal Blue, Slate Grey, and White. Flat design, clean lines, suitable for an app icon." }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        }
      }
    });

    let imageData = null;
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        imageData = {
          mimeType: part.inlineData.mimeType,
          data: part.inlineData.data
        };
        break;
      }
    }

    if (!imageData) {
      throw new Error("No image generated");
    }

    return `data:${imageData.mimeType};base64,${imageData.data}`;

  } catch (e) {
    console.error("Logo generation failed", e);
    throw e;
  }
};

export { processPageWithGemini, generateAppLogo };
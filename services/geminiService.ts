import { TextBlock } from "../types";

const processPageWithGemini = async (
  base64Image: string,
  mimeType: string,
  modelName: string = 'gemini-2.5-flash'
): Promise<TextBlock[]> => {
  
  try {
    const response = await fetch('http://127.0.0.1:5037/api/process-page', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64Image,
        mimeType,
        modelName
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to process document on server");
    }

    const data = await response.json();
    const text = data.text;

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
  try {
    const response = await fetch('/api/generate-logo', {
      method: 'POST',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to generate logo on server");
    }

    const imageData = await response.json();

    if (!imageData || !imageData.data) {
      throw new Error("No image generated");
    }

    return `data:${imageData.mimeType};base64,${imageData.data}`;

  } catch (e: any) {
    console.error("Logo generation failed", e);
    throw e;
  }
};

export { processPageWithGemini, generateAppLogo };

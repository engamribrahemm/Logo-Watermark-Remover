
import { GoogleGenAI } from "@google/genai";
import { ToolMode } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async processImage(base64Data: string, mimeType: string, mode: ToolMode): Promise<string> {
    const logoPrompt = "Strictly identify and remove ONLY the logos or brand marks from this design. It is crucial that all other design elements, text (that isn't part of the logo), illustrations, background details, and artistic features remain 100% intact and unchanged. Reconstruct the background behind the removed logo with pixel-perfect seamlessness. Do not alter, blur, or modify any other part of the image. Maintain the exact original aspect ratio and resolution.";
    
    const watermarkPrompt = "Identify and remove ALL watermarks, including semi-transparent text patterns, grid overlays, or repeating brand stamps. Your task is to surgically remove these overlays while preserving the original colors, textures, and details underneath with 100% accuracy. Do not change, smooth, or blur any areas of the image that do not contain watermarks. The final output must be indistinguishable from a clean original, with identical resolution and aspect ratio.";

    const prompt = mode === 'logo' ? logoPrompt : watermarkPrompt;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      });

      if (!response.candidates || response.candidates.length === 0) {
        throw new Error("No candidates returned from Gemini");
      }

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }

      throw new Error("No image data found in Gemini response");
    } catch (error: any) {
      console.error(`Gemini ${mode} Removal Error:`, error);
      throw new Error(error.message || `Failed to remove ${mode}`);
    }
  }
}

export const geminiService = new GeminiService();

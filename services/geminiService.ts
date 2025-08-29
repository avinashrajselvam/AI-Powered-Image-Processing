import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { GeminiAnalysisResponse } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    tags: {
      type: Type.ARRAY,
      description: "Generate 5-10 relevant keywords and tags for the image, useful for a Digital Asset Management system. Include objects, concepts, and context.",
      items: { type: Type.STRING }
    },
    engagementScore: {
      type: Type.INTEGER,
      description: "Predict an engagement score from 0 to 100 based on the image's potential to attract likes, shares, and comments on social media."
    },
    targetAudience: {
      type: Type.STRING,
      description: "Describe the ideal target audience demographic for this image (e.g., 'Young professionals aged 25-35 interested in sustainable travel')."
    },
    aiSuggestions: {
      type: Type.OBJECT,
      properties: {
        adCopy: {
          type: Type.ARRAY,
          description: "Write two distinct, creative ad copy headlines (under 10 words each) for this image.",
          items: { type: Type.STRING }
        },
        captions: {
          type: Type.ARRAY,
          description: "Write two engaging social media captions for this image, each with a different tone (e.g., one inspirational, one humorous).",
          items: { type: Type.STRING }
        },
        hashtags: {
          type: Type.ARRAY,
          description: "Provide a list of 5-7 relevant and trending hashtags.",
          items: { type: Type.STRING }
        },
        editingIdeas: {
           type: Type.ARRAY,
           description: "Suggest two practical image editing enhancements (e.g., 'Increase contrast to make colors pop', 'Apply a warm filter for a vintage feel', 'Remove the background').",
           items: { type: Type.STRING }
        }
      },
      required: ["adCopy", "captions", "hashtags", "editingIdeas"]
    },
    complianceStatus: {
      type: Type.STRING,
      description: "Analyze the image for brand safety and compliance. Respond with 'Compliant', 'Review Needed', or 'Non-Compliant'. Assume a standard corporate brand safety policy.",
      enum: ['Compliant', 'Review Needed', 'Non-Compliant']
    },
    sentiment: {
        type: Type.STRING,
        description: "Analyze the primary sentiment or emotion conveyed by the image (e.g., 'Joyful', 'Adventurous', 'Calm', 'Professional')."
    }
  },
  required: ["tags", "engagementScore", "targetAudience", "aiSuggestions", "complianceStatus", "sentiment"]
};

export const analyzeImageWithGemini = async (base64ImageData: string, mimeType: string): Promise<GeminiAnalysisResponse> => {
  try {
    const prompt = `
      You are an expert AI Marketing Analyst and Digital Asset Manager. 
      Analyze the provided image and generate a detailed marketing and asset management report.
      Provide your analysis in the required JSON format.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { data: base64ImageData, mimeType } },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });

    const responseText = response.text.trim();
    if (!responseText) {
      throw new Error("Received an empty response from the AI model.");
    }
    
    // The Gemini API with responseSchema should return valid JSON, but we parse it defensively.
    const parsedJson = JSON.parse(responseText);
    
    // Basic validation to ensure the parsed object matches our expected structure.
    if (!parsedJson.tags || !parsedJson.aiSuggestions) {
        throw new Error("AI response is missing required fields.");
    }

    return parsedJson as GeminiAnalysisResponse;

  } catch (error) {
    console.error("Error analyzing image with Gemini:", error);
    if (error instanceof Error) {
        throw new Error(`AI analysis failed: ${error.message}`);
    }
    throw new Error("An unknown error occurred during AI analysis.");
  }
};


export const removeImageBackground = async (base64ImageData: string, mimeType: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: 'Remove the background from this image. The subject should be preserved perfectly. The new background should be transparent.',
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
                const newMimeType = part.inlineData.mimeType;
                const newBase64Data = part.inlineData.data;
                return `data:${newMimeType};base64,${newBase64Data}`;
            }
        }
        
        throw new Error("The AI did not return an image. It might have returned explanatory text instead.");

    } catch (error) {
        console.error("Error removing background with Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`AI background removal failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred during AI background removal.");
    }
};
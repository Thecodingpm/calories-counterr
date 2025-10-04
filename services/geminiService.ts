
import { GoogleGenAI, Type } from "@google/genai";

export interface AnalyzedFoodInfo {
  foodName: string;
  estimatedCalories: number;
  estimatedWeight: number;
  protein: number;
  carbs: number;
  fat: number;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export async function analyzeFoodImage(base64Image: string): Promise<AnalyzedFoodInfo | null> {
    if (!process.env.API_KEY) {
        console.warn("API_KEY environment variable not set. Using mock data.");
        return new Promise(resolve => setTimeout(() => resolve({
            foodName: "Spaghetti Bolognese (Mock)",
            estimatedCalories: 450,
            estimatedWeight: 300,
            protein: 25,
            carbs: 55,
            fat: 15,
        }), 1500));
    }
    
    try {
        const imagePart = {
            inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image,
            },
        };

        const textPart = {
            text: `Analyze the food item(s) in this image. 
                   Identify the main dish.
                   Provide a realistic estimation of its weight in grams.
                   Estimate the total calories, protein, carbohydrates, and fat in grams for the estimated weight.
                   Return ONLY the JSON object with no additional text or markdown formatting.`,
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        foodName: { type: Type.STRING, description: "Name of the identified food item." },
                        estimatedWeight: { type: Type.NUMBER, description: "Estimated weight of the food in grams." },
                        estimatedCalories: { type: Type.NUMBER, description: "Estimated total calories for the portion." },
                        protein: { type: Type.NUMBER, description: "Estimated grams of protein." },
                        carbs: { type: Type.NUMBER, description: "Estimated grams of carbohydrates." },
                        fat: { type: Type.NUMBER, description: "Estimated grams of fat." },
                    },
                    required: ["foodName", "estimatedWeight", "estimatedCalories", "protein", "carbs", "fat"],
                }
            }
        });

        const jsonString = response.text;
        const result = JSON.parse(jsonString);

        return result as AnalyzedFoodInfo;

    } catch (error) {
        console.error("Error analyzing food image with Gemini:", error);
        return null;
    }
}

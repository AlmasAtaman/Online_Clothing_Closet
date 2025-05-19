import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function getClothingInfoFromImage(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent([
    {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType: "image/jpeg",
      },
    },
    `
    You are a fashion labeling assistant.

    You will be given an image of a **single clothing item (no human)**. Your job is to:
    - Detect whether the image contains clothing.
    - If it does, generate useful metadata.

    Return only a **pure JSON object**, following the structure below.

    ---

    Fields:

    - "isClothing": boolean — true if this is a clothing item.
    - "name": a short descriptive name for the clothing item (e.g. "Eyes Hoodie", "Nike Sports Jacket")
    - "brand": guessed brand name (e.g. "Nike", "Adidas"), or null if unknown
    - "type": one of ["T-shirt", "Jacket", "Pants", "Shoes", "Hat", "Sweater", "Shorts", "Dress", "Skirt"]
    - "occasion": one of ["Casual", "Formal", "Party", "Athletic"]
    - "style": one of ["Streetwear", "Minimalist", "Old Money", "Y2K", "Preppy"]
    - "fit": one of ["Slim Fit", "Regular Fit", "Oversized Fit", "Crop Fit", "Skinny", "Tapered"]
    - "color": one of basic colors like ["Black", "White", "Red", "Blue", "Green", "Yellow", "Gray", "Brown", "Purple", "Pink"]
    - "material": one of ["Cotton", "Linen", "Denim", "Leather", "Knit", "Polyester"]
    - "season": one of ["Spring", "Summer", "Fall", "Winter"]

    ---

    Examples:

    1. Valid clothing:

    {
      "isClothing": true,
      "name": "Slim Fit Hoodie",
      "brand": "Nike",
      "type": "Sweater",
      "occasion": "Casual",
      "style": "Streetwear",
      "fit": "Slim Fit",
      "color": "Black",
      "material": "Cotton",
      "season": "Fall"
    }

    2. Not clothing:

    {
      "isClothing": false
    }

    ---

    Only return valid JSON. No explanation, formatting, or comments.
      `
    ,
  ]);

  const text = result.response.text();

  try {
    // Extract JSON using regex
    const match = text.match(/{[\s\S]*}/);
    if (!match) throw new Error("No JSON found in Gemini response");
    return JSON.parse(match[0]);
  } catch (err) {
    console.error("Failed to parse Gemini response:", text);
    return null;
  }
}

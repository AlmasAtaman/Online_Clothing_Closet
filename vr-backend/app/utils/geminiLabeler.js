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
    `You are a fashion labeling assistant. First, determine if this image shows a clothing item (with no humans or animals).

    - Only return tags from this list for "type": ["T-shirt", "Jacket", "Pants", "Shoes", "Hat", "Sweater", "Shorts", "Dress", "Skirt"].
    - Never invent new types or return anything outside this list.
    - If it IS a valid clothing item, return ONLY a JSON object in this format:

    {
      "isClothing": true,
      "name": "Slim Fit Hoodie",
      "type": "Hoodie",
      "brand": "Nike"
    }

    - If it is NOT clothing, return:

    {
      "isClothing": false
    }

    Do not include any explanation or code blocks. Return pure JSON only.`
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

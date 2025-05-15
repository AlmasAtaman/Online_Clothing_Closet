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
    "Return only a JSON object with: {name, type, brand}. If unsure, use null.",
  ]);

  const text = result.response.text();

  try {
    // Extract JSON using regex
    const match = text.match(/```json\n([\s\S]+?)```/) || text.match(/({[\s\S]+})/);
    const json = match ? match[1] : text;
    return JSON.parse(json);
  } catch (err) {
    console.error("Failed to parse Gemini response:", text);
    return null;
  }
}

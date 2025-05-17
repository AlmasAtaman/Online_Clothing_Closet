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
    `You are a fashion labeling assistant. You will be given an image of a single clothing item (no human). Your job is to detect whether the image contains clothing, and if so, fill in its metadata. Return a JSON object only, with **only the allowed values** listed below.

      Field rules:

      - "type": one of ["T-shirt", "Jacket", "Pants", "Shoes", "Hat", "Sweater", "Shorts", "Dress", "Skirt"]
      - "occasion": one of ["Casual", "Formal", "Party", "Athletic"]
      - "style": one of ["Streetwear", "Minimalist", "Old Money", "Y2K", "Preppy"]
      - "fit": one of ["Slim Fit", "Regular Fit", "Oversized Fit", "Crop Fit", "Skinny", "Tapered"]
      - "color": one of basic colors like ["Black", "White", "Red", "Blue", "Green", "Yellow", "Gray", "Brown", "Purple", "Pink"]
      - "material": one of ["Cotton", "Linen", "Denim", "Leather", "Knit", "Polyester"]
      - "season": one of ["Spring", "Summer", "Fall", "Winter"]

      Optional fields are okay to leave out or return as null.

      Your response MUST be one of these:

      1. For valid clothing:
      {
        "isClothing": true,
        "name": "Slim Fit Hoodie",
        "type": "Sweater",
        "brand": "Nike",
        "occasion": "Casual",
        "style": "Streetwear",
        "fit": "Slim Fit",
        "color": "Black",
        "material": "Cotton",
        "season": "Fall"
      }

      2. If image is not clothing:
      {
        "isClothing": false
      }

      Only return valid JSON. Do not include explanations, quotes, comments, or formatting outside the object.
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

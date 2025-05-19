import express from 'express';
import multer, { memoryStorage } from 'multer';
import { getUserPresignedUrls, uploadToS3 } from '../../s3.mjs';
import authMiddleware from '../middlewares/auth.middleware.js';
import { removeBackground } from "../utils/removeBackground.js";
import { getClothingInfoFromImage } from "../utils/geminiLabeler.js";
import { PrismaClient } from '@prisma/client';
import { deleteImage } from "../controllers/image.controller.js";
import { v4 as uuidv4 } from "uuid";



const prisma = new PrismaClient();
const router = express.Router();
const storage = memoryStorage();
const upload = multer({storage});




router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  const { file } = req;
  const userId = req.user.id;
  if (!file || !userId) return res.status(400).json({ message: "Bad Request" });

  const fs = await import("fs");
  const tempImagePath = `temp_${Date.now()}_${file.originalname}`;
  fs.writeFileSync(tempImagePath, file.buffer);

  try {
    // 1. Remove background
    const cleanedImagePath = await removeBackground(tempImagePath);

    // 2. Read cleaned image buffer to return to frontend
    const cleanedBuffer = fs.readFileSync(cleanedImagePath);

    // 3. Get clothing info
    const clothingData = await getClothingInfoFromImage(cleanedImagePath);

    if (!clothingData?.isClothing) {
      fs.unlinkSync(tempImagePath);
      fs.unlinkSync(cleanedImagePath);
      return res.status(400).json({
        message: "Image is not valid clothing",
        clothingData: { isClothing: false },
      });
    }

    console.log("Gemini result:", clothingData);

    fs.unlinkSync(tempImagePath);
    fs.unlinkSync(cleanedImagePath);

    return res.status(200).json({
      clothingData: {
        name: clothingData?.name || "",
        type: clothingData?.type || "",
        brand: clothingData?.brand || "",
        occasion: clothingData?.occasion || "",
        style: clothingData?.style || "",
        fit: clothingData?.fit || "",
        color: clothingData?.color || "",
        material: clothingData?.material || "",
        season: clothingData?.season || "",
        isClothing: true,
      },
      imageBuffer: cleanedBuffer.toString("base64"),
      originalname: file.originalname,
    });
  } catch (err) {
    console.error("Upload failed:", err);
    return res.status(500).json({ message: "Upload failed" });
  }
});


router.get("/", authMiddleware, async (req, res) => {
  const userId = req.user.id;

  if (!userId) return res.status(400).json({ message: "Bad Request" });

  try {
    const clothingFromDb = await prisma.clothing.findMany({
      where: { userId },
    });

    const { error, presignedUrls } = await getUserPresignedUrls(userId);
    if (error) return res.status(400).json({ message: error.message });

    const enrichedItems = clothingFromDb.map((item) => {
      const fullUrl = presignedUrls.find((url) =>
        url.includes(item.key)
      );

      return {
        key: item.key,
        url: fullUrl || "", // fallback if URL not found
        name: item.name || "Unnamed",
        type: item.type || "Unknown",
        brand: item.brand || "No brand",
      };
    });

    return res.json({ clothingItems: enrichedItems });
  } catch (err) {
    console.error("Error fetching clothing items:", err);
    return res.status(500).json({ message: "Failed to load items" });
  }
});


router.post("/submit-clothing", authMiddleware, async (req, res) => {
  const { name, type, brand, key } = req.body;
  const userId = req.user.id;

  if (!key) return res.status(400).json({ message: "Missing image key" });

  try {
    await prisma.clothing.create({
      data: {
        userId,
        key,
        url: key,
        name: name || null,
        type: type || null,
        brand: brand || null,
      },
    });
    return res.status(201).json({ message: "Clothing saved" });
  } catch (err) {
    console.error("Failed to save clothing:", err);
    return res.status(500).json({ message: "Failed to save clothing" });
  }
});


router.post("/final-submit", authMiddleware, upload.single("image"), async (req, res) => {
  const {
    name, type, brand,
    occasion, style, fit,
    color, material, season, notes
  } = req.body;
  const userId = req.user.id;
  const file = req.file;

  if (!file || !userId) return res.status(400).json({ message: "Bad Request" });

  try {
    const { error, key } = await uploadToS3({ file, userId });
    if (error) return res.status(500).json({ message: error.message });


    const clothing = await prisma.clothing.create({
      data: {
        userId: userId,
        key,     
        url: key,  
        name,
        type,
        brand: brand || null,
        occasion: occasion || null,
        style: style || null,
        fit: fit || null,
        color: color || null,
        material: material || null,
        season: season || null,
        notes: notes || null,
      }
    });

    return res.status(201).json({ message: "Clothing saved" });
  } catch (err) {
    console.error("Final submit failed:", err);
    return res.status(500).json({ message: "Final submit failed" });
  }
});

router.delete("/:key", authMiddleware, deleteImage);

router.patch("/images/:key", async (req, res) => {
  const { key } = req.params;
  const {
    name, type, brand, occasion, style, fit,
    color, material, season, notes
  } = req.body;

  try {
    const updated = await prisma.clothing.update({
      where: { key },
      data: {
        name, type, brand, occasion, style, fit,
        color, material, season, notes,
      },
    });

    res.json({ message: "Item updated", item: updated });
  } catch (error) {
    console.error("Failed to update item:", error);
    res.status(500).json({ error: "Failed to update item" });
  }
});


export default router;

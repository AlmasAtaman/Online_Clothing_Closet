import express from 'express';
import multer, { memoryStorage } from 'multer';
import { getUserPresignedUrls, uploadToS3 } from '../../s3.mjs';
import authMiddleware from '../middlewares/auth.middleware.js';
import { removeBackground } from "../utils/removeBackground.js";
import { getClothingInfoFromImage } from "../utils/geminiLabeler.js";
import { PrismaClient } from '@prisma/client';
import { deleteImage } from "../controllers/image.controller.js";


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
        url.includes(item.imageUrl)
      );

      return {
        key: item.imageUrl,
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
        imageUrl: key,
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
  const { name, type, brand } = req.body;
  const userId = req.user.id;
  const file = req.file;

  if (!file || !userId) return res.status(400).json({ message: "Bad Request" });

  try {
    const { error, key } = await uploadToS3({ file, userId });
    if (error) return res.status(500).json({ message: error.message });

    await prisma.clothing.create({
      data: {
        userId,
        imageUrl: key,
        name: name || null,
        type: type || null,
        brand: brand || null,
      },
    });

    return res.status(201).json({ message: "Clothing saved" });
  } catch (err) {
    console.error("Final submit failed:", err);
    return res.status(500).json({ message: "Final submit failed" });
  }
});

router.delete("/:key", authMiddleware, deleteImage);



export default router;

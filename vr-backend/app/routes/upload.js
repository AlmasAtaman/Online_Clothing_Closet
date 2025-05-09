import express from 'express';
import multer, { memoryStorage } from 'multer';
import { getUserPresignedUrls, uploadToS3 } from '../../s3.mjs';
import authMiddleware from '../middlewares/auth.middleware.js';


const router = express.Router();
const storage = memoryStorage();
const upload = multer({storage});

router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
    const {file} = req;
    const userId = req.user.id;
    if (!file || !userId) return res.status(400).json({message: "Bad Request"});
    const {error, key} = await uploadToS3({file, userId});
    if (error) return res.status(500).json({ message: error.message });
    return res.status(201).json({ key });
});

router.get('/', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    console.log("Fetching images for user ID:", userId); // ← ADD THIS LINE

    if (!userId) return res.status(400).json({message: "Bad Request"});

    const {error, presignedUrls} = await getUserPresignedUrls(userId);
    if (error) return res.status(400).json({message: error.message});

    return res.json({ presignedUrls });
})

export default router;

import express from 'express';
import multer, { memoryStorage } from 'multer';
import { uploadToS3 } from '../../s3.mjs';

const router = express.Router();
const storage = memoryStorage();
const upload = multer({storage});

router.post("/", upload.single("image"), async (req, res) => {
    const {file} = req;
    const userId = req.headers["x-user-id"];
    if (!file || !userId) return res.status(400).json({message: "Bad Request"});
    const {error, key} = await uploadToS3({file, userId});
    if (error) return res.status(500).json({ message: error.message });
    return res.send(201).json({key});
})

export default router;

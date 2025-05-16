import prisma from '../utils/prismaClient.js';
import { deleteFileFromS3 } from '../utils/s3Helpers.js';

export const deleteImage = async (req, res) => {
  const key = req.params.key;

  try {
    // Delete image record from database
    await prisma.image.delete({ where: { key } });

    await deleteFileFromS3(key);

    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: 'Error deleting image' });
  }
};

import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

const s3 = new S3Client({ region: process.env.AWS_REGION });

export const deleteFileFromS3 = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  });

  await s3.send(command);
};

import { PutObjectCommand, ListObjectsV2Command, GetObjectCommand, DeleteObjectCommand  } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';
import dotenv from 'dotenv';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client as s3 } from "./s3Client.js";


dotenv.config()

const bucket = process.env.BUCKET;



console.log("Loaded AWS region:", process.env.AWS_REGION); // Debug log
console.log("Using bucket:", bucket);
s3.config.region().then(region => console.log("S3 region in use:", region));

export const uploadToS3 = async ({file, userId}) => {
    const key = `${userId}/${uuid()}`;
    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
    });

    try {
        await s3.send(command);
        return { key };
    } catch (error) {
        console.error("Upload error:", error);
        return { error };
    }
};


const getImageKeyByUser = async (userId) => {
    const command = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: String(userId),
    });


    const {Contents = []} = await s3.send(command);

    return Contents.map(image => image.Key);
};

export const getUserPresignedUrls = async (userId) => {
    try {
        const imageKeys = await getImageKeyByUser(userId);

        const presignedUrls = await Promise.all(imageKeys.map((key) => {
            const command = new GetObjectCommand({ Bucket: bucket, Key: key });
            return getSignedUrl(s3, command, {expiresIn: 900});
        }));

        return {presignedUrls};
    } catch (error) {
        console.error("Presign error:", error);
        return { error };
    }
};

export const getPresignedUrl = async (key) => {
  try {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const url = await getSignedUrl(s3, command, { expiresIn: 900 });
    return { url };
  } catch (error) {
    console.error(`Error generating presigned URL for key ${key}:`, error);
    return { error };
  }
};

export async function deleteFromS3({ key }) {
  const bucket = process.env.BUCKET;
  if (!bucket) throw new Error("Missing AWS_BUCKET_NAME in env");

  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  try {
    await s3.send(command);
    console.log(`Deleted ${key} from S3`);
  } catch (err) {
    console.error("S3 deletion error:", err);
    throw err;
  }
};

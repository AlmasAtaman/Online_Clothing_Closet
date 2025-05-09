import { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';
import dotenv from 'dotenv';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

dotenv.config()

const bucket = process.env.BUCKET;


const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});


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
}
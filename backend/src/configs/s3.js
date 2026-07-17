import { S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  forcePathStyle: true,
  region: process.env.S3_REGION || "ap-northeast-1",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

export const BUCKET_NAME = process.env.S3_BUCKET || "bucket";

export default s3Client;

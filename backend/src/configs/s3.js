import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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
export const TEMPLATE_FOLDER = process.env.S3_TEMPLATE_FOLDER || "letter-template";

/**
 * Generate a presigned URL for downloading an object from S3.
 * @param {string} key - the S3 object key (path)
 * @param {string} bucket - bucket name (defaults to BUCKET_NAME)
 * @param {number} expiresIn - seconds until URL expires (default 60)
 */
export const getSignedDownloadUrl = async (key, bucket = BUCKET_NAME, expiresIn = 60) => {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(s3Client, command, { expiresIn });
};

export default s3Client;


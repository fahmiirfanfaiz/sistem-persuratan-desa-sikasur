import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client, { BUCKET_NAME } from "../configs/s3.js";
import prisma from "../libs/prisma.js";
import { randomUUID } from "crypto";

class ClientError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "ClientError";
    this.statusCode = statusCode;
  }
}

/**
 * Uploads a single file buffer to Supabase S3.
 * @param {Buffer} buffer - file content
 * @param {string} mimetype - e.g. "image/jpeg"
 * @param {string} folder - folder prefix inside the bucket
 * @returns {Promise<string>} - the stored path (key) in S3
 */
const uploadToS3 = async (buffer, mimetype, folder) => {
  const ext = mimetype.split("/")[1] || "jpg";
  const key = `${folder}/${randomUUID()}.${ext}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    })
  );

  return key;
};

/**
 * Creates a new submission with uploaded documents.
 * @param {string} userId
 * @param {{ letterTypeId: string, purpose: string }} data
 * @param {{ kkFile: Express.Multer.File, ktpFile: Express.Multer.File }} files
 */
const createSubmission = async (userId, data, files) => {
  const { letterTypeId, purpose } = data;

  if (!letterTypeId) throw new ClientError("Jenis surat wajib dipilih");
  if (!purpose || purpose.trim().length === 0)
    throw new ClientError("Keperluan wajib diisi");
  if (!files.kkFile)
    throw new ClientError("File Kartu Keluarga wajib diunggah");
  if (!files.ktpFile) throw new ClientError("File KTP wajib diunggah");

  // Validate letter type exists
  const letterType = await prisma.letterType.findUnique({
    where: { id: letterTypeId },
  });
  if (!letterType) throw new ClientError("Jenis surat tidak ditemukan", 404);

  // Upload both files to S3
  const [kkPath, ktpPath] = await Promise.all([
    uploadToS3(
      files.kkFile.buffer,
      files.kkFile.mimetype,
      "submissions/kartu-keluarga"
    ),
    uploadToS3(files.ktpFile.buffer, files.ktpFile.mimetype, "submissions/ktp"),
  ]);

  // Create submission + documents in a single transaction
  const submission = await prisma.submission.create({
    data: {
      userId,
      letterTypeId,
      purpose: purpose.trim(),
      documents: {
        create: [
          {
            documentType: "KARTU_KELUARGA",
            storagePath: kkPath,
          },
          {
            documentType: "KTP",
            storagePath: ktpPath,
          },
        ],
      },
    },
    select: {
      id: true,
      status: true,
      purpose: true,
      createdAt: true,
      letterType: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return submission;
};

/**
 * Retrieves all submissions belonging to a user.
 * @param {string} userId
 */
const getSubmissionsByUser = async (userId) => {
  return prisma.submission.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      purpose: true,
      createdAt: true,
      updatedAt: true,
      letterType: {
        select: { id: true, name: true },
      },
    },
  });
};

export { ClientError };
export default { createSubmission, getSubmissionsByUser };

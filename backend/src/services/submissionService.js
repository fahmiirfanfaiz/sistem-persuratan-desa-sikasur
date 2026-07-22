import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client, {
  BUCKET_NAME,
  TEMPLATE_FOLDER,
  getSignedDownloadUrl,
} from "../configs/s3.js";
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
 */
const createSubmission = async (userId, data, files) => {
  const { letterTypeId, purpose } = data;

  if (!letterTypeId) throw new ClientError("Jenis surat wajib dipilih");
  if (!purpose || purpose.trim().length === 0)
    throw new ClientError("Keperluan wajib diisi");
  if (!files.kkFile)
    throw new ClientError("File Kartu Keluarga wajib diunggah");
  if (!files.ktpFile) throw new ClientError("File KTP wajib diunggah");

  const letterType = await prisma.letterType.findUnique({
    where: { id: letterTypeId },
  });
  if (!letterType) throw new ClientError("Jenis surat tidak ditemukan", 404);

  const [kkPath, ktpPath] = await Promise.all([
    uploadToS3(
      files.kkFile.buffer,
      files.kkFile.mimetype,
      "submissions/kartu-keluarga"
    ),
    uploadToS3(files.ktpFile.buffer, files.ktpFile.mimetype, "submissions/ktp"),
  ]);

  const submission = await prisma.submission.create({
    data: {
      userId,
      letterTypeId,
      purpose: purpose.trim(),
      documents: {
        create: [
          { documentType: "KARTU_KELUARGA", storagePath: kkPath },
          { documentType: "KTP", storagePath: ktpPath },
        ],
      },
    },
    select: {
      id: true,
      status: true,
      purpose: true,
      createdAt: true,
      letterType: { select: { id: true, name: true } },
    },
  });

  // Create initial PENDING notification
  await prisma.notification.create({
    data: {
      userId,
      header: "Pengajuan Surat Diterima",
      body: `Pengajuan surat "${letterType.name}" Anda telah berhasil dikirim dan sedang menunggu diproses.`,
    },
  });

  return submission;
};

/**
 * Retrieves all submissions belonging to a user.
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
      letterType: { select: { id: true, name: true } },
      generatedLetters: {
        select: { id: true, path: true, status: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
};

/**
 * Get a single submission with full detail (for user view).
 */
const getSubmissionByIdForUser = async (submissionId, userId) => {
  const submission = await prisma.submission.findFirst({
    where: { id: submissionId, userId },
    select: {
      id: true,
      status: true,
      purpose: true,
      createdAt: true,
      updatedAt: true,
      letterType: { select: { id: true, name: true } },
      generatedLetters: {
        select: { id: true, path: true, status: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
  if (!submission) throw new ClientError("Pengajuan tidak ditemukan", 404);
  return submission;
};

// ─── ADMIN FUNCTIONS ──────────────────────────────────────────────────────────

/**
 * Get all submissions (admin).
 */
const getAllSubmissions = async ({ search = "", sort = "newest", page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { user: { name: { contains: search, mode: "insensitive" } } },
          { letterType: { name: { contains: search, mode: "insensitive" } } },
        ],
      }
    : {};

  const orderBy =
    sort === "oldest" ? { createdAt: "asc" } : { createdAt: "desc" };

  const [total, submissions] = await Promise.all([
    prisma.submission.count({ where }),
    prisma.submission.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        status: true,
        purpose: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: { id: true, name: true, phoneNumber: true, email: true },
        },
        letterType: { select: { id: true, name: true, templatePath: true } },
        generatedLetters: {
          select: { id: true, path: true, status: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    }),
  ]);

  return { total, submissions, page, limit };
};

/**
 * Get submission by ID (admin - full detail).
 */
const getSubmissionByIdForAdmin = async (submissionId) => {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: {
      id: true,
      status: true,
      purpose: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          nik: true,
          familyCardNumber: true,
          phoneNumber: true,
          email: true,
          address: true,
        },
      },
      letterType: {
        select: { id: true, name: true, templatePath: true },
      },
      documents: {
        select: {
          id: true,
          documentType: true,
          storagePath: true,
          createdAt: true,
        },
      },
      generatedLetters: {
        select: { id: true, path: true, status: true, letterNumber: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!submission) throw new ClientError("Pengajuan tidak ditemukan", 404);
  return submission;
};

/**
 * Get signed download URL for a submission document.
 */
const getDocumentSignedUrl = async (submissionId, documentId) => {
  const doc = await prisma.document.findFirst({
    where: { id: documentId, submissionId },
  });
  if (!doc) throw new ClientError("Dokumen tidak ditemukan", 404);

  const url = await getSignedDownloadUrl(doc.storagePath, BUCKET_NAME, 300);
  return url;
};

/**
 * Get signed download URL for letter template.
 */
const getTemplateSignedUrl = async (letterTypeId) => {
  const letterType = await prisma.letterType.findUnique({
    where: { id: letterTypeId },
    select: { templatePath: true, name: true },
  });
  if (!letterType) throw new ClientError("Jenis surat tidak ditemukan", 404);
  if (!letterType.templatePath)
    throw new ClientError("Template surat tidak tersedia", 404);

  const url = await getSignedDownloadUrl(
    `${TEMPLATE_FOLDER}/${letterType.templatePath}`,
    BUCKET_NAME,
    300
  );
  return { url, name: letterType.name };
};

/**
 * Update submission status + optional upload generated letter + send notification.
 */
const updateSubmissionStatus = async (
  submissionId,
  status,
  generatedLetterFile = null,
  adminNote = ""
) => {
  const validStatuses = ["PENDING", "ON_PROCESS", "APPROVED", "REJECTED", "COMPLETED"];
  if (!validStatuses.includes(status))
    throw new ClientError(`Status tidak valid: ${status}`);

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: {
      id: true,
      userId: true,
      letterType: { select: { name: true } },
    },
  });
  if (!submission) throw new ClientError("Pengajuan tidak ditemukan", 404);

  let generatedLetterPath = null;

  if (generatedLetterFile) {
    const ext =
      generatedLetterFile.originalname.split(".").pop() ||
      generatedLetterFile.mimetype.split("/")[1] ||
      "docx";
    const key = `generated-letters/${submissionId}/${randomUUID()}.${ext}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: generatedLetterFile.buffer,
        ContentType: generatedLetterFile.mimetype,
      })
    );
    generatedLetterPath = key;
  }

  // Update in transaction
  await prisma.$transaction(async (tx) => {
    await tx.submission.update({
      where: { id: submissionId },
      data: { status },
    });

    if (generatedLetterPath) {
      await tx.generatedLetter.create({
        data: {
          submissionId,
          path: generatedLetterPath,
          status: status === "COMPLETED" ? "ISSUED" : "DRAFT",
        },
      });
    }

    // Build notification
    const statusMessages = {
      ON_PROCESS: {
        header: "Pengajuan Sedang Diproses",
        body: `Pengajuan surat "${submission.letterType.name}" Anda sedang diproses oleh petugas desa.`,
      },
      APPROVED: {
        header: "Pengajuan Disetujui",
        body: `Selamat! Pengajuan surat "${submission.letterType.name}" Anda telah disetujui.`,
      },
      REJECTED: {
        header: "Pengajuan Ditolak",
        body: `Mohon maaf, pengajuan surat "${submission.letterType.name}" Anda tidak dapat disetujui.${adminNote ? " Catatan: " + adminNote : ""}`,
      },
      COMPLETED: {
        header: "Surat Sudah Selesai",
        body: `Surat "${submission.letterType.name}" Anda telah selesai diproses dan siap untuk diunduh.`,
      },
      PENDING: {
        header: "Status Pengajuan Diperbarui",
        body: `Status pengajuan surat "${submission.letterType.name}" Anda diperbarui menjadi menunggu.`,
      },
    };

    const notifData = statusMessages[status];
    if (notifData) {
      await tx.notification.create({
        data: {
          userId: submission.userId,
          header: notifData.header,
          body: notifData.body,
        },
      });
    }
  });

  return prisma.submission.findUnique({
    where: { id: submissionId },
    select: { id: true, status: true, updatedAt: true },
  });
};

/**
 * Get monthly submission stats for admin dashboard chart.
 */
const getMonthlyStats = async (year) => {
  const targetYear = year || new Date().getFullYear();
  const startDate = new Date(`${targetYear}-01-01T00:00:00.000Z`);
  const endDate = new Date(`${targetYear + 1}-01-01T00:00:00.000Z`);

  const submissions = await prisma.submission.findMany({
    where: { createdAt: { gte: startDate, lt: endDate } },
    select: { createdAt: true },
  });

  const months = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    count: 0,
  }));

  submissions.forEach((s) => {
    const m = new Date(s.createdAt).getMonth();
    months[m].count += 1;
  });

  return {
    year: targetYear,
    total: submissions.length,
    data: months,
  };
};

/**
 * Get signed download URL for a generated letter (for user).
 */
const getGeneratedLetterUrl = async (submissionId, userId) => {
  const letter = await prisma.generatedLetter.findFirst({
    where: {
      submissionId,
      submission: { userId },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, path: true },
  });

  if (!letter) throw new ClientError("Surat belum tersedia", 404);
  const url = await getSignedDownloadUrl(letter.path, BUCKET_NAME, 300);
  return url;
};

export { ClientError };
export default {
  createSubmission,
  getSubmissionsByUser,
  getSubmissionByIdForUser,
  getAllSubmissions,
  getSubmissionByIdForAdmin,
  getDocumentSignedUrl,
  getTemplateSignedUrl,
  updateSubmissionStatus,
  getMonthlyStats,
  getGeneratedLetterUrl,
};

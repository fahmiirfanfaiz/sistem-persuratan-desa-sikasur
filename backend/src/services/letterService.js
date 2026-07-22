import prisma from "../libs/prisma.js";

class ClientError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "ClientError";
    this.statusCode = statusCode;
  }
}

/**
 * Fetch all letter categories with their nested letter types.
 */
const getCategories = async () => {
  return prisma.letterCategory.findMany({
    include: {
      letterTypes: {
        select: { id: true, name: true, description: true, templatePath: true },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });
};

/**
 * Create a new letter category.
 */
const createCategory = async (name) => {
  if (!name || !name.trim()) throw new ClientError("Nama kategori wajib diisi");
  const existing = await prisma.letterCategory.findUnique({
    where: { name: name.trim() },
  });
  if (existing) throw new ClientError("Kategori sudah ada", 409);

  return prisma.letterCategory.create({
    data: { name: name.trim() },
    select: { id: true, name: true, createdAt: true },
  });
};

/**
 * Update a letter category.
 */
const updateCategory = async (id, name) => {
  if (!name || !name.trim()) throw new ClientError("Nama kategori wajib diisi");
  const cat = await prisma.letterCategory.findUnique({ where: { id } });
  if (!cat) throw new ClientError("Kategori tidak ditemukan", 404);

  return prisma.letterCategory.update({
    where: { id },
    data: { name: name.trim() },
    select: { id: true, name: true, updatedAt: true },
  });
};

/**
 * Delete a letter category (only if no letter types exist).
 */
const deleteCategory = async (id) => {
  const cat = await prisma.letterCategory.findUnique({
    where: { id },
    include: { letterTypes: { select: { id: true } } },
  });
  if (!cat) throw new ClientError("Kategori tidak ditemukan", 404);
  if (cat.letterTypes.length > 0)
    throw new ClientError(
      "Hapus semua jenis surat dalam kategori ini terlebih dahulu",
      409
    );

  await prisma.letterCategory.delete({ where: { id } });
  return { id };
};

/**
 * Create a new letter type.
 */
const createLetterType = async ({ letterCategoryId, name, description, templatePath }) => {
  if (!letterCategoryId) throw new ClientError("Kategori wajib dipilih");
  if (!name || !name.trim()) throw new ClientError("Nama surat wajib diisi");

  const cat = await prisma.letterCategory.findUnique({
    where: { id: letterCategoryId },
  });
  if (!cat) throw new ClientError("Kategori tidak ditemukan", 404);

  return prisma.letterType.create({
    data: {
      letterCategoryId,
      name: name.trim(),
      description: description?.trim() || null,
      templatePath: templatePath?.trim() || null,
    },
    select: { id: true, name: true, description: true, templatePath: true, letterCategoryId: true, createdAt: true },
  });
};

/**
 * Update a letter type.
 */
const updateLetterType = async (id, { name, description, templatePath }) => {
  const lt = await prisma.letterType.findUnique({ where: { id } });
  if (!lt) throw new ClientError("Jenis surat tidak ditemukan", 404);

  return prisma.letterType.update({
    where: { id },
    data: {
      ...(name ? { name: name.trim() } : {}),
      ...(description !== undefined ? { description: description?.trim() || null } : {}),
      ...(templatePath !== undefined ? { templatePath: templatePath?.trim() || null } : {}),
    },
    select: { id: true, name: true, description: true, templatePath: true, updatedAt: true },
  });
};

/**
 * Delete a letter type.
 */
const deleteLetterType = async (id) => {
  const lt = await prisma.letterType.findUnique({
    where: { id },
    include: { submissions: { select: { id: true }, take: 1 } },
  });
  if (!lt) throw new ClientError("Jenis surat tidak ditemukan", 404);
  if (lt.submissions.length > 0)
    throw new ClientError(
      "Tidak dapat menghapus jenis surat yang sudah memiliki pengajuan",
      409
    );

  await prisma.letterType.delete({ where: { id } });
  return { id };
};

export { ClientError };
export default {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createLetterType,
  updateLetterType,
  deleteLetterType,
};

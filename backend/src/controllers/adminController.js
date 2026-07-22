import submissionService, { ClientError } from "../services/submissionService.js";
import letterService from "../services/letterService.js";
import userService from "../services/userService.js";

// ─── SUBMISSION HANDLERS ──────────────────────────────────────────────────────

const getAllSubmissions = async (req, res) => {
  try {
    const { search = "", sort = "newest", page = "1", limit = "10" } = req.query;
    const result = await submissionService.getAllSubmissions({
      search,
      sort,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("[admin.getAllSubmissions]", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getSubmissionDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await submissionService.getSubmissionByIdForAdmin(id);
    return res.status(200).json({ success: true, data: submission });
  } catch (error) {
    if (error instanceof ClientError) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    console.error("[admin.getSubmissionDetail]", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateSubmissionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;
    const generatedLetterFile = req.file || null;

    const updated = await submissionService.updateSubmissionStatus(
      id,
      status,
      generatedLetterFile,
      adminNote
    );
    return res.status(200).json({
      success: true,
      message: "Status pengajuan berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    if (error instanceof ClientError) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    console.error("[admin.updateSubmissionStatus]", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getDocumentDownloadUrl = async (req, res) => {
  try {
    const { id, documentId } = req.params;
    const url = await submissionService.getDocumentSignedUrl(id, documentId);
    return res.status(200).json({ success: true, data: { url } });
  } catch (error) {
    if (error instanceof ClientError) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    console.error("[admin.getDocumentDownloadUrl]", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getTemplateDownloadUrl = async (req, res) => {
  try {
    const { letterTypeId } = req.params;
    const { url, name } = await submissionService.getTemplateSignedUrl(letterTypeId);
    return res.status(200).json({ success: true, data: { url, name } });
  } catch (error) {
    if (error instanceof ClientError) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    console.error("[admin.getTemplateDownloadUrl]", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const year = req.query.year ? parseInt(req.query.year, 10) : new Date().getFullYear();
    const stats = await submissionService.getMonthlyStats(year);
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error("[admin.getDashboardStats]", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── LETTER TYPE / CATEGORY HANDLERS ─────────────────────────────────────────

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const cat = await letterService.createCategory(name);
    return res.status(201).json({ success: true, data: cat });
  } catch (error) {
    if (error instanceof letterService.ClientError || error.name === "ClientError") {
      return res.status(error.statusCode || 400).json({ success: false, message: error.message });
    }
    console.error("[admin.createCategory]", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const cat = await letterService.updateCategory(id, name);
    return res.status(200).json({ success: true, data: cat });
  } catch (error) {
    if (error.name === "ClientError") {
      return res.status(error.statusCode || 400).json({ success: false, message: error.message });
    }
    console.error("[admin.updateCategory]", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await letterService.deleteCategory(id);
    return res.status(200).json({ success: true, message: "Kategori berhasil dihapus" });
  } catch (error) {
    if (error.name === "ClientError") {
      return res.status(error.statusCode || 400).json({ success: false, message: error.message });
    }
    console.error("[admin.deleteCategory]", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const createLetterType = async (req, res) => {
  try {
    const { letterCategoryId, name, description, templatePath } = req.body;
    const lt = await letterService.createLetterType({ letterCategoryId, name, description, templatePath });
    return res.status(201).json({ success: true, data: lt });
  } catch (error) {
    if (error.name === "ClientError") {
      return res.status(error.statusCode || 400).json({ success: false, message: error.message });
    }
    console.error("[admin.createLetterType]", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateLetterType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, templatePath } = req.body;
    const lt = await letterService.updateLetterType(id, { name, description, templatePath });
    return res.status(200).json({ success: true, data: lt });
  } catch (error) {
    if (error.name === "ClientError") {
      return res.status(error.statusCode || 400).json({ success: false, message: error.message });
    }
    console.error("[admin.updateLetterType]", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const deleteLetterType = async (req, res) => {
  try {
    const { id } = req.params;
    await letterService.deleteLetterType(id);
    return res.status(200).json({ success: true, message: "Jenis surat berhasil dihapus" });
  } catch (error) {
    if (error.name === "ClientError") {
      return res.status(error.statusCode || 400).json({ success: false, message: error.message });
    }
    console.error("[admin.deleteLetterType]", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── USER HANDLERS ────────────────────────────────────────────────────────────

const getAllUsers = async (req, res) => {
  try {
    const { search = "", page = "1", limit = "10" } = req.query;
    const result = await userService.getAllUsers({
      search,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("[admin.getAllUsers]", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.updateUser(id, req.body);
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    if (error.name === "ClientError") {
      return res.status(error.statusCode || 400).json({ success: false, message: error.message });
    }
    console.error("[admin.updateUser]", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user.userId) {
      return res.status(400).json({ success: false, message: "Tidak dapat menghapus akun sendiri" });
    }
    await userService.deleteUser(id);
    return res.status(200).json({ success: true, message: "Pengguna berhasil dihapus" });
  } catch (error) {
    if (error.name === "ClientError") {
      return res.status(error.statusCode || 400).json({ success: false, message: error.message });
    }
    console.error("[admin.deleteUser]", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export default {
  getAllSubmissions,
  getSubmissionDetail,
  updateSubmissionStatus,
  getDocumentDownloadUrl,
  getTemplateDownloadUrl,
  getDashboardStats,
  createCategory,
  updateCategory,
  deleteCategory,
  createLetterType,
  updateLetterType,
  deleteLetterType,
  getAllUsers,
  updateUser,
  deleteUser,
};

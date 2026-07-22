import { Router } from "express";
import multer from "multer";
import adminController from "../controllers/adminController.js";
import requireAdmin from "../middlewares/adminMiddleware.js";

const router = Router();

// All admin routes require ADMIN role
router.use(requireAdmin);

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
// GET /api/admin/stats?year=2026
router.get("/stats", adminController.getDashboardStats);

// ─── Submissions ──────────────────────────────────────────────────────────────
// GET /api/admin/submissions?search=&sort=newest&page=1&limit=10
router.get("/submissions", adminController.getAllSubmissions);

// GET /api/admin/submissions/:id
router.get("/submissions/:id", adminController.getSubmissionDetail);

// GET /api/admin/submissions/:id/documents/:documentId/download
router.get(
  "/submissions/:id/documents/:documentId/download",
  adminController.getDocumentDownloadUrl
);

// GET /api/admin/submissions/:id/template/download  (download letter template)
router.get(
  "/submissions/:id/template/download",
  async (req, res) => {
    // Fetch submission to get letterTypeId, then get template URL
    const { id } = req.params;
    try {
      const submissionService = (await import("../services/submissionService.js")).default;
      const submission = await submissionService.getSubmissionByIdForAdmin(id);
      req.params.letterTypeId = submission.letterType.id;
      adminController.getTemplateDownloadUrl(req, res);
    } catch (error) {
      return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }
);

// Multer for generated letter upload (accepts docx, pdf, images)
const uploadGenerated = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

// PATCH /api/admin/submissions/:id/status
router.patch(
  "/submissions/:id/status",
  uploadGenerated.single("generatedLetter"),
  adminController.updateSubmissionStatus
);

// ─── Letter Templates — download by letterTypeId ──────────────────────────────
// GET /api/admin/letter-types/:letterTypeId/template/download
router.get(
  "/letter-types/:letterTypeId/template/download",
  adminController.getTemplateDownloadUrl
);

// ─── Letter Categories CRUD ────────────────────────────────────────────────────
// POST /api/admin/categories
router.post("/categories", adminController.createCategory);
// PUT /api/admin/categories/:id
router.put("/categories/:id", adminController.updateCategory);
// DELETE /api/admin/categories/:id
router.delete("/categories/:id", adminController.deleteCategory);

// ─── Letter Types CRUD ─────────────────────────────────────────────────────────
// POST /api/admin/letter-types
router.post("/letter-types", adminController.createLetterType);
// PUT /api/admin/letter-types/:id
router.put("/letter-types/:id", adminController.updateLetterType);
// DELETE /api/admin/letter-types/:id
router.delete("/letter-types/:id", adminController.deleteLetterType);

// ─── Users CRUD ────────────────────────────────────────────────────────────────
// GET /api/admin/users?search=&page=1&limit=10
router.get("/users", adminController.getAllUsers);
// PUT /api/admin/users/:id
router.put("/users/:id", adminController.updateUser);
// DELETE /api/admin/users/:id
router.delete("/users/:id", adminController.deleteUser);

export default router;

import { Router } from "express";
import multer from "multer";
import submissionController from "../controllers/submissionController.js";
import authenticate from "../middlewares/authMiddleware.js";

const router = Router();

// Memory storage — files are available as Buffer in req.files
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB per file (ensures 2 files stay safely under Vercel's 4.5 MB request payload limit)
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg", "application/pdf"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Hanya format gambar (JPEG/PNG/WEBP) atau PDF yang diperbolehkan"));
    }
  },
});

const uploadFields = upload.fields([
  { name: "kkFile", maxCount: 1 },
  { name: "ktpFile", maxCount: 1 },
]);

// GET /api/submissions — list current user's submissions (protected)
router.get("/", authenticate, submissionController.getMySubmissions);

// GET /api/submissions/:id — get single submission detail for current user (protected)
router.get("/:id", authenticate, submissionController.getMySubmissionDetail);

// POST /api/submissions — protected
router.post("/", authenticate, uploadFields, submissionController.create);

// GET /api/submissions/:id/download — get signed URL for processed letter
router.get("/:id/download", authenticate, submissionController.getGeneratedLetterUrl);

export default router;


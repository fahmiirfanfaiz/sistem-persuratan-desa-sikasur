import { Router } from "express";
import multer from "multer";
import submissionController from "../controllers/submissionController.js";
import authenticate from "../middlewares/authMiddleware.js";

const router = Router();

// Memory storage — files are available as Buffer in req.files
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB per file
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Hanya format gambar (JPEG/PNG/WEBP) yang diperbolehkan"));
    }
  },
});

const uploadFields = upload.fields([
  { name: "kkFile", maxCount: 1 },
  { name: "ktpFile", maxCount: 1 },
]);

// GET /api/submissions — list current user's submissions (protected)
router.get("/", authenticate, submissionController.getMySubmissions);

// POST /api/submissions — protected
router.post("/", authenticate, uploadFields, submissionController.create);

// GET /api/submissions/:id/download — get signed URL for processed letter
router.get("/:id/download", authenticate, submissionController.getGeneratedLetterUrl);

export default router;


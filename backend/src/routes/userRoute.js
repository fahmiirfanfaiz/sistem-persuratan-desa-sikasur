import { Router } from "express";
import userController from "../controllers/userController.js";
import authenticate from "../middlewares/authMiddleware.js";

const router = Router();

// GET /api/users/me — get current user profile (protected)
router.get("/me", authenticate, userController.getMe);

// PUT /api/users/me — update current user profile (protected)
router.put("/me", authenticate, userController.updateMe);

export default router;

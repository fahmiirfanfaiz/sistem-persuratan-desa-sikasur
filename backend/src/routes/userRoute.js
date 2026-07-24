import { Router } from "express";
import userController from "../controllers/userController.js";
import authenticate from "../middlewares/authMiddleware.js";

const router = Router();

// GET /api/users/me — get current user profile (protected)
router.get("/me", authenticate, userController.getMe);

// PUT /api/users/me — update current user profile (protected)
router.put("/me", authenticate, userController.updateMe);

// GET /api/users/me/notifications — get user notifications
router.get("/me/notifications", authenticate, userController.getMyNotifications);

// PATCH /api/users/me/notifications/read — mark notifications as read
router.patch("/me/notifications/read", authenticate, userController.markNotificationsRead);

export default router;


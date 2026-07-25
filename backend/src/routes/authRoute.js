import { Router } from "express"
import authController from "../controllers/authController.js";

const router = Router();

// Register route
router.post("/register", authController.register);

// Login route — issues access token (response) + refresh token (HttpOnly cookie)
router.post("/login", authController.login);

// Refresh route — read HttpOnly cookie, issue new access token + rotate cookie
router.post("/refresh", authController.refresh);

// Logout route — revoke refresh token from DB + clear cookie
router.post("/logout", authController.logout);

export default router;
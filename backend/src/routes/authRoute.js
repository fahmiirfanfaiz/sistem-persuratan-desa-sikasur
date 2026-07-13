import { Router } from "express"
import authController from "../controllers/authController.js";

const router = Router();

// Register route
router.post("/register", authController.register);

// Login route
router.post("/login", authController.login);

export default router;
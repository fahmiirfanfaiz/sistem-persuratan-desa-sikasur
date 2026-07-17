import { Router } from "express";
import letterController from "../controllers/letterController.js";

const router = Router();

// GET /api/letters/categories — public endpoint
router.get("/categories", letterController.getCategories);

export default router;

import express from "express";
import {
  adminLogin,
  createAdmin
} from "../controllers/adminAuth.controller.js";
import { protectAdmin, requireRole } from "../middleware/adminAuth.js";

const router = express.Router();

/// Login
router.post("/login", adminLogin);

/// Create admin (only super admin)
router.post(
  "/create",
  protectAdmin,
  requireRole("super_admin"),
  createAdmin
);

export default router;
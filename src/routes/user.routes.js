import express from "express";
import upload from "../middleware/upload.js";
import { updateUserProfile } from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.js";
import { fetchUserProfile } from "../controllers/user.controller.js";


const router = express.Router();
router.post("/profile/fetch", protect, fetchUserProfile);
router.post(
  "/profile",
  protect,
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "idFront", maxCount: 1 },
    { name: "idBack", maxCount: 1 }
  ]),
  updateUserProfile
);

export default router;
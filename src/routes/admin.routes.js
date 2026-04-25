import express from "express";
import {
  createHotel,
  addRoomType
} from "../controllers/admin.controller.js";
import upload from "../middleware/upload.js";

const router = express.Router();

/**
 * CREATE HOTEL (with images)
 */
router.post(
  "/hotels",
  upload.array("images", 10), // hotel images
  createHotel
);

/**
 * ADD ROOM TYPE (with images)
 */
router.post(
  "/hotels/rooms",
  upload.array("images", 10), // room images
  addRoomType
);

export default router;

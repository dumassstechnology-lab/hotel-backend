import express from "express";
import { filterHotels } from "../controllers/hotel.controller.js";
import { filterHotelsmobile } from "../controllers/hotel.controller.js";
import { aiHomeHotels } from "../controllers/hotel.controller.js";
const router = express.Router();

// POST filter endpoint
router.post("/filter", filterHotels);
router.post("/filtermobile", filterHotelsmobile);
router.post("/ai-home", aiHomeHotels);
export default router;
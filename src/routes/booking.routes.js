import express from "express";
import {
  createBooking,
  getBookings,
  getBookingsFiltered,
  getAvailability,
  cancelBooking
} from "../controllers/booking.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Create booking (protected)
router.post("/", protect, createBooking);

// Get all bookings
//router.get("/", getBookings);
router.get("/", protect, getBookings);

// Get filtered bookings
//router.get("/filter", getBookingsFiltered);
router.get("/filter", protect, getBookingsFiltered);
// Availability check
router.get("/availability", getAvailability);
// Cancel booking
router.post("/cancel/:bookingId", protect, cancelBooking);

export default router;
import express from "express";
import { protectAdmin, requireRole } from "../middleware/adminAuth.js";
import {
  createAdminBooking,
  createWalkInGuest,
  cancelAdminBooking,
  getHotelBookings,
  getHotelAvailability,
  checkInAdminBooking,
  checkOutAdminBooking,
  getRoomGrid,
  extendStayAdminBooking
} from "../controllers/admin.booking.controller.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Protect all admin routes (must be logged in as admin)
router.use(protectAdmin);

// Only hotel_admin, reception, or super_admin can access
router.use(requireRole("hotel_admin", "reception", "super_admin"));
/* -----------------------------
   Create walk-in guest
----------------------------- */
router.post(
  "/walk-in-guest",

  upload.fields([
    {
      name: "idFront",
      maxCount: 1,
    },
  ]),

  createWalkInGuest
);
// Admin creates a booking
router.post("/", createAdminBooking);

// Admin cancels a booking
router.post("/cancel/:bookingId", cancelAdminBooking);

// Admin fetches bookings for their hotel
router.get("/", getHotelBookings);

// Admin checks availability for their hotel
router.get("/availability", getHotelAvailability);
router.post("/:bookingId/check-in", checkInAdminBooking);
router.post("/:bookingId/check-out", checkOutAdminBooking);
router.patch(
  "/:bookingId/extend",
  extendStayAdminBooking
);
router.get("/rooms", getRoomGrid);

export default router;
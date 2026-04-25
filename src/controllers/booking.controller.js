import {
  createBookingService,
  cancelBookingService,
  getBookingsService,
  getAvailabilityService
} from "../services/booking.service.js";

/* -----------------------------
   Create booking (user)
----------------------------- */
export const createBooking = async (req, res) => {
  try {
    const booking = await createBookingService({
      userId: req.user?.id || null,
      ...req.body,
      source: "app"
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* -----------------------------
   Cancel booking (user)
----------------------------- */
export const cancelBooking = async (req, res) => {
  try {
    await cancelBookingService(req.params.bookingId);
    res.json({ message: "Booking cancelled" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* -----------------------------
   Get all bookings (user)
----------------------------- */
export const getBookings = async (req, res) => {
  try {
    // Users see only their bookings; admin can fetch all
    console.log("REQ.USER:", req.user); // 🔥 ADD THIS
    const bookings = await getBookingsService({
      userId: req.user?.id
    });
    res.json(bookings);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* -----------------------------
   Get filtered bookings (user)
----------------------------- */
export const getBookingsFiltered = async (req, res) => {
  try {
    const { hotelId, roomTypeId, checkInDate, checkOutDate } = req.query;

    const filter = { userId: req.user?.id };

    if (hotelId) filter.hotelId = hotelId;
    if (roomTypeId) filter.roomTypeId = roomTypeId;
    if (checkInDate && checkOutDate) {
      filter.checkInDate = { $lt: new Date(checkOutDate) };
      filter.checkOutDate = { $gt: new Date(checkInDate) };
    }

    const bookings = await getBookingsService(filter);
    res.json(bookings);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* -----------------------------
   Check room availability (user)
----------------------------- */
export const getAvailability = async (req, res) => {
  try {
    const { hotelId, checkInDate, checkOutDate } = req.query;
    if (!hotelId || !checkInDate || !checkOutDate) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const availability = await getAvailabilityService({
      hotelId,
      checkInDate,
      checkOutDate
    });

    // Users see only number of rooms available
    const userView = availability.map(r => ({
      roomTypeId: r.roomTypeId,
      name: r.name,
      roomsAvailable: r.roomsAvailable,
      price: r.price
    }));

    res.json(userView);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
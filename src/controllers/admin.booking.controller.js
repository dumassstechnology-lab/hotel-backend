import {
  createBookingService,
  cancelBookingService,
  getBookingsService,
  getAvailabilityService,
  checkInBookingService,
  checkOutBookingService,
  getRoomGridService,
  extendStayService
} from "../services/booking.service.js";
import User from "../models/user.js";
/* -----------------------------
   Create walk-in guest
----------------------------- */
export const createWalkInGuest =
  async (req, res) => {
    try {
      const {
        name,
        phone,
      } = req.body;

      // check existing guest
      let user =
        await User.findOne({
          phone,
        });

      // if guest already exists
      if (user) {
        return res.json(user);
      }

      // create guest
      user =
  await User.create({
    name,
    phone,

    // temporary password
    password:
      Math.random()
        .toString(36)
        .slice(-8),

    nationalId: {
            front:
              req.files?.idFront?.[0]
                ? {
                    url:
                      req.files
                        .idFront[0]
                        .path,

                    public_id:
                      req.files
                        .idFront[0]
                        .filename,
                  }
                : {},
          },
        });

      res.status(201).json(
        user
      );
    } catch (err) {
      res.status(500).json({
        error: err.message,
      });
    }
  };
/* -----------------------------
   Create booking (admin)
----------------------------- */
export const createAdminBooking = async (req, res) => {
  try {
    const booking = await createBookingService({
      ...req.body,
      source: "admin",        // mark as admin booking
      hotelId: req.admin.hotelId, // force hotel admin's hotel
      userId: req.body.userId || null
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* -----------------------------
   Cancel booking (admin)
----------------------------- */
export const cancelAdminBooking = async (req, res) => {
  try {
    await cancelBookingService(req.params.bookingId);
    res.json({ message: "Booking cancelled" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* -----------------------------
   Get all bookings for admin's hotel
----------------------------- */
export const getHotelBookings = async (req, res) => {
  try {
    const bookings = await getBookingsService({
      hotelId: req.admin.hotelId
    });
    res.json(bookings);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* -----------------------------
   Get availability for admin's hotel
----------------------------- */
export const getHotelAvailability = async (req, res) => {
  try {
    const { checkInDate, checkOutDate } = req.query;

    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const availability = await getAvailabilityService({
      hotelId: req.admin.hotelId,
      checkInDate,
      checkOutDate
    });

    // Admin view: include guest info and national ID if booked
    const adminView = availability.map(r => ({
      roomTypeId: r.roomTypeId,
      name: r.name,
      price: r.price,
      totalRooms: r.totalRooms,
      bookedRooms: r.bookedRooms,
      bookings: r.bookings // each booking with user info + national ID
    }));

    res.json(adminView);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
/* -----------------------------
   Check-in booking (admin)
----------------------------- */
export const checkInAdminBooking = async (req, res) => {
  try {
    const booking = await checkInBookingService(req.params.bookingId);
    res.json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
/* -----------------------------
   Check-out booking (admin)
----------------------------- */
export const checkOutAdminBooking = async (req, res) => {
  try {
    const booking = await checkOutBookingService(req.params.bookingId);
    res.json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
export const getRoomGrid = async (req, res) => {
  try {
    const rooms = await getRoomGridService({
      hotelId: req.admin.hotelId
    });
    res.json(rooms);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
/* -----------------------------
   Extend stay (admin)
----------------------------- */
export const extendStayAdminBooking = async (
  req,
  res
) => {
  try {
    const booking =
      await extendStayService({
        bookingId:
          req.params.bookingId,
        newCheckOutDate:
          req.body.checkOutDate,
      });

    res.json(booking);
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};
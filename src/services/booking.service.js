import mongoose from "mongoose";
import Booking from "../models/booking.js";
import Hotel from "../models/hotel.js";
import Availability from "../models/Availability.js";
import User from "../models/user.js";

/* ---------------------------
   Update availability by room numbers
---------------------------- */
export const updateAvailability = async (
  hotelId,
  roomTypeId,
  checkInDate,
  checkOutDate,
  roomNumbers,
  operation,
  session
) => {
  const current = new Date(checkInDate);
  const end = new Date(checkOutDate);

  while (current < end) {
    const dateStr = current.toISOString().split("T")[0];

    let availability = await Availability.findOne({
      hotelId,
      roomTypeId,
      date: dateStr
    }).session(session);

    if (!availability) {
      const hotel = await Hotel.findById(hotelId).session(session);
      const roomType = hotel.rooms.id(roomTypeId);

      availability = await Availability.create(
        [{
          hotelId,
          roomTypeId,
          date: dateStr,
          totalRooms: roomType.totalRooms,
          bookedRooms: 0,
          roomNumbers: roomType.roomNumbers.map(r => ({
            number: r.number,
            status: "available"
          }))
        }],
        { session }
      );

      availability = availability[0];
    }

    // Update room statuses safely
    for (const roomNumber of roomNumbers) {
      const room = availability.roomNumbers.find(
        r => r.number === roomNumber
      );

      if (!room) {
        throw new Error(`Room ${roomNumber} not found`);
      }

      room.status = operation === "add" ? "booked" : "available";
    }

    // 🔥 Recalculate bookedRooms from real data
    availability.bookedRooms =
      availability.roomNumbers.filter(r => r.status === "booked").length;

    await availability.save({ session });

    current.setDate(current.getDate() + 1);
  }
};

/* ---------------------------
   Check availability & pick rooms
---------------------------- */

export const checkAvailability = async ({
  hotelId,
  roomTypeId,
  checkInDate,
  checkOutDate,
  roomsRequested,
  assignedRooms = null // 👈 NEW
}) => {
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) throw new Error("Hotel not found");

  const roomType = hotel.rooms.id(roomTypeId);
  if (!roomType) throw new Error("Room type not found");

  const current = new Date(checkInDate);
  const end = new Date(checkOutDate);

  let selectedRooms = [];

  // 🟢 ADMIN FLOW (specific room validation)
  if (assignedRooms && assignedRooms.length > 0) {
    selectedRooms = assignedRooms;

    while (current < end) {
      const dateStr = current.toISOString().split("T")[0];

      let availability = await Availability.findOne({ hotelId, roomTypeId, date: dateStr });

      if (!availability) {
        availability = await Availability.create({
          hotelId,
          roomTypeId,
          date: dateStr,
          totalRooms: roomType.totalRooms,
          bookedRooms: 0,
          roomNumbers: roomType.roomNumbers.map(r => ({
            number: r.number,
            status: "available"
          }))
        });
      }

      for (const roomNumber of assignedRooms) {
        const room = availability.roomNumbers.find(r => r.number === roomNumber);

        if (!room || room.status !== "available") {
          throw new Error(`Room ${roomNumber} is not available on ${dateStr}`);
        }
      }

      current.setDate(current.getDate() + 1);
    }

    return { roomType, selectedRooms };
  }

  // 🔵 APP FLOW (auto select)
  while (current < end) {
    const dateStr = current.toISOString().split("T")[0];

    let availability = await Availability.findOne({ hotelId, roomTypeId, date: dateStr });

    if (!availability) {
      availability = await Availability.create({
        hotelId,
        roomTypeId,
        date: dateStr,
        totalRooms: roomType.totalRooms,
        bookedRooms: 0,
        roomNumbers: roomType.roomNumbers.map(r => ({
          number: r.number,
          status: "available"
        }))
      });
    }

    const availableRooms = availability.roomNumbers.filter(r => r.status === "available");

    if (roomsRequested > availableRooms.length) {
      throw new Error(`Not enough rooms on ${dateStr}. Only ${availableRooms.length} left.`);
    }

    selectedRooms = availableRooms
      .slice(0, roomsRequested)
      .map(r => r.number);

    current.setDate(current.getDate() + 1);
  }

  return { roomType, selectedRooms };
};

/* ---------------------------
   Create booking
---------------------------- */
export const createBookingService = async ({
  userId,
  hotelId,
  roomTypeId,
  checkInDate,
  checkOutDate,
  roomsBooked,
  assignedRooms = null, // ✅ ADD THIS
  source = "app",
  guest = null
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check availability & get assigned rooms
    const { roomType, selectedRooms } = await checkAvailability({
      hotelId,
      roomTypeId,
      checkInDate,
      checkOutDate,
      roomsRequested: roomsBooked,
      assignedRooms: source === "admin" ? assignedRooms : null
    });

    // Compute total price
    const nights = (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24);
    if (nights <= 0) throw new Error("Invalid date range");

    const totalPrice = nights * roomType.price * roomsBooked;

    // Prepare guest data
   let guestData = guest || {};

if (userId) {
  const user = await User.findById(userId);

  if (user) {
    guestData = {
      name: user.name,
      phone: user.phone,
      nationalIdImage: user.nationalId?.front?.url || ""
    };
  }
}

    // Create booking
    const [booking] = await Booking.create(
      [
        {
          userId,
          hotelId,
          roomTypeId,
          roomsBooked,
          assignedRooms: selectedRooms, // store actual room numbers
          checkInDate,
          checkOutDate,
          totalPrice,
          status: "pending",
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          source,
          guest: guestData
        }
      ],
      { session }
    );

    // Reserve rooms
    await updateAvailability(hotelId, roomTypeId, checkInDate, checkOutDate, selectedRooms, "add", session);

    await session.commitTransaction();
    return booking;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

/* ---------------------------
   Cancel booking
---------------------------- */
export const cancelBookingService = async (bookingId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) throw new Error("Booking not found");

    if (!["pending", "confirmed"].includes(booking.status)) throw new Error("Booking cannot be cancelled");

    // Release rooms
    await updateAvailability(
      booking.hotelId,
      booking.roomTypeId,
      booking.checkInDate,
      booking.checkOutDate,
      booking.assignedRooms,
      "subtract",
      session
    );

    booking.status = "cancelled";
    await booking.save({ session });

    await session.commitTransaction();
    return true;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

/* ---------------------------
   Get bookings
---------------------------- */
  export const getBookingsService = async ({ hotelId, userId }) => {
    const filter = {};
    if (hotelId) filter.hotelId = hotelId;
    if (userId) filter.userId = userId;

    const bookings = await Booking.find(filter)
      .populate("hotelId", "name city location star") // <- remove 'rooms'
      .populate("userId", "name phone")               // optional
      .sort({ createdAt: -1 });

    return bookings.map(b => {
      // get room type name from the hotel's rooms array
      const roomType = b.hotelId.rooms?.find(
        r => r._id.toString() === b.roomTypeId.toString()
      );

      return {
        _id: b._id,
        guest: {
          name: b.guest?.name,
          phone: b.guest?.phone,
          nationalIdImage: b.guest?.nationalIdImage
        },
        hotel: {
          _id: b.hotelId._id,
          name: b.hotelId.name,
          city: b.hotelId.city,
          location: b.hotelId.location,
          star: b.hotelId.star
        },
        roomTypeId: b.roomTypeId,
        roomTypeName: roomType?.name || null,
        assignedRooms: b.assignedRooms,
        roomsBooked: b.roomsBooked,
        checkInDate: b.checkInDate,
        checkOutDate: b.checkOutDate,
        status: b.status,
        totalPrice: b.totalPrice,
        source: b.source,
        createdAt: b.createdAt
      };
    });
  };

/* ---------------------------
   Get availability for all room types
---------------------------- */
export const getAvailabilityService = async ({ hotelId, checkInDate, checkOutDate }) => {
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) throw new Error("Hotel not found");

  const results = [];

  for (const room of hotel.rooms) {
    let maxBooked = 0;
    const current = new Date(checkInDate);
    const end = new Date(checkOutDate);

    while (current < end) {
      const dateStr = current.toISOString().split("T")[0];
      const availability = await Availability.findOne({ hotelId, roomTypeId: room._id, date: dateStr });
      const booked = availability ? availability.bookedRooms : 0;
      if (booked > maxBooked) maxBooked = booked;
      current.setDate(current.getDate() + 1);
    }

    results.push({
      roomTypeId: room._id,
      name: room.name,
      totalRooms: room.totalRooms,
      bookedRooms: maxBooked,
      roomsAvailable: room.totalRooms - maxBooked,
      price: room.price
    });
  }

  return results;
};
export const getAdminAvailabilityService = async ({
  hotelId,
  checkInDate,
  checkOutDate
}) => {
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) throw new Error("Hotel not found");

  const results = [];

  for (const room of hotel.rooms) {
    const allRoomNumbers = room.roomNumbers.map(r => r.number);

    // find overlapping bookings
    const overlappingBookings = await Booking.find({
      hotelId,
      roomTypeId: room._id,
      status: { $in: ["pending", "confirmed"] },
      checkInDate: { $lt: checkOutDate },
      checkOutDate: { $gt: checkInDate }
    });

    const bookedSet = new Set();
    overlappingBookings.forEach(b => {
      (b.assignedRooms || []).forEach(num => bookedSet.add(num));
    });

    const availableRooms = allRoomNumbers.filter(
      num => !bookedSet.has(num)
    );

    results.push({
      roomTypeId: room._id,
      name: room.name,
      price: room.price,
      totalRooms: room.totalRooms,
      availableRooms,
      bookedRooms: allRoomNumbers.filter(num => bookedSet.has(num))
    });
  }

  return results;
};
export const checkInBookingService = async (bookingId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error("Booking not found");

  if (booking.status !== "confirmed") {
    throw new Error("Only confirmed bookings can be checked in");
  }

  const hotel = await Hotel.findById(booking.hotelId);
  if (!hotel) throw new Error("Hotel not found");

  // find the correct room type
  const roomType = hotel.rooms.find(
    r => r._id.toString() === booking.roomTypeId.toString()
  );

  if (!roomType) throw new Error("Room type not found");

  // mark assigned rooms as occupied
  booking.assignedRooms.forEach(roomNumber => {
    const room = roomType.roomNumbers.find(
      rn => rn.number === roomNumber
    );
    if (room) {
      room.status = "occupied";
    }
  });

  booking.status = "checked_in";

  await hotel.save();
  await booking.save();

  return booking;
};
export const checkOutBookingService = async (bookingId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error("Booking not found");

  if (booking.status !== "checked_in") {
    throw new Error("Only checked-in bookings can be checked out");
  }

  const hotel = await Hotel.findById(booking.hotelId);
  if (!hotel) throw new Error("Hotel not found");

  // find room type
  const roomType = hotel.rooms.find(
    r => r._id.toString() === booking.roomTypeId.toString()
  );

  if (!roomType) throw new Error("Room type not found");

  // free assigned rooms
  booking.assignedRooms.forEach(roomNumber => {
    const room = roomType.roomNumbers.find(
      rn => rn.number === roomNumber
    );
    if (room) {
      room.status = "available";
    }
  });

  booking.status = "completed";
  booking.actualCheckOut = new Date();

  await hotel.save();
  await booking.save();

  return booking;
};
export const getRoomGridService = async ({ hotelId }) => {
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) throw new Error("Hotel not found");

  // Fetch all active bookings (pending, confirmed, checked_in)
  const activeBookings = await Booking.find({
    hotelId,
    status: { $in: ["pending", "confirmed", "checked_in"] }
  }).populate("userId", "name nationalIdImage");

  const roomMap = {};

  activeBookings.forEach(b => {
    b.assignedRooms.forEach(room => {
      roomMap[room] = {
        bookingId: b._id,
        guest: b.guest || b.userId, // fallback to user info if guest object missing
        checkInDate: b.checkInDate,
        checkOutDate: b.checkOutDate,
        status: b.status
      };
    });
  });

  const grid = [];

  hotel.rooms.forEach(rt => {
    rt.roomNumbers.forEach(rn => {
      const booking = roomMap[rn.number] || null;
      grid.push({
        roomNumber: rn.number,
        roomType: rt.name,
        roomTypeId: rt._id,   // 🔥 ADD THIS
        hotelId: hotel._id,   // 🔥 ADD THIS
        price: rt.price,   // 🔥 ADD THIS
        status: booking ? "occupied" : rn.status, // mark occupied if booked
        booking
      });
    });
  });

  return grid;
};
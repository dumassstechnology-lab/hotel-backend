import Booking from "../models/booking.js";
import Availability from "../models/Availability.js";

/* helper to restore rooms */
const restoreAvailability = async (booking) => {
  const current = new Date(booking.checkInDate);
  const end = new Date(booking.checkOutDate);

  while (current < end) {
    const dateStr = current.toISOString().split("T")[0];

    const availability = await Availability.findOne({
      hotelId: booking.hotelId,
      roomTypeId: booking.roomTypeId,
      date: dateStr
    });

    if (!availability) {
      current.setDate(current.getDate() + 1);
      continue;
    }

    // 🔥 Restore room statuses
    for (const roomNumber of booking.assignedRooms) {
      const room = availability.roomNumbers.find(
        r => r.number === roomNumber
      );

      if (room) {
        room.status = "available";
      }
    }
    

    // 🔥 Recalculate bookedRooms safely
    availability.bookedRooms =
      availability.roomNumbers.filter(r => r.status === "booked").length;

    await availability.save();

    current.setDate(current.getDate() + 1);
  }
};
const autoCheckoutBookings = async () => {
  try {
    const now = new Date();

    const bookings = await Booking.find({
      status: "checked_in",
      checkOutDate: { $lte: now }
    });

    for (const booking of bookings) {
      await restoreAvailability(booking); // 🔥 reuse your helper

      booking.status = "completed";
      booking.actualCheckOut = new Date();

      await booking.save();
    }

    console.log(`✅ Auto checked-out ${bookings.length} booking(s)`);
  } catch (error) {
    console.error("❌ Auto checkout cron failed:", error.message);
  }
};

export const expireBookings = async () => {
  try {
    const expiredBookings = await Booking.find({
      status: "pending",
      expiresAt: { $lte: new Date() }
    });

    for (const booking of expiredBookings) {
      await restoreAvailability(booking);

      booking.status = "expired";
      await booking.save();
    }

    console.log(`🕒 Expired ${expiredBookings.length} booking(s)`);
  } catch (error) {
    console.error("❌ Expire booking cron failed:", error.message);
  }
};

/* 🔥 Cron starter */
export const startBookingCron = () => {
  // runs every 1 minute
 setInterval(async () => {
  await expireBookings();
  await autoCheckoutBookings();
}, 60 * 1000);
  console.log("⏱ Booking cron started (expire + auto-checkout)");
};
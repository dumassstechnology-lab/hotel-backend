import Availability from "../models/Availability.js";
import Hotel from "../models/hotel.js";

export const reserveRooms = async ({
  hotelId,
  roomTypeId,
  checkIn,
  checkOut,
  roomsRequested
}) => {
  // 1️⃣ Fetch hotel + room
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) throw new Error("Hotel not found");

  const room = hotel.rooms.id(roomTypeId);
  if (!room) throw new Error("Room type not found");

  // 2️⃣ Check availability day by day
  const current = new Date(checkIn);
  const end = new Date(checkOut);

  while (current < end) {
    const dateStr = current.toISOString().split("T")[0];

    let availability = await Availability.findOne({
      hotelId,
      roomTypeId,
      date: dateStr
    });

    // If no record exists, create it with full availability
    if (!availability) {
      availability = await Availability.create({
        hotelId,
        roomTypeId,
        date: dateStr,
        totalRooms: room.totalRooms,
        bookedRooms: 0
      });
    }

    const availableRooms =
      availability.totalRooms - availability.bookedRooms;

    if (roomsRequested > availableRooms) {
      throw new Error(
        `Not enough rooms on ${dateStr}. Only ${availableRooms} left.`
      );
    }

    current.setDate(current.getDate() + 1);
  }

  // ✅ Rooms are available
};
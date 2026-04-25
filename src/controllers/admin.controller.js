import mongoose from "mongoose";
import Hotel from "../models/hotel.js";

/**
 * CREATE HOTEL
 */
export const createHotel = async (req, res) => {
  try {
    console.log("👉 BODY:", req.body);
    console.log("👉 FILES:", req.files);

    const ownerId = new mongoose.Types.ObjectId();

    // ✅ Images already uploaded by multer-cloudinary
    const images = (req.files || []).map(file => ({
      url: file.path,        // secure_url
      public_id: file.filename
    }));

    const hotel = await Hotel.create({
      ...req.body,
      ownerId,
      images,
      rooms: [] // initially empty
    });

    res.status(201).json(hotel);
  } catch (err) {
    console.error("❌ Hotel create error:", err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * ADD ROOM TYPE TO HOTEL
 */
export const addRoomType = async (req, res) => {
  try {
    const { hotelId, room } = req.body;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ error: "Hotel not found" });
    }

    // ✅ Parse room if sent as string (form-data)
    let roomData = room;
    if (typeof room === "string") {
      roomData = JSON.parse(room);
    }

    // ✅ Images already uploaded by multer-cloudinary
    const images = (req.files || []).map(file => ({
      url: file.path,
      public_id: file.filename
    }));

    // 🔹 Generate room numbers automatically
    const roomNumbers = [];
    const startingNumber = roomData.startingNumber || 101; // default start at 101
    for (let i = 0; i < roomData.totalRooms; i++) {
      roomNumbers.push({
        number: startingNumber + i,
        status: "available"
      });
    }

    hotel.rooms.push({
      _id: new mongoose.Types.ObjectId(),
      name: roomData.name,
      price: roomData.price,
      description: roomData.description,
      totalRooms: roomData.totalRooms,
      images,
      roomNumbers // NEW
    });

    await hotel.save();

    // ✅ Return full JSON
    res.status(201).json(hotel);
  } catch (err) {
    console.error("❌ Add room type error:", err);
    res.status(400).json({ error: err.message });
  }
};
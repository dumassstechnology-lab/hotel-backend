import mongoose from "mongoose";
import dotenv from "dotenv";
import Hotel from "../src/models/hotel.js";

dotenv.config();

const convertRoomNumbers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const hotels = await Hotel.find();

    for (const hotel of hotels) {
      let hotelChanged = false;

      for (const room of hotel.rooms) {
        if (!room.roomNumbers || room.roomNumbers.length === 0) continue;

        // Check if already numeric
        const isNumeric = typeof room.roomNumbers[0].number === "number";
        if (isNumeric) continue;

        console.log(
          `Converting room numbers for ${hotel.name} - ${room.name}`
        );

        // Generate new numeric numbers
        const newRoomNumbers = [];
        const base = 100; // 101,102,103...

        for (let i = 0; i < room.totalRooms; i++) {
          newRoomNumbers.push({
            number: base + i + 1,
            status: "available"
          });
        }

        room.roomNumbers = newRoomNumbers;
        hotelChanged = true;
      }

      if (hotelChanged) {
        await hotel.save();
        console.log(`Updated hotel: ${hotel.name}`);
      }
    }

    console.log("Conversion complete");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

convertRoomNumbers();
import mongoose from "mongoose";
import dotenv from "dotenv";
import Hotel from "./src/models/hotel.js";

dotenv.config();

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const hotels = await Hotel.find();

    for (const hotel of hotels) {
      let changed = false;

      for (const room of hotel.rooms) {
        // skip if already migrated
        if (room.roomNumbers && room.roomNumbers.length > 0) continue;

        const roomNumbers = [];

        for (let i = 1; i <= room.totalRooms; i++) {
          roomNumbers.push({
            number: `${room.name}-${i}`,
            status: "available"
          });
        }

        room.roomNumbers = roomNumbers;
        changed = true;
      }

      if (changed) {
        await hotel.save();
        console.log(`Updated hotel: ${hotel.name}`);
      }
    }

    console.log("Migration complete");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

migrate();
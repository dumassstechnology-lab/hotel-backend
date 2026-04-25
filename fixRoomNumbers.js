import mongoose from "mongoose";
import dotenv from "dotenv";
import Hotel from "./src/models/hotel.js";

dotenv.config();

const fixRoomNumbers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const hotels = await Hotel.find();

    for (const hotel of hotels) {
      console.log(`\n🏨 Fixing hotel: ${hotel.name}`);

      for (let i = 0; i < hotel.rooms.length; i++) {
        const roomType = hotel.rooms[i];

        const floorPrefix = (i + 1) * 100; // 100, 200, 300...

        roomType.roomNumbers = roomType.roomNumbers.map((room, index) => ({
          number: floorPrefix + index + 1, // 101,102,103 OR 201,202...
          status: "available"
        }));

        console.log(
          `✔ Updated ${roomType.name} → ${roomType.roomNumbers
            .map(r => r.number)
            .join(", ")}`
        );
      }

      await hotel.save();
    }

    console.log("\n🎉 Room numbers fixed successfully!");
    process.exit();
  } catch (error) {
    console.error("❌ Error fixing room numbers:", error);
    process.exit(1);
  }
};

fixRoomNumbers();
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import User from "./models/user.js";
import Hotel from "./models/hotel.js";

dotenv.config();
await connectDB();

const runSeed = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Hotel.deleteMany();

    // Create a hotel owner
    const user = await User.create({
      name: "Hotel Owner",
      email: "owner@test.com",
      passwordHash: "hashedpassword",
      role: "hotel_owner"
    });

    // Create a hotel with embedded rooms
    const hotel = await Hotel.create({
      ownerId: user._id,
      name: "Sunrise Hotel",
      star: 4,
      city: "Addis Ababa",
      location: "Bole",      // string
      latitude: 8.9806,      // number
      longitude: 38.7578,    // number
      images: [
        "https://example.com/hotel1.jpg",
        "https://example.com/hotel2.jpg"
      ],
      rooms: [
        {
          name: "deluxe",
          price: 150,
          description: "Spacious deluxe room",
          totalRooms: 10,
          images: [
            "https://example.com/d1.jpg",
            "https://example.com/d2.jpg",
            "https://example.com/d3.jpg",
            "https://example.com/d4.jpg"
          ]
        },
        {
          name: "standard",
          price: 100,
          description: "Comfortable standard room",
          totalRooms: 20,
          images: [
            "https://example.com/s1.jpg",
            "https://example.com/s2.jpg",
            "https://example.com/s3.jpg",
            "https://example.com/s4.jpg"
          ]
        },
        {
          name: "twin",
          price: 120,
          description: "Twin bed room",
          totalRooms: 8,
          images: [
            "https://example.com/t1.jpg",
            "https://example.com/t2.jpg",
            "https://example.com/t3.jpg",
            "https://example.com/t4.jpg"
          ]
        },
        {
          name: "economy",
          price: 60,
          description: "Affordable economy room",
          totalRooms: 15,
          images: [
            "https://example.com/e1.jpg",
            "https://example.com/e2.jpg",
            "https://example.com/e3.jpg",
            "https://example.com/e4.jpg"
          ]
        }
      ]
    });

    console.log("✅ Database seeded successfully");
    console.log("🏨 Hotel:", hotel.name);
    console.log("🛏️ Room types:", hotel.rooms.map(r => r.name));

    process.exit();
  } catch (err) {
    console.error("❌ Seed error:", err.message);
    process.exit(1);
  }
};

runSeed();

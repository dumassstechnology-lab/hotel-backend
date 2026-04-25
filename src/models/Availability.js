import mongoose from "mongoose";

const roomNumberSchema = new mongoose.Schema(
  {
    number: String, // e.g., "101"
    status: { type: String, enum: ["available", "booked"], default: "available" }
  },
  { _id: false }
);

const availabilitySchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
      index: true
    },

    roomTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },

    date: {
      type: String, // YYYY-MM-DD
      required: true
    },

    totalRooms: Number,

    bookedRooms: {
      type: Number,
      default: 0
    },

    // NEW: track individual room numbers
    roomNumbers: [roomNumberSchema]
  },
  { timestamps: true }
);

// unique index for hotel + roomType + date
availabilitySchema.index(
  { hotelId: 1, roomTypeId: 1, date: 1 },
  { unique: true }
);

export default mongoose.model("Availability", availabilitySchema);
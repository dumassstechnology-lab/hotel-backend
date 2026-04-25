import mongoose from "mongoose";

/* ----------------------------------
   Individual room number schema
---------------------------------- */
const roomNumberSchema = new mongoose.Schema(
  {
    number: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["available", "occupied", "maintenance"],
      default: "available"
    }
  },
  { _id: false }
);

/* ----------------------------------
   Room type schema
---------------------------------- */
const roomTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: ["deluxe", "standard", "twin", "economy"],
      required: true
    },

    price: {
      type: Number,
      required: true
    },

    description: {
      type: String
    },

    // keep for compatibility
    totalRooms: {
      type: Number,
      required: true
    },

    // NEW: list of actual room numbers
    roomNumbers: [roomNumberSchema],

    images: [
      {
        url: String,
        public_id: String
      }
    ]
  },
  { _id: true }
);

/* ----------------------------------
   Hotel schema
---------------------------------- */
const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    star: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },

    city: {
      type: String,
      required: true,
      index: true
    },

    location: {
      type: String
    },

    latitude: {
      type: Number,
      required: true
    },

    longitude: {
      type: Number,
      required: true
    },

    images: [
      {
        url: String,
        public_id: String
      }
    ],

    rooms: [roomTypeSchema]
  },
  { timestamps: true }
);

export default mongoose.model("Hotel", hotelSchema);
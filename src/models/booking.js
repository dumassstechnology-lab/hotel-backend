import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      index: true
    },

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

    // how many rooms booked
    roomsBooked: {
      type: Number,
      required: true,
      min: 1
    },

    // 🔴 NEW: actual room numbers assigned
    assignedRooms: [
      {
        type: String
      }
    ],

    checkInDate: {
      type: Date,
      required: true
    },

    checkOutDate: {
      type: Date,
      required: true
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },

    currency: {
      type: String,
      default: "ETB"
    },

    paymentMethod: {
      type: String,
      enum: ["wallet"],
      default: "wallet"
    },

    walletTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WalletTransaction"
    },

    payoutStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
      index: true
    },

    payoutAt: {
      type: Date
    },

    status: {
  type: String,
  enum: [
    "pending",
    "confirmed",
    "checked_in",
    "completed",
    "cancelled",
    "expired",
    "checked_out"
  ],
  default: "pending",
  index: true
},

    expiresAt: {
      type: Date,
      index: true
    },

    // guest info for reception/admin bookings
    guest: {
      name: String,
      phone: String,
      nationalIdNumber: String,
      nationalIdImage: String // Cloudinary URL
    },

    // booking source
    source: {
      type: String,
      enum: ["app", "reception", "admin"],
      default: "app"
    }
  },
  { timestamps: true }
);

// Existing indexes
bookingSchema.index({
  hotelId: 1,
  roomTypeId: 1,
  checkInDate: 1,
  checkOutDate: 1,
  status: 1
});

bookingSchema.index({
  payoutStatus: 1
});

export default mongoose.model("Booking", bookingSchema);
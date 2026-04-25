import mongoose from "mongoose";

const userActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false // allow guest users
    },
    lastCity: String,
    lastRoomType: String,

    priceRange: {
      min: Number,
      max: Number
    },

    viewedHotels: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hotel"
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("UserActivity", userActivitySchema);
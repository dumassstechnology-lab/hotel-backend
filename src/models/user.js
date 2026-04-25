import mongoose from "mongoose";

// reusable image schema
const imageSchema = new mongoose.Schema(
  {
    url: String,
    public_id: String
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true
    },

    password: {
      type: String,
      required: true
    },

    walletBalance: {
      type: Number,
      default: 0
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },

    // NEW FIELDS ↓↓↓

    profileImage: imageSchema,

    nationalId: {
      front: imageSchema,
      back: imageSchema,
      verified: {
        type: Boolean,
        default: false
      }
    },

    address: {
      type: String
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
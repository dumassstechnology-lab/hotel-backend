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

    // ADMIN LOGIN
    email: {
      type: String,
      lowercase: true,
      index: true,
      sparse: true, // allows null values
      unique: true
    },

    // USER LOGIN
    phone: {
      type: String,
      unique: true,
      sparse: true
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

// VALIDATION
userSchema.pre("validate", function () {

  if (this.role === "admin" && !this.email) {
    throw new Error("Admin must have email");
  }

  if (this.role === "user" && !this.phone) {
    throw new Error("User must have phone number");
  }

});

export default mongoose.model("User", userSchema);
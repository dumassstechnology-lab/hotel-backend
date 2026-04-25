import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true
    },

    amount: { type: Number, required: true },
    currency: { type: String, default: "USD" },

    method: {
      type: String,
      enum: ["card", "mobile_money"]
    },

    provider: {
      type: String,
      enum: ["Stripe", "Flutterwave", "PayPal"]
    },

    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending"
    },

    transactionRef: String
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);

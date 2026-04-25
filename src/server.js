import dotenv from "dotenv";
dotenv.config(); // MUST be first

import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";
import adminRoutes from "./routes/admin.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import authRoutes from "./routes/auth.routes.js";
import hotelRoutes from "./routes/hotel.routes.js";
import userRoutes from "./routes/user.routes.js";
import { startBookingCron } from "./cron/expireBookings.js";
import adminAuthRoutes from "./routes/adminAuth.routes.js";
import adminBookingRoutes from "./routes/admin.booking.routes.js";



connectDB();
startBookingCron();

const app = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json());

// ✅ Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});
// routes
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminAuthRoutes);

app.use("/api/bookings", bookingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/hotels", hotelRoutes); // ✅ public hotels list
app.use("/api/user", userRoutes);
app.use("/api/admin/bookings", adminBookingRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
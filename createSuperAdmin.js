import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "./src/models/admin.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const admin = new Admin({
  name: "Super Admin",
  email: "admin@example.com",
  password: "123456",
  role: "super_admin"
});

await admin.save();

console.log("Super admin created");
process.exit();
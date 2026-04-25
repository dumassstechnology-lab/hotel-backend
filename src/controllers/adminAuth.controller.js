import jwt from "jsonwebtoken";
import Admin from "../models/admin.js";

/// Generate JWT
const generateToken = (admin) => {
  return jwt.sign(
    {
      id: admin._id,
      role: admin.role,
      hotelId: admin.hotelId
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

/// Admin login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (!admin.isActive) {
      return res.status(403).json({ message: "Account disabled" });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(admin);

    res.json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        hotelId: admin.hotelId
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/// Create admin (only super admin should use this)
export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, role, hotelId } = req.body;

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const admin = new Admin({
      name,
      email,
      password,
      role,
      hotelId: role === "super_admin" ? null : hotelId
    });

    await admin.save();

    res.status(201).json({
      message: "Admin created",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        hotelId: admin.hotelId
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
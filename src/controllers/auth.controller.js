import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * REGISTER
 */
export const register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !password) {
      return res.status(400).json({
        error: "Name and password required"
      });
    }

    // ADMIN REGISTRATION
    if (role === "admin") {
      if (!email) {
        return res.status(400).json({
          error: "Admin email required"
        });
      }

      const adminExists = await User.findOne({ email });

      if (adminExists) {
        return res.status(400).json({
          error: "Email already registered"
        });
      }
    }

    // USER REGISTRATION
    else {
      if (!phone) {
        return res.status(400).json({
          error: "Phone number required"
        });
      }

      const userExists = await User.findOne({ phone });

      if (userExists) {
        return res.status(400).json({
          error: "Phone already registered"
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: role || "user"
    });

    res.status(201).json({
      message: "User registered",
      userId: user._id
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};

/**
 * LOGIN
 */
export const login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    let user;

    // ADMIN LOGIN
    if (email) {
      user = await User.findOne({ email });
    }

    // USER LOGIN
    else if (phone) {
      user = await User.findOne({ phone });
    }

    if (!user) {
      return res.status(400).json({
        error: "Invalid credentials"
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({
        error: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        walletBalance: user.walletBalance
      }
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};
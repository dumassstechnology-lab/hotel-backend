import User from "../models/user.js";

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { address } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // profile image
    if (req.files?.profileImage) {
      const file = req.files.profileImage[0];
      user.profileImage = {
        url: file.path,
        public_id: file.filename
      };
    }

    // national ID front
    if (req.files?.idFront) {
      const file = req.files.idFront[0];
      user.nationalId.front = {
        url: file.path,
        public_id: file.filename
      };
    }

    // national ID back
    if (req.files?.idBack) {
      const file = req.files.idBack[0];
      user.nationalId.back = {
        url: file.path,
        public_id: file.filename
      };
    }

    // address update
    if (address) {
      user.address = address;
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user
    });
  } catch (error) {
    res.status(500).json({
      message: "Profile update failed",
      error: error.message
    });
  }
};
export const fetchUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Optionally, you can read extra info from req.body if needed
    // const { someOption } = req.body;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch user profile",
      error: error.message
    });
  }
};
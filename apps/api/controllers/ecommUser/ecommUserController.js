const bcrypt = require("bcryptjs");
const User = require("../../models/shared/User.js");

const publicUser = (user) => ({
  id: user._id,
  _id: user._id,
  name: user.fullName || "User",
  fullName: user.fullName || "",
  email: user.email || "",
  phone: user.phone || "",
  address: user.address || "",
  avatar: user.profileImage || user.profilePic || "",
  role: user.role,
  preferences: user.preferences || { notifications: true, newsletter: false }
});

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user: publicUser(user) });
  } catch (error) {
    console.error("Error in controllers/ecommUser/ecommUserController.js:", error);

    res.status(500).json({ success: false, message: "Failed to process user request" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const allowed = ["fullName", "email", "phone", "address"];
    const updates = {};
    allowed.forEach((key) => {
      const sourceKey = key === "fullName" && req.body.name !== undefined ? "name" : key;
      if (req.body[sourceKey] !== undefined) updates[key] = req.body[sourceKey];
    });
    if (req.body.avatar !== undefined) updates.profileImage = req.body.avatar;
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, message: "Profile updated", user: publicUser(user) });
  } catch (error) {
    console.error("Error in controllers/ecommUser/ecommUserController.js:", error);

    const status = error?.code === 11000 ? 409 : 500;
    res.status(status).json({ success: false, message: error?.code === 11000 ? "Email already in use" : "Failed to update profile" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Both passwords are required; the new password must have at least 6 characters" });
    }
    const user = await User.findById(req.user.id).select("+password");
    if (!user || !user.password || !(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true, message: "Password updated" });
  } catch (error) {
    console.error("Error in controllers/ecommUser/ecommUserController.js:", error);

    res.status(500).json({ success: false, message: "Failed to process user request" });
  }
};

exports.getPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("preferences");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({
      success: true,
      preferences: user.preferences || { notifications: true, newsletter: false },
    });
  } catch (error) {
    console.error("Error in controllers/ecommUser/ecommUserController.js:", error);

    res.status(500).json({ success: false, message: "Failed to process user request" });
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const preferences = {
      notifications: req.body.notifications !== false,
      newsletter: req.body.newsletter === true
    };
    await User.findByIdAndUpdate(req.user.id, { preferences }, { runValidators: true });
    res.json({ success: true, message: "Preferences updated", preferences });
  } catch (error) {
    console.error("Error in controllers/ecommUser/ecommUserController.js:", error);

    res.status(500).json({ success: false, message: "Failed to process user request" });
  }
};

exports.logout = (_req, res) => {
  res.json({ success: true, message: "Logged out" });
};

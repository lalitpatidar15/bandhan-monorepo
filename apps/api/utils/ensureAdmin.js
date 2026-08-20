const bcrypt = require("bcryptjs");
const User = require("../models/shared/User.js");

const ensureAdmin = async () => {
  try {
    const email = (process.env.ADMIN_EMAIL || "admin@bandhan.com").trim().toLowerCase();
    const username = (process.env.ADMIN_USERNAME || "admin").trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || "admin@123";

    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      if (!existingAdmin.password && password) {
        existingAdmin.password = await bcrypt.hash(password, 10);
        existingAdmin.email = email;
        existingAdmin.username = username;
        existingAdmin.role = "admin";
        existingAdmin.status = "active";
        existingAdmin.isProfileComplete = true;
        await existingAdmin.save();
      }

      return existingAdmin;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const adminUser = await User.create({
      email,
      username,
      password: hashedPassword,
      fullName: "Bandhan Admin",
      phone: "+91 99999 99999",
      role: "admin",
      isProfileComplete: true,
      status: "active",
    });

    console.log(`Admin user ready: ${email} / ${password}`);
    return adminUser;
  } catch (error) {
    console.error("Admin bootstrap error:", error.message);
    return null;
  }
};

module.exports = ensureAdmin;

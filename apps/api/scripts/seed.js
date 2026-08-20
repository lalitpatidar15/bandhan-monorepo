const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config();

const User = require("../models/shared/User");
const Plan = require("../models/jobPoster/Plan");

const SEED_PASSWORD = bcrypt.hashSync("admin@123", 10);

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/bandhan")
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

const seedDatabase = async () => {
  try {
    console.log("Seeding admin credentials...");

    const existing = await User.findOne({ role: "admin" });
    if (existing) {
      console.log("Admin user already exists, skipping.");
      process.exit(0);
    }

    await User.create({
      email: "admin@bandhan.com",
      username: "admin",
      password: SEED_PASSWORD,
      fullName: "Bandhan Admin",
      phone: "+91 99999 99999",
      role: "admin",
      isProfileComplete: true,
      status: "active",
    });

    console.log("Admin user created (admin@bandhan.com / admin@123)");

    // Seed default plans
    const existingPlan = await Plan.findOne({ planName: "Free" });
    if (!existingPlan) {
      await Plan.create([
        {
          planName: "Free",
          price: 0,
          duration: 30,
          description: "Basic recruitment features",
          features: ["5 Active Jobs", "Basic Dashboard", "Limited Candidate Access"],
          isActive: true,
        },
        {
          planName: "Featured",
          price: 999,
          duration: 30,
          description: "Boost your job visibility",
          features: ["20 Active Jobs", "Featured Job Listings", "Priority Support", "Higher Search Ranking"],
          isActive: true,
        },
        {
          planName: "Premium",
          price: 1999,
          duration: 30,
          description: "Unlimited hiring solution",
          features: ["Unlimited Jobs", "Unlimited Candidates", "Analytics Dashboard", "Priority Support", "Featured Jobs"],
          isActive: true,
        },
      ]);
      console.log("Default plans created (Free, Featured, Premium)");
    } else {
      console.log("Plans already exist, skipping.");
    }

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seedDatabase();

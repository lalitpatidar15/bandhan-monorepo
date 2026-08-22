const mongoose = require("mongoose");

let connectionPromise = null;

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI environment variable is required");
  }

  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (connectionPromise) return connectionPromise;

  console.log("Connecting to MongoDB...");
  connectionPromise = mongoose
    .connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10_000,
      connectTimeoutMS: 10_000,
    })
    .then(() => {
      console.log("MongoDB Connected");
      return mongoose.connection;
    })
    .catch((error) => {
      connectionPromise = null;
      console.error("MongoDB connection failed:", error.message);
      throw error;
    });

  return connectionPromise;
};

module.exports = connectDB;

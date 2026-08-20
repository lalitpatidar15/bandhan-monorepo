require("dotenv").config();
const mongoose = require("mongoose");

async function reset() {
  await mongoose.connect(process.env.MONGO_URI);
  const { name, host } = mongoose.connection;
  console.log(`Resetting configured database ${name} on ${host}.`);
  await mongoose.connection.dropDatabase();
  console.log("Database reset complete.");
  await mongoose.disconnect();
}

reset().catch(async (error) => {
  console.error("Database reset failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});

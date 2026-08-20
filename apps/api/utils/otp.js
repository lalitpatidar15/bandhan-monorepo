const bcrypt = require("bcryptjs");
const crypto = require("crypto");

function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

async function hashOtp(otp) {
  return bcrypt.hash(otp, 8);
}

async function verifyOtp(otp, hash) {
  return bcrypt.compare(otp, hash);
}

module.exports = { generateOtp, hashOtp, verifyOtp };

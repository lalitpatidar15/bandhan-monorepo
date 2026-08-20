const mongoose = require("mongoose");

// Opaque, single-use portal handoff. The raw code never reaches the database.
const ssoGrantSchema = new mongoose.Schema({
  codeHash: { type: String, required: true, unique: true, index: true },
  // The account can belong to any customer-facing portal. Keeping the model
  // alongside the ID prevents a grant issued for one portal account from
  // being exchanged as another type of account.
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  subjectModel: { type: String, enum: ["User", "Student", "Instructor", "JobSeeker", "Recruiter"], required: true },
  role: { type: String, enum: ["buyer", "seller", "student", "instructor", "jobseeker", "recruiter"], required: true },
  usedAt: { type: Date, default: null },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
}, { timestamps: true });

module.exports = mongoose.model("SsoGrant", ssoGrantSchema);

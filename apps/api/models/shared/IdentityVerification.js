const mongoose = require("mongoose");

// A provider subject hash is intentionally optional during the demo flow.  It
// becomes the cross-account uniqueness key once a real DigiLocker callback is
// connected; email is not an identity proof and must never be used for that.
const identityVerificationSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, required: true },
  ownerType: { type: String, enum: ["seller", "recruiter", "instructor"], required: true },
  provider: { type: String, enum: ["digilocker_demo", "digilocker"], required: true },
  status: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
  providerSubjectHash: { type: String, unique: true, sparse: true },
  verifiedAt: { type: Date },
  audit: [{ action: String, at: { type: Date, default: Date.now }, actorId: mongoose.Schema.Types.ObjectId }],
}, { timestamps: true });

identityVerificationSchema.index({ ownerId: 1, ownerType: 1 }, { unique: true });

module.exports = mongoose.model("IdentityVerification", identityVerificationSchema);

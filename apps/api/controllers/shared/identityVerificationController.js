const IdentityVerification = require("../../models/shared/IdentityVerification.js");

const OWNER_TYPES = { seller: "seller", recruiter: "recruiter", instructor: "instructor" };

function ownerTypeFor(req) {
  return OWNER_TYPES[req.user?.role];
}

exports.getStatus = async (req, res) => {
  try {
    const ownerType = ownerTypeFor(req);
    if (!ownerType) return res.status(403).json({ success: false, message: "Identity verification is not available for this account" });
    const verification = await IdentityVerification.findOne({ ownerId: req.user._id, ownerType }).lean();
    return res.json({ success: true, data: verification || { status: "pending", provider: null, demo: false } });
  } catch (error) {
    console.error("Identity verification status error:", error);
    return res.status(500).json({ success: false, message: "Unable to load verification status" });
  }
};

// This is deliberately a demo acknowledgement, not a government-ID check.
// A real DigiLocker callback must supply a stable provider subject identifier
// before duplicate identities can be rejected across email accounts.
exports.completeDigiLockerDemo = async (req, res) => {
  try {
    const ownerType = ownerTypeFor(req);
    if (!ownerType) return res.status(403).json({ success: false, message: "Identity verification is not available for this account" });
    const now = new Date();
    const verification = await IdentityVerification.findOneAndUpdate(
      { ownerId: req.user._id, ownerType },
      { $set: { provider: "digilocker_demo", status: "verified", verifiedAt: now }, $push: { audit: { action: "digilocker_demo_completed", at: now, actorId: req.user._id } } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return res.json({ success: true, data: verification, demo: true, message: "Demo verification completed. Connect a real DigiLocker provider before relying on this as identity proof." });
  } catch (error) {
    console.error("Identity verification demo error:", error);
    return res.status(500).json({ success: false, message: "Unable to complete verification" });
  }
};

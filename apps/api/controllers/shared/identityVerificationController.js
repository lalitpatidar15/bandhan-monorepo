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
    return res.json({ success: true, data: verification || { status: "not_submitted", provider: null, demo: false } });
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

// Manual verification: documents are uploaded, stored, and reviewed by an admin.
// No external identity provider is involved.
exports.submitManual = async (req, res) => {
  try {
    if (req.user?.role !== "seller") {
      return res.status(403).json({ success: false, message: "Manual verification is available for sellers only" });
    }
    const files = req.files || {};
    const documents = {
      governmentId: files.governmentId?.[0]?.path || null,
      addressProof: files.addressProof?.[0]?.path || null,
      businessProof: files.businessProof?.[0]?.path || null,
    };
    if (!documents.governmentId) {
      return res.status(400).json({ success: false, message: "A government ID document is required" });
    }
    const now = new Date();
    const verification = await IdentityVerification.findOneAndUpdate(
      { ownerId: req.user._id, ownerType: "seller" },
      {
        $set: {
          provider: "manual",
          status: "pending",
          businessName: typeof req.body.businessName === "string" ? req.body.businessName.trim() : undefined,
          documents,
          submittedAt: now,
        },
        $unset: { rejectionReason: 1, reviewedBy: 1, reviewedAt: 1, verifiedAt: 1 },
        $push: { audit: { action: "manual_submitted", at: now, actorId: req.user._id } },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return res.json({ success: true, data: verification, message: "Documents submitted for manual review" });
  } catch (error) {
    console.error("Manual verification submit error:", error);
    return res.status(500).json({ success: false, message: "Unable to submit verification documents" });
  }
};

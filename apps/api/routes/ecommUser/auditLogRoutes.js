const express = require("express");
const router = express.Router();
const AuditLog = require("../../models/shared/AuditLog.js");

router.get("/", async (req, res) => {
  try {
    const { action, entity, userId, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (action) filter.action = { $regex: action, $options: "i" };
    if (entity) filter.entity = { $regex: entity, $options: "i" };
    if (userId) filter.userId = userId;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [logs, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).populate("userId", "fullName email"),
      AuditLog.countDocuments(filter),
    ]);
    res.json({ success: true, data: logs, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    
    console.error("Error in routes/ecommUser/auditLogRoutes.js:", err);
res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const log = await AuditLog.create({
      ...req.body,
      ipAddress: req.ip,
      userAgent: req.get("user-agent") || "",
    });
    res.json({ success: true, data: log });
  } catch (err) {
    
    console.error("Error in routes/ecommUser/auditLogRoutes.js:", err);
res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

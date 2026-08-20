const express = require("express");
const router = express.Router();
const Settlement = require("../../models/shared/Settlement.js");
const auth = require("../../middlewares/auth.js");
const { requireRole } = require("../../middlewares/role.js");
const { getAuthenticatedOwnerId, isAdmin } = require("../../utils/ownership.js");

router.get("/", auth, requireRole("seller", "admin"), async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    const role = String(req.user?.role || "").toLowerCase();
    const ownerId = getAuthenticatedOwnerId(req) || req.user?.id;

    if (status) filter.status = status;
    if (!isAdmin(req)) {
      filter.sellerId = ownerId;
    }

    const settlements = await Settlement.find(filter).sort({ createdAt: -1 }).populate("sellerId", "fullName email");
    res.json({ success: true, data: settlements });
  } catch (err) {
    console.error("Error in routes/ecommUser/settlementRoutes.js:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/", auth, requireRole("seller", "admin"), async (req, res) => {
  try {
    const ownerId = getAuthenticatedOwnerId(req) || req.user?.id;
    const settlement = await Settlement.create({
      ...req.body,
      sellerId: isAdmin(req) && req.body?.sellerId ? req.body.sellerId : ownerId,
    });
    res.json({ success: true, data: settlement });
  } catch (err) {
    console.error("Error in routes/ecommUser/settlementRoutes.js:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/:id", auth, requireRole("seller", "admin"), async (req, res) => {
  try {
    const ownerId = getAuthenticatedOwnerId(req) || req.user?.id;
    const existing = await Settlement.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: "Settlement not found" });
    if (!isAdmin(req) && String(existing.sellerId || "") !== String(ownerId)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const settlement = await Settlement.findByIdAndUpdate(req.params.id, {
      ...req.body,
      sellerId: isAdmin(req) && req.body?.sellerId ? req.body.sellerId : existing.sellerId || ownerId,
    }, { new: true });
    res.json({ success: true, data: settlement });
  } catch (err) {
    
    console.error("Error in routes/ecommUser/settlementRoutes.js:", err);
res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/summary", auth, requireRole("seller", "admin"), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    const result = await Settlement.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalSales: { $sum: "$totalSales" },
          totalCommission: { $sum: "$commissionDeducted" },
          totalNetPayable: { $sum: "$netPayable" },
        },
      },
    ]);
    res.json({ success: true, data: result });
  } catch (err) {
    
    console.error("Error in routes/ecommUser/settlementRoutes.js:", err);
res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

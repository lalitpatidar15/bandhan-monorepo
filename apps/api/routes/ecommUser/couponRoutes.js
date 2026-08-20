const express = require("express");
const Coupon = require("../../models/shared/Coupon.js");
const auth = require("../../middlewares/auth.js");
const requireEcommUser = require("../../middlewares/requireEcommUser.js");
const { requireRole } = require("../../middlewares/role.js");

const router = express.Router();

const activeCouponFilter = () => {
  const now = new Date();
  return {
    isActive: true,
    startDate: { $lte: now },
    $and: [
      { $or: [{ endDate: { $exists: false } }, { endDate: null }, { endDate: { $gte: now } }] },
      { $or: [{ usageLimit: 0 }, { $expr: { $lt: ["$usedCount", "$usageLimit"] } }] },
    ],
  };
};

// Public, read-only promotion data for storefront banners. Administrative and
// usage fields are intentionally excluded.
router.get("/active", async (_req, res) => {
  try {
    const coupons = await Coupon.find(activeCouponFilter())
      .select("code description discountType discountValue minOrderAmount maxDiscount applicableCategories startDate endDate")
      .sort({ discountValue: -1, createdAt: -1 })
      .limit(6)
      .lean();
    res.json({ success: true, data: coupons });
  } catch (error) {
    console.error("Active coupon lookup failed:", error);
    res.status(500).json({ success: false, message: "Unable to load active promotions" });
  }
});

router.post("/validate", auth, requireEcommUser, async (req, res) => {
  try {
    const code = String(req.body.code || "").trim().toUpperCase();
    const orderAmount = Number(req.body.orderAmount);
    if (!code || !Number.isFinite(orderAmount) || orderAmount < 0) {
      return res.status(400).json({ success: false, message: "A coupon code and valid order amount are required" });
    }

    const coupon = await Coupon.findOne({ code, ...activeCouponFilter() });
    if (!coupon) return res.status(404).json({ success: false, message: "Invalid or expired coupon code" });
    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({ success: false, message: `Minimum order amount is ₹${coupon.minOrderAmount}` });
    }

    let discount = coupon.discountType === "percentage"
      ? Math.round((orderAmount * coupon.discountValue) / 100)
      : coupon.discountValue;
    if (coupon.maxDiscount > 0) discount = Math.min(discount, coupon.maxDiscount);
    discount = Math.min(discount, orderAmount);

    res.json({
      success: true,
      data: {
        coupon: {
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          minOrderAmount: coupon.minOrderAmount,
          maxDiscount: coupon.maxDiscount,
        },
        discount,
        finalAmount: orderAmount - discount,
      },
    });
  } catch (error) {
    console.error("Coupon validation failed:", error);
    res.status(500).json({ success: false, message: "Unable to validate coupon" });
  }
});

router.use(auth, requireRole("admin"));

router.get("/", async (req, res) => {
  try {
    const { status, q } = req.query;
    const filter = {};
    if (status === "active") filter.isActive = true;
    if (status === "inactive") filter.isActive = false;
    if (q) filter.code = { $regex: String(q), $options: "i" };
    const coupons = await Coupon.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: coupons });
  } catch (error) {
    console.error("Coupon list failed:", error);
    res.status(500).json({ success: false, message: "Unable to load coupons" });
  }
});

router.post("/", async (req, res) => {
  try {
    const coupon = await Coupon.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    console.error("Coupon creation failed:", error);
    res.status(500).json({ success: false, message: "Unable to create coupon" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
    res.json({ success: true, data: coupon });
  } catch (error) {
    console.error("Coupon update failed:", error);
    res.status(500).json({ success: false, message: "Unable to update coupon" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
    res.json({ success: true, message: "Coupon deleted" });
  } catch (error) {
    console.error("Coupon deletion failed:", error);
    res.status(500).json({ success: false, message: "Unable to delete coupon" });
  }
});

module.exports = router;

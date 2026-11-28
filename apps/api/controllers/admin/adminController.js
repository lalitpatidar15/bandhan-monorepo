const User = require("../../models/shared/User.js");
const IdentityVerification = require("../../models/shared/IdentityVerification.js");
const Payment = require("../../models/shared/Payment.js");
const Profile = require("../../models/shared/Profile.js");
const VendorEarning = require("../../models/shared/VendorEarning.js");
const Booking = require("../../models/shared/Booking.js");
const Product = require("../../models/shared/Product.js");
const Order = require("../../models/shared/Order.js");
const Venue = require("../../models/shared/Venue.js");
const Service = require("../../models/shared/Service.js");
const Event = require("../../models/shared/Event.js");
const EventTemplate = require("../../models/shared/EventTemplate.js");
const Student = require("../../models/student/Student.js");
const Instructor = require("../../models/instructor/Instructor.js");
const Course = require("../../models/student/Course.js");
const Enrollment = require("../../models/student/Enrollment.js");
const JobSeeker = require("../../models/jobSeeker/JobSeeker.js");
const Recruiter = require("../../models/jobPoster/Recruiter.js");
const Job = require("../../models/jobPoster/Job.js");
const Post = require("../../models/shared/Post.js");
const AdminSetting = require("../../models/admin/AdminSetting.js");
const Category = require("../../models/shared/Category.js");
const CommissionRule = require("../../models/shared/CommissionRule.js");
const Dispute = require("../../models/admin/Dispute.js");
const SupportTicket = require("../../models/admin/SupportTicket.js");
const RolePermission = require("../../models/admin/RolePermission.js");
const EcommReview = require("../../models/shared/EcommReview.js");
const Review = require("../../models/shared/Review.js");
const ReviewInstructor = require("../../models/student/ReviewInstructor.js");
const Application = require("../../models/jobPoster/Application.js");
const Plan = require("../../models/jobPoster/Plan.js");
const AuditLog = require("../../models/shared/AuditLog.js");
const AdminSettingHistory = require("../../models/admin/AdminSettingHistory.js");
const Community = require("../../models/shared/Community.js");
const Inspiration = require("../../models/shared/Inspiration.js");
const { formatModerationReview } = require("../../utils/reviewModeration.js");
const orderController = require("../ecommUser/orderController.js");
const { normalizeShippingFields, validateShippingForActive } = require("../../utils/shippingFields.js");
const { createRazorpayRefund } = require("../../services/razorpayService.js");
const { recordRefund } = require("../../services/vendorEarningsService.js");

const PRODUCT_AVAILABILITY = new Set(["sale", "rent", "both"]);
const ORDER_STATUSES = new Set(["pending", "confirmed", "completed", "cancelled"]);
const PAYMENT_STATUSES = new Set(["pending", "authorized", "paid", "failed", "refunded", "partially_refunded"]);

function normalizeAvailability(value) {
  if (typeof value !== "string") return "sale";

  const normalized = value.trim().toLowerCase();
  return PRODUCT_AVAILABILITY.has(normalized) ? normalized : "sale";
}

function normalizeOrderStatus(value) {
  if (typeof value !== "string") return "pending";

  const normalized = value.trim().toLowerCase();
  return ORDER_STATUSES.has(normalized) ? normalized : "pending";
}

function normalizePaymentStatus(value) {
  if (typeof value !== "string") return "pending";

  const normalized = value.trim().toLowerCase();
  if (normalized === "partial") return "partially_refunded";
  return PAYMENT_STATUSES.has(normalized) ? normalized : "pending";
}

const { invalidateCache } = require("../../services/configService.js");

const DEFAULT_SETTINGS = {
  platformName: "Bandhan",
  supportEmail: "support@bandhan.com",
  supportPhone: "+91-9999-999-999",
  maxUploadSize: 50,
  maintenanceMode: false,
  emailNotifications: true,
  twoFactorAuth: false,
  apiRateLimit: 1000,
  jobPostingFee: 499,
  serviceFee: 150,
  taxRate: 0.08,
  platformFee: 50,
  gstRate: 0.18,
  defaultCurrency: "INR",
  jwtExpiry: "7d",
  otpExpiryMinutes: 10,
  paginationLimit: 12,
  rentalReturnWindowHours: 24,
  defaultReturnPolicy: "7-day return policy",
  catalogFilters: {
    sortOptions: [
      { value: "recommended", label: "Recommended" },
      { value: "price-low", label: "Price: Low to High" },
      { value: "price-high", label: "Price: High to Low" },
      { value: "rating", label: "Rating" },
    ],
    productModes: ["buy", "rent"],
    venueTypes: [],
    serviceTypes: [],
    jobIndustries: [],
    companySizes: [],
    courseLevels: [],
    eventTypes: [],
    jobCategories: [],
    jobTypes: [],
    experienceLevels: [],
    courseCategories: [],
    ratingSteps: [3, 4, 4.5],
  },
};

async function getPlatformSettings() {
  let settings = await AdminSetting.findOne({ key: "platform" });
  if (!settings) {
    settings = await AdminSetting.create({ key: "platform", ...DEFAULT_SETTINGS });
  }
  return settings;
}

async function ensureRoleSeed() {
  const count = await RolePermission.countDocuments();
  if (count > 0) return;

  await RolePermission.insertMany([
    {
      role: "admin",
      description: "Platform administrators",
      permissions: ["users.read", "users.write", "moderation.all", "support.all", "settings.write"],
      isSystem: true,
    },
    {
      role: "support",
      description: "Support operations",
      permissions: ["support.read", "support.write", "disputes.read", "disputes.write"],
      isSystem: true,
    },
    {
      role: "moderator",
      description: "Content and listing moderation",
      permissions: ["dashboard.read", "users.read", "moderation.jobs", "moderation.products", "moderation.posts", "moderation.reviews"],
      isSystem: true,
    },
    {
      role: "sub_admin",
      description: "Limited operations access",
      permissions: ["dashboard.read", "users.read", "moderation.reviews"],
      isSystem: true,
    },
  ]);
}

async function ensureGovernanceSeed() {
  if ((await Category.countDocuments()) === 0) {
    await Category.insertMany([
      { name: "Events", subcategories: ["Decoration", "Photography", "Catering"], isActive: true },
      { name: "Learning", subcategories: ["Programming", "Design", "Business"], isActive: true },
      { name: "Jobs", subcategories: ["Software", "Marketing", "Finance"], isActive: true },
    ]);
  }

  if ((await CommissionRule.countDocuments()) === 0) {
    await CommissionRule.insertMany([
      { category: "Events", type: "percentage", value: 10, isActive: true },
      { category: "Learning", type: "percentage", value: 12, isActive: true },
      { category: "Jobs", type: "fixed", value: 499, isActive: true },
    ]);
  }

  if ((await Dispute.countDocuments()) === 0) {
    await Dispute.create({
      title: "Refund not received",
      type: "refund",
      status: "open",
      raisedBy: "buyer",
      referenceId: "ORD-001",
      resolution: "",
    });
  }

  if ((await SupportTicket.countDocuments()) === 0) {
    await SupportTicket.create({
      subject: "Unable to upload course video",
      status: "open",
      priority: "medium",
      requester: "instructor@bandhan.com",
    });
  }
}

// ==================== DASHBOARD ====================
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalOrders, totalVenues] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Venue.countDocuments(),
    ]);

    // Calculate revenue from orders
    const revenueData = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" }
        }
      }
    ]);

    const revenue = revenueData[0]?.totalRevenue || 0;

    // Calculate monthly stats
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [monthlyUsers, monthlyOrders] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Order.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
    ]);

    // Calculate active users (users with orders in last 30 days)
    const activeUsers = await User.aggregate([
      {
        $lookup: {
          from: "orders",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$sellerId", "$$userId"] },
                createdAt: { $gte: thirtyDaysAgo }
              }
            }
          ],
          as: "orders"
        }
      },
      {
        $match: { orders: { $ne: [] } }
      },
      {
        $count: "total"
      }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalVenues,
        revenue,
        activeUsers: activeUsers[0]?.total || 0,
        monthlyChange: {
          users: monthlyUsers,
          orders: monthlyOrders,
          revenue: revenueData[0]?.totalRevenue || 0
        }
      }
    });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== USERS ====================
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    const query = search
      ? {
          $or: [
            { fullName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
          ]
        }
      : {};

    const [users, total] = await Promise.all([
      User.find(query)
        .select("_id fullName email phone role status createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: users,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.createUser = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const fullName = String(req.body.fullName || req.body.name || "").trim();

    if (!email || !fullName) {
      return res.status(400).json({ success: false, message: "Full name and email are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "A user with this email already exists" });
    }

    const username = String(req.body.username || email.split("@")[0] || "user").trim();

    const user = await User.create({
      email,
      username,
      password: String(req.body.password),
      fullName,
      phone: String(req.body.phone || "").trim(),
      role: req.body.role || "buyer",
      status: req.body.status || "active",
      isProfileComplete: Boolean(req.body.isProfileComplete ?? true),
      onboardingStep: Number(req.body.onboardingStep || 1),
    });

    res.status(201).json({ success: true, data: user, message: "User created successfully" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data: user, message: "User updated successfully" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== PRODUCTS ====================
exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category || "";

    const skip = (page - 1) * limit;
    const query = category ? { category: { $regex: category, $options: "i" } } : {};

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("sellerId", "fullName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: products,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("sellerId", "fullName email");
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const title = String(req.body.title || req.body.name || "").trim();
    const category = String(req.body.category || "").trim();
    const sellerId = String(req.body.sellerId || req.body.userId || "").trim();
    const price = Number(req.body.price || 0);

    if (!title || !category || !sellerId || !price) {
      return res.status(400).json({ success: false, message: "Title, category, vendor, and price are required" });
    }

    const seller = await User.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ success: false, message: "Vendor user not found" });
    }

    const normalizedStatus = req.body.status === "inactive" ? "draft" : (req.body.status || "active");
    const isActive = normalizedStatus === "active";
    const isApproved = isActive && req.body.isApproved !== false;
    const isPublished = isApproved && req.body.isPublished !== false;

    const shipping = normalizeShippingFields(req.body);
    if (isActive) {
      const shippingError = validateShippingForActive({ ...shipping, shippingRequired: shipping.shippingRequired ?? true });
      if (shippingError) return res.status(400).json({ success: false, message: shippingError });
    }

    const product = await Product.create({
      sellerId,
      sellerEmail: seller.email,
      sellerName: seller.fullName || seller.email,
      title,
      name: String(req.body.name || title),
      category,
      description: String(req.body.description || "").trim(),
      sku: String(req.body.sku || `${title.toUpperCase().replace(/[^A-Z0-9]+/g, "-")}-${Date.now().toString().slice(-5)}`),
      price,
      stock: Number(req.body.stock || 0),
      status: normalizedStatus,
      // Items created by an administrator are already moderated and should be
      // visible in both Admin and the public catalogue immediately.
      isApproved,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
      stockStatus: req.body.stockStatus || "in_stock",
      productType: normalizeAvailability(req.body.productType || req.body.type),
      priceUnit: req.body.priceUnit || "fixed",
      type: normalizeAvailability(req.body.type || req.body.productType),
      images: Array.isArray(req.body.images) ? req.body.images : [],
      tags: Array.isArray(req.body.tags) ? req.body.tags : [],
      ...shipping,
    });

    const populatedProduct = await Product.findById(product._id).populate("sellerId", "fullName email");
    res.status(201).json({ success: true, data: populatedProduct, message: "Product created successfully" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const shipping = normalizeShippingFields(req.body);
    const updates = { ...req.body, ...shipping };
    if (updates.status === "inactive") {
      updates.status = "draft";
    }

    // Draft products cannot be approved or published. Active products keep any
    // explicit moderation choices sent by the Admin UI.
    if (updates.status !== undefined) {
      const isActive = updates.status === "active";
      if (!isActive) {
        updates.isApproved = false;
        updates.isPublished = false;
        updates.publishedAt = null;
      } else {
        if (updates.isApproved === undefined) updates.isApproved = true;
        if (updates.isPublished === undefined) updates.isPublished = true;
      }
    }

    if (updates.isApproved === false) {
      updates.isPublished = false;
    }
    if (updates.isPublished !== undefined) {
      updates.publishedAt = updates.isPublished ? new Date() : null;
    }

    if (updates.productType !== undefined || updates.type !== undefined) {
      const availability = normalizeAvailability(updates.productType || updates.type);
      updates.productType = availability;
      updates.type = availability;
    }

    if (updates.status === "active" || Object.keys(shipping).length > 0) {
      const existing = await Product.findById(req.params.id);
      const nextProduct = existing ? { ...existing.toObject(), ...updates } : updates;
      if (nextProduct.status === "active") {
        const shippingError = validateShippingForActive(nextProduct);
        if (shippingError) return res.status(400).json({ success: false, message: shippingError });
      }
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, data: product, message: "Product updated successfully" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== ORDERS ====================
exports.getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || "";

    const skip = (page - 1) * limit;
    const query = status
      ? { orderStatus: normalizeOrderStatus(status) }
      : {};

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const updates = { ...req.body };

    if (updates.orderStatus !== undefined || updates.status !== undefined) {
      const normalizedOrderStatus = normalizeOrderStatus(updates.orderStatus || updates.status);
      updates.orderStatus = normalizedOrderStatus;
      updates.status = normalizedOrderStatus;
    }

    if (updates.paymentStatus !== undefined) {
      updates.paymentStatus = normalizePaymentStatus(updates.paymentStatus);
    }

    const order = await Order.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, data: order, message: "Order updated successfully" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.refundOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (order.paymentStatus !== "paid") {
      return res.status(400).json({ success: false, message: "Only paid orders can be refunded" });
    }
    if (!order.razorpayPaymentId) {
      return res.status(400).json({ success: false, message: "No Razorpay payment ID found for this order" });
    }

    // A single Razorpay payment can fund several vendor sub-orders. Never
    // refund the whole charge by accident when only one vendor is targeted.
    const payment = await Payment.findOne({
      transactionId: order.razorpayPaymentId,
      orderId: order.razorpayOrderId,
    }).populate("fulfilledOrderIds");
    const relatedOrders = payment?.fulfilledOrderIds?.length ? payment.fulfilledOrderIds : [order];
    const isShared = relatedOrders.length > 1;
    const requested = req.body.amount === undefined || req.body.amount === null || req.body.amount === ""
      ? null
      : Number(req.body.amount);
    if (isShared && !(requested > 0)) {
      return res.status(400).json({
        success: false,
        message: "This payment covers multiple vendors. Enter the refund amount for this order.",
      });
    }
    if (requested !== null && (!(requested > 0) || requested > Number(order.amount) + 0.01)) {
      return res.status(400).json({ success: false, message: "Invalid refund amount" });
    }

    const amountRupees = requested !== null ? requested : Number(order.amount);
    const amountPaise = Math.round(amountRupees * 100);
    const reason = req.body.reason || "Admin initiated refund";
    const refund = await createRazorpayRefund(order.razorpayPaymentId, amountPaise, reason);
    if (!refund) return res.status(500).json({ success: false, message: "Refund failed via Razorpay" });

    order.paymentStatus = amountRupees >= Number(order.amount) - 0.01 ? "refunded" : "partially_refunded";
    order.refundedAmount = amountRupees;
    await order.save();

    if (payment) {
      const refundedSoFar = Number(payment.metadata?.refundedAmount || 0) + amountRupees;
      payment.metadata = { ...(payment.metadata?.toObject?.() || payment.metadata || {}), refundedAmount: refundedSoFar };
      payment.status = refundedSoFar >= Number(payment.totalAmount) - 0.01 ? "refunded" : "completed";
      await payment.save();
    }

    await recordRefund({ paymentId: payment?._id, orderId: order._id, amount: amountRupees });

    await AuditLog.create({
      userId: req.user?._id,
      userModel: "Admin",
      action: "refund_order",
      entity: "Order",
      entityId: order._id,
      changes: { paymentStatus: order.paymentStatus, refundId: refund.id, amount: amountRupees, reason },
      ipAddress: req.ip,
      userAgent: req.get("user-agent") || "",
      status: "success",
      details: `Refund processed for order ${order.orderId || order._id}, refund ID: ${refund.id}`,
    });

    return res.json({ success: true, refundId: refund.id, message: "Refund processed successfully" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js refundOrder:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== VENUES ====================
exports.getVenues = async (req, res) => {
  try {
    const venues = await Venue.find().sort({ createdAt: -1 });
    res.json({ success: true, data: venues });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== ANALYTICS ====================
exports.getAnalytics = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Daily revenue for past 30 days
    const dailyRevenue = await Order.aggregate([
      {
        $match: { createdAt: { $gte: thirtyDaysAgo } }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$amount" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top categories by revenue
    const topCategories = await Order.aggregate([
      {
        $match: { createdAt: { $gte: thirtyDaysAgo } }
      },
      {
        $group: {
          _id: "$service",
          revenue: { $sum: "$amount" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);

    // Panel usage statistics
    const panelStats = {
      eventOwners: await User.countDocuments({ role: "eventOwner" }),
      buyers: await User.countDocuments({ role: "buyer" }),
      vendors: await User.countDocuments({ role: "vendor" })
    };

    res.json({
      success: true,
      data: {
        dailyRevenue,
        topCategories,
        panelStats,
        period: "30 days"
      }
    });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== SETTINGS ====================
exports.getSettings = async (_req, res) => {
  try {
    const settings = await getPlatformSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const settings = await getPlatformSettings();
    Object.assign(settings, req.body || {});
    await settings.save();
    invalidateCache();

    await AdminSettingHistory.create({
      key: settings.key || "platform",
      settings: settings.toObject ? settings.toObject() : settings,
      changedBy: req.user?.id || undefined,
      changedByEmail: req.user?.email || "",
      action: "updated",
    });

    res.json({
      success: true,
      data: settings,
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== STUDENTS ====================
exports.createStudent = async (req, res) => {
  try {
    const { fullName, email, phone, experienceLevel, password } = req.body;
    if (!fullName || !email) return res.status(400).json({ success: false, message: "fullName and email are required" });
    const student = await Student.create({ fullName, email, phone, experienceLevel: experienceLevel || "Fresher", password: password || "Temp@123", accountStatus: "active" });
    res.status(201).json({ success: true, data: student, message: "Student created" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .select("_id fullName email phone experienceLevel accountStatus enrolledCourses createdAt")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: students });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });
    res.json({ success: true, data: student, message: "Student updated" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });
    res.json({ success: true, message: "Student deleted" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== INSTRUCTORS ====================
exports.createInstructor = async (req, res) => {
  try {
    const { fullName, email, headline, password } = req.body;
    if (!fullName || !email) return res.status(400).json({ success: false, message: "fullName and email are required" });
    const instructor = await Instructor.create({ fullName, email, headline: headline || "", password: password || "Temp@123", accountStatus: "active" });
    res.status(201).json({ success: true, data: instructor, message: "Instructor created" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getInstructors = async (req, res) => {
  try {
    const instructors = await Instructor.find()
      .select("_id fullName email headline accountStatus isVerified isProfileCompleted profileCompletion createdAt")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: instructors });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateInstructor = async (req, res) => {
  try {
    const instructor = await Instructor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!instructor) return res.status(404).json({ success: false, message: "Instructor not found" });
    res.json({ success: true, data: instructor, message: "Instructor updated" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteInstructor = async (req, res) => {
  try {
    const instructor = await Instructor.findByIdAndDelete(req.params.id);
    if (!instructor) return res.status(404).json({ success: false, message: "Instructor not found" });
    res.json({ success: true, message: "Instructor deleted" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== COURSES ====================
exports.createCourse = async (req, res) => {
  try {
    const { title, category, level, price, instructorId, description } = req.body;
    if (!title) return res.status(400).json({ success: false, message: "title is required" });
    const course = await Course.create({
      title, category: category || "Uncategorized", level: level || "Beginner",
      price: price || 0, instructorId: instructorId || null, description: description || "",
      status: "draft", visibility: "public", totalStudents: 0
    });
    res.status(201).json({ success: true, data: course, message: "Course created" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("instructorId", "fullName email")
      .select("_id title category level status visibility price totalStudents rating instructorId createdAt")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: courses });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    res.json({ success: true, data: course, message: "Course updated" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    res.json({ success: true, message: "Course deleted" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== ENROLLMENTS ====================
exports.getEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate("studentId", "fullName email")
      .populate("courseId", "title category level")
      .select("_id progressPercentage status lastAccessedAt completedAt createdAt studentId courseId")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: enrollments });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!enrollment) return res.status(404).json({ success: false, message: "Enrollment not found" });
    res.json({ success: true, data: enrollment, message: "Enrollment updated" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findByIdAndDelete(req.params.id);
    if (!enrollment) return res.status(404).json({ success: false, message: "Enrollment not found" });
    res.json({ success: true, message: "Enrollment deleted" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== JOB SEEKERS ====================
exports.createJobSeeker = async (req, res) => {
  try {
    const { fullName, email, phone, currentRole, experienceLevel, location, password } = req.body;
    if (!fullName || !email) return res.status(400).json({ success: false, message: "fullName and email are required" });
    const seeker = await JobSeeker.create({
      fullName, email, phone: phone || "", currentRole: currentRole || "",
      experienceLevel: experienceLevel || "Fresher", location: location || "",
      password: password || "Temp@123"
    });
    res.status(201).json({ success: true, data: seeker, message: "Job seeker created" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getJobSeekers = async (_req, res) => {
  try {
    const seekers = await JobSeeker.find()
      .select("_id fullName email phone currentRole experienceLevel location createdAt")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: seekers });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateJobSeeker = async (req, res) => {
  try {
    const seeker = await JobSeeker.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!seeker) return res.status(404).json({ success: false, message: "Job seeker not found" });
    res.json({ success: true, data: seeker, message: "Job seeker updated" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteJobSeeker = async (req, res) => {
  try {
    const seeker = await JobSeeker.findByIdAndDelete(req.params.id);
    if (!seeker) return res.status(404).json({ success: false, message: "Job seeker not found" });
    res.json({ success: true, message: "Job seeker deleted" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== JOB POSTERS ====================
exports.createJobPoster = async (req, res) => {
  try {
    const { companyName, companyEmail, industry, companySize, websiteUrl, password } = req.body;
    if (!companyName || !companyEmail) return res.status(400).json({ success: false, message: "companyName and companyEmail are required" });
    const poster = await Recruiter.create({
      companyName, companyEmail, industry: industry || "", companySize: companySize || "1-10",
      websiteUrl: websiteUrl || "", password: password || "Temp@123", profileCompleted: false
    });
    res.status(201).json({ success: true, data: poster, message: "Job poster created" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getJobPosters = async (_req, res) => {
  try {
    const posters = await Recruiter.find()
      .select("_id companyName companyEmail industry companySize profileCompleted websiteUrl createdAt")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: posters });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Job applications are a cross-portal administrative record.  Keep this
// endpoint populated so the admin view has the same source of truth as the
// recruiter applicant list.
exports.getApplications = async (_req, res) => {
  try {
    const applications = await Application.find({ isDraft: false })
      .populate("jobId", "jobTitle")
      .populate("seekerId", "fullName email")
      .sort({ submittedAt: -1, createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, data: applications });
  } catch (error) {
    console.error("Error loading admin job applications:", error);
    return res.status(500).json({ success: false, message: "Unable to load job applications" });
  }
};

exports.updateJobPoster = async (req, res) => {
  try {
    const poster = await Recruiter.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!poster) return res.status(404).json({ success: false, message: "Job poster not found" });
    res.json({ success: true, data: poster, message: "Job poster updated" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteJobPoster = async (req, res) => {
  try {
    const poster = await Recruiter.findByIdAndDelete(req.params.id);
    if (!poster) return res.status(404).json({ success: false, message: "Job poster not found" });
    res.json({ success: true, message: "Job poster deleted" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== JOB MODERATION ====================
exports.getJobModerationQueue = async (_req, res) => {
  try {
    const jobs = await Job.find()
      .populate("recruiterId", "companyName companyEmail")
      .select("_id jobTitle jobCategory status isFeatured featuredPlan promotionStatus createdAt recruiterId")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: jobs });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateJobModeration = async (req, res) => {
  try {
    const updates = {};
    const allowedStatus = new Set(["draft", "active", "closed"]);

    if (typeof req.body.status === "string" && allowedStatus.has(req.body.status)) {
      updates.status = req.body.status;
    }

    if (typeof req.body.isFeatured === "boolean") {
      updates.isFeatured = req.body.isFeatured;
      updates.promotionStatus = req.body.isFeatured ? "active" : "none";
      updates.featuredPlan = req.body.isFeatured ? (req.body.featuredPlan || "Featured") : "";
    }

    const job = await Job.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    res.json({ success: true, data: job, message: "Job moderation updated" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getProductModerationQueue = async (_req, res) => {
  try {
    const products = await Product.find()
      .populate("sellerId", "fullName email")
      .select("_id title category status isFeatured createdAt sellerId")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: products });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateProductModeration = async (req, res) => {
  try {
    const updates = {};
    if (req.body.status === "active" || req.body.status === "draft") {
      updates.status = req.body.status;
      if (req.body.status === "active") {
        updates.isApproved = true;
        updates.isPublished = true;
      } else {
        updates.isPublished = false;
      }
    }
    if (typeof req.body.isFeatured === "boolean") {
      updates.isFeatured = req.body.isFeatured;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, data: product, message: "Product moderation updated" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== REVIEW MODERATION ====================
const REVIEW_MODERATION_STATUSES = new Set(["pending", "approved", "rejected"]);
const REVIEW_MODERATION_ITEM_TYPES = new Set(["product", "venue", "service", "vendor"]);

exports.getReviewModerationQueue = async (req, res) => {
  try {
    const status = String(req.query.status || "").toLowerCase();
    const itemType = String(req.query.itemType || "").toLowerCase();

    let statusFilter = {};
    if (REVIEW_MODERATION_STATUSES.has(status)) {
      statusFilter = status === "pending"
        ? { status: { $in: [null, "pending"] } }
        : { status };
    }

    const queries = [];
    if (!itemType || itemType === "product") {
      queries.push(
        Review.find(statusFilter)
          .populate("userId", "fullName name")
          .sort({ createdAt: -1 })
          .lean()
      );
    }
    if (!itemType || REVIEW_MODERATION_ITEM_TYPES.has(itemType)) {
      const ecommFilter = { ...statusFilter };
      if (itemType && itemType !== "vendor") ecommFilter.itemType = itemType;
      queries.push(
        EcommReview.find(ecommFilter)
          .populate("userId", "fullName name")
          .sort({ createdAt: -1 })
          .lean()
      );
    }

    const groups = await Promise.all(queries);
    const data = groups
      .flat()
      .map((review) => formatModerationReview(review))
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    res.json({ success: true, data });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateReviewModeration = async (req, res) => {
  try {
    const status = String(req.body.status || "").toLowerCase();
    if (status !== "approved" && status !== "rejected") {
      return res.status(400).json({ success: false, message: "Status must be approved or rejected" });
    }

    const itemType = String(req.body.itemType || "").toLowerCase();
    let models = [Review, EcommReview];
    if (itemType === "product") models = [Review];
    else if (itemType === "venue" || itemType === "service") models = [EcommReview];

    const update = { status, isVisible: status === "approved" };
    const results = await Promise.all(
      models.map((Model) =>
        Model.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).lean()
      )
    );
    const review = results.find(Boolean);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    res.json({ success: true, data: formatModerationReview(review) });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getContentModerationQueue = async (_req, res) => {
  try {
    const posts = await Post.find()
      .populate("userId", "fullName email")
      .select("_id content image video createdAt updatedAt userId")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: posts });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.removeContentPost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }
    res.json({ success: true, message: "Post removed" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getRolePermissions = async (_req, res) => {
  try {
    await ensureRoleSeed();
    const records = await RolePermission.find().sort({ role: 1 });
    res.json({ success: true, data: records });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.createRolePermission = async (req, res) => {
  try {
    const role = String(req.body.role || "").trim().toLowerCase();
    if (!role) {
      return res.status(400).json({ success: false, message: "Role is required" });
    }

    const created = await RolePermission.create({
      role,
      description: String(req.body.description || "").trim(),
      permissions: Array.isArray(req.body.permissions)
        ? req.body.permissions.map((item) => String(item).trim()).filter(Boolean)
        : [],
      isSystem: false,
    });

    res.status(201).json({ success: true, data: created, message: "Role created" });
  } catch (error) {
    if (error?.code === 11000) {
      
    console.error("Error in controllers/admin/adminController.js:", error);
return res.status(409).json({ success: false, message: "Role already exists" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateRolePermission = async (req, res) => {
  try {
    const role = await RolePermission.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ success: false, message: "Role not found" });
    }

    if (role.isSystem && req.body.role && req.body.role !== role.role) {
      return res.status(400).json({ success: false, message: "System roles cannot be renamed" });
    }

    if (req.body.role) role.role = String(req.body.role).trim().toLowerCase();
    if (req.body.description !== undefined) role.description = String(req.body.description || "").trim();
    if (Array.isArray(req.body.permissions)) {
      role.permissions = req.body.permissions.map((item) => String(item).trim()).filter(Boolean);
    }

    await role.save();
    res.json({ success: true, data: role, message: "Role updated" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteRolePermission = async (req, res) => {
  try {
    const role = await RolePermission.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ success: false, message: "Role not found" });
    }
    if (role.isSystem) {
      return res.status(400).json({ success: false, message: "System roles cannot be deleted" });
    }
    await role.deleteOne();
    res.json({ success: true, message: "Role deleted" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== CATEGORY MANAGEMENT ====================
exports.getCategories = async (_req, res) => {
  try {
    await ensureGovernanceSeed();
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    if (!name) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    const category = await Category.create({
      name,
      subcategories: Array.isArray(req.body.subcategories)
        ? req.body.subcategories.map((item) => String(item).trim()).filter(Boolean)
        : [],
      scopes: Array.isArray(req.body.scopes) && req.body.scopes.length
        ? req.body.scopes.filter((scope) => ["products", "services", "venues", "courses", "jobs"].includes(scope))
        : ["products"],
      isActive: req.body.isActive !== false,
    });

    res.status(201).json({ success: true, data: category, message: "Category created" });
  } catch (error) {
    if (error?.code === 11000) {
      
    console.error("Error in controllers/admin/adminController.js:", error);
return res.status(409).json({ success: false, message: "Category already exists" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = String(req.body.name).trim();
    if (Array.isArray(req.body.subcategories)) {
      updates.subcategories = req.body.subcategories.map((item) => String(item).trim()).filter(Boolean);
    }
    if (Array.isArray(req.body.scopes)) {
      updates.scopes = req.body.scopes.filter((scope) => ["products", "services", "venues", "courses", "jobs"].includes(scope));
    }
    if (typeof req.body.isActive === "boolean") updates.isActive = req.body.isActive;

    const category = await Category.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.json({ success: true, data: category, message: "Category updated" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== COMMISSION RULES ====================
exports.getCommissionRules = async (_req, res) => {
  try {
    await ensureGovernanceSeed();
    const rules = await CommissionRule.find().sort({ createdAt: -1 });
    res.json({ success: true, data: rules });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.createCommissionRule = async (req, res) => {
  try {
    const category = String(req.body.category || "").trim();
    const type = req.body.type === "fixed" ? "fixed" : "percentage";
    const value = Number(req.body.value || 0);

    if (!category || !value) {
      return res.status(400).json({ success: false, message: "Category and commission value are required" });
    }

    const rule = await CommissionRule.create({
      category,
      type,
      value,
      isActive: req.body.isActive !== false,
    });

    res.status(201).json({ success: true, data: rule, message: "Commission rule created" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateCommissionRule = async (req, res) => {
  try {
    const updates = {};
    if (req.body.category) updates.category = String(req.body.category).trim();
    if (req.body.type === "fixed" || req.body.type === "percentage") updates.type = req.body.type;
    if (req.body.value !== undefined) updates.value = Number(req.body.value);
    if (typeof req.body.isActive === "boolean") updates.isActive = req.body.isActive;

    const rule = await CommissionRule.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!rule) {
      return res.status(404).json({ success: false, message: "Commission rule not found" });
    }

    res.json({ success: true, data: rule, message: "Commission rule updated" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteCommissionRule = async (req, res) => {
  try {
    const rule = await CommissionRule.findByIdAndDelete(req.params.id);
    if (!rule) {
      return res.status(404).json({ success: false, message: "Commission rule not found" });
    }

    res.json({ success: true, message: "Commission rule deleted" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== FEATURED LISTINGS ====================
exports.getFeaturedListings = async (_req, res) => {
  try {
    const [products, jobs, courses] = await Promise.all([
      Product.find({ isFeatured: true }).select("_id title category createdAt"),
      Job.find({ isFeatured: true }).select("_id jobTitle jobCategory createdAt"),
      Course.find({ featured: true }).select("_id title category createdAt"),
    ]);

    res.json({
      success: true,
      data: {
        products,
        jobs,
        courses,
      },
    });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== JOB POSTING FEE ====================
exports.getJobPostingFee = async (_req, res) => {
  try {
    const settings = await getPlatformSettings();
    res.json({ success: true, data: { fee: Number(settings.jobPostingFee || 0) } });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateJobPostingFee = async (req, res) => {
  try {
    const fee = Number(req.body.fee || 0);
    if (fee < 0) {
      return res.status(400).json({ success: false, message: "Fee must be non-negative" });
    }

    const settings = await getPlatformSettings();
    settings.jobPostingFee = fee;
    await settings.save();

    res.json({ success: true, data: { fee }, message: "Job posting fee updated" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== DISPUTES ====================
exports.getDisputes = async (_req, res) => {
  try {
    await ensureGovernanceSeed();
    const records = await Dispute.find().sort({ createdAt: -1 });
    res.json({ success: true, data: records });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateDispute = async (req, res) => {
  try {
    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) {
      return res.status(404).json({ success: false, message: "Dispute not found" });
    }

    const nextStatus = req.body.status || dispute.status;
    const nextResolution = req.body.resolution || dispute.resolution;
    dispute.status = nextStatus;
    dispute.resolution = nextResolution;
    dispute.updates.push({ status: nextStatus, resolution: nextResolution, actor: "admin" });
    await dispute.save();

    res.json({ success: true, data: dispute, message: "Dispute updated" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== SUPPORT TICKETS ====================
exports.getSupportTickets = async (_req, res) => {
  try {
    await ensureGovernanceSeed();
    const records = await SupportTicket.find().sort({ createdAt: -1 });
    res.json({ success: true, data: records });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateSupportTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Support ticket not found" });
    }

    const nextStatus = req.body.status || ticket.status;
    ticket.status = nextStatus;
    if (req.body.priority) ticket.priority = req.body.priority;
    if (req.body.assignedTo !== undefined) ticket.assignedTo = String(req.body.assignedTo || "");
    ticket.updates.push({ status: nextStatus, note: String(req.body.note || ""), actor: "admin" });
    await ticket.save();

    res.json({ success: true, data: ticket, message: "Support ticket updated" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== ENHANCED SELLER/MERCHANT VIEWS ====================
exports.getSellersWithReviews = async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ["vendor", "seller", "merchant"] } })
      .select("_id fullName email phone role accountStatus createdAt")
      .sort({ createdAt: -1 });

    const sellerIds = users.map(u => u._id);

    const [productCounts, orderCounts, reviewAgg, ecommReviewAgg] = await Promise.all([
      Product.aggregate([
        { $match: { userId: { $in: sellerIds } } },
        { $group: { _id: "$userId", count: { $sum: 1 }, totalSales: { $sum: "$orders" } } }
      ]),
      Order.aggregate([
        { $match: { sellerId: { $in: sellerIds } } },
        { $group: { _id: "$sellerId", count: { $sum: 1 }, revenue: { $sum: "$amount" } } }
      ]),
      Review.aggregate([
        { $match: { sellerId: { $in: sellerIds } } },
        { $group: { _id: "$sellerId", avgRating: { $avg: "$rating" }, reviewCount: { $sum: 1 } } }
      ]),
      EcommReview.aggregate([
        { $match: { itemId: { $in: sellerIds }, itemType: "vendor" } },
        { $group: { _id: "$itemId", avgRating: { $avg: "$rating" }, reviewCount: { $sum: 1 } } }
      ])
    ]);

    const productMap = new Map(productCounts.map(p => [String(p._id), p]));
    const orderMap = new Map(orderCounts.map(o => [String(o._id), o]));
    const reviewMap = new Map(reviewAgg.map(r => [String(r._id), r]));
    const ecommMap = new Map(ecommReviewAgg.map(r => [String(r._id), r]));

    const data = users.map(u => {
      const id = String(u._id);
      const pc = productMap.get(id) || { count: 0, totalSales: 0 };
      const oc = orderMap.get(id) || { count: 0, revenue: 0 };
      const rv = reviewMap.get(id) || { avgRating: 0, reviewCount: 0 };
      const er = ecommMap.get(id) || { avgRating: 0, reviewCount: 0 };
      const totalReviews = rv.reviewCount + er.reviewCount;
      const avgRating = totalReviews > 0
        ? ((rv.avgRating * rv.reviewCount) + (er.avgRating * er.reviewCount)) / totalReviews
        : 0;

      return {
        _id: u._id,
        fullName: u.fullName,
        email: u.email,
        phone: u.phone,
        role: u.role,
        accountStatus: u.accountStatus || "active",
        totalProducts: pc.count,
        totalSales: pc.totalSales || 0,
        totalOrders: oc.count,
        revenue: oc.revenue || 0,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: totalReviews,
        createdAt: u.createdAt,
      };
    });

    res.json({ success: true, data });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getSellerReviews = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const [reviewDocs, ecommDocs] = await Promise.all([
      Review.find({ sellerId }).sort({ createdAt: -1 }).limit(100),
      EcommReview.find({ itemId: sellerId, itemType: "vendor" }).sort({ createdAt: -1 }).limit(100)
    ]);

    const reviews = [
      ...reviewDocs.map(r => ({
        _id: r._id,
        rating: r.rating,
        title: r.title || "",
        comment: r.comment || r.review || "",
        customerName: r.customerName || "Anonymous",
        productName: r.productName || "",
        sellerReply: r.sellerReply || "",
        source: "product",
        createdAt: r.createdAt,
      })),
      ...ecommDocs.map(r => ({
        _id: r._id,
        rating: r.rating,
        title: r.title || "",
        comment: r.comment || "",
        customerName: "Customer",
        productName: "",
        sellerReply: r.sellerReply || "",
        source: r.itemType,
        createdAt: r.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.suspendSeller = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "Seller not found" });

    user.accountStatus = req.body.status || "suspended";
    await user.save();

    res.json({ success: true, data: user, message: `Seller ${user.accountStatus}` });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== ENHANCED INSTRUCTOR VIEWS ====================
exports.getInstructorsWithReviews = async (req, res) => {
  try {
    const instructors = await Instructor.find()
      .select("_id fullName email headline accountStatus isVerified isProfileCompleted profileCompletion createdAt")
      .sort({ createdAt: -1 });

    const instructorIds = instructors.map(i => i._id);

    const [courseCounts, reviewAgg] = await Promise.all([
      Course.aggregate([
        { $match: { instructorId: { $in: instructorIds } } },
        { $group: { _id: "$instructorId", count: { $sum: 1 }, totalStudents: { $sum: "$totalStudents" } } }
      ]),
      ReviewInstructor.aggregate([
        { $lookup: { from: "courses", localField: "courseId", foreignField: "_id", as: "course" } },
        { $unwind: "$course" },
        { $match: { "course.instructorId": { $in: instructorIds } } },
        { $group: { _id: "$course.instructorId", avgRating: { $avg: "$rating" }, reviewCount: { $sum: 1 } } }
      ])
    ]);

    const courseMap = new Map(courseCounts.map(c => [String(c._id), c]));
    const reviewMap = new Map(reviewAgg.map(r => [String(r._id), r]));

    const data = instructors.map(i => {
      const id = String(i._id);
      const cc = courseMap.get(id) || { count: 0, totalStudents: 0 };
      const rv = reviewMap.get(id) || { avgRating: 0, reviewCount: 0 };

      return {
        _id: i._id,
        fullName: i.fullName,
        email: i.email,
        headline: i.headline,
        accountStatus: i.accountStatus || "pending",
        isVerified: i.isVerified,
        profileCompletion: i.profileCompletion || 0,
        totalCourses: cc.count,
        totalStudents: cc.totalStudents || 0,
        avgRating: Math.round((rv.avgRating || 0) * 10) / 10,
        reviewCount: rv.reviewCount || 0,
        createdAt: i.createdAt,
      };
    });

    res.json({ success: true, data });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getInstructorReviews = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const courses = await Course.find({ instructorId }).select("_id title");
    const courseIds = courses.map(c => c._id);
    const courseMap = new Map(courses.map(c => [String(c._id), c.title]));

    const reviews = await ReviewInstructor.find({ courseId: { $in: courseIds } })
      .populate("studentId", "fullName")
      .sort({ createdAt: -1 })
      .limit(100);

    const data = reviews.map(r => ({
      _id: r._id,
      rating: r.rating,
      review: r.review,
      courseName: courseMap.get(String(r.courseId)) || "Unknown Course",
      studentName: r.studentId?.fullName || "Unknown Student",
      instructorResponse: r.instructorResponse || "",
      createdAt: r.createdAt,
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateInstructorStatus = async (req, res) => {
  try {
    const instructor = await Instructor.findById(req.params.id);
    if (!instructor) return res.status(404).json({ success: false, message: "Instructor not found" });

    if (req.body.accountStatus) instructor.accountStatus = req.body.accountStatus;
    if (typeof req.body.isVerified === "boolean") instructor.isVerified = req.body.isVerified;
    await instructor.save();

    res.json({ success: true, data: instructor, message: "Instructor updated" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== ENHANCED JOB POSTER VIEWS ====================
exports.getJobPostersWithJobs = async (req, res) => {
  try {
    const posters = await Recruiter.find()
      .select("_id companyName companyEmail industry companySize profileCompleted websiteUrl createdAt")
      .sort({ createdAt: -1 });

    const posterIds = posters.map(p => p._id);

    const [jobCounts, applicationCounts] = await Promise.all([
      Job.aggregate([
        { $match: { recruiterId: { $in: posterIds } } },
        { $group: { _id: "$recruiterId", count: { $sum: 1 }, activeJobs: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } } } }
      ]),
      Application.aggregate([
        { $lookup: { from: "jobs", localField: "jobId", foreignField: "_id", as: "job" } },
        { $unwind: "$job" },
        { $match: { "job.recruiterId": { $in: posterIds } } },
        { $group: { _id: "$job.recruiterId", count: { $sum: 1 } } }
      ])
    ]);

    const jobMap = new Map(jobCounts.map(j => [String(j._id), j]));
    const appMap = new Map(applicationCounts.map(a => [String(a._id), a]));

    const data = posters.map(p => {
      const id = String(p._id);
      const jc = jobMap.get(id) || { count: 0, activeJobs: 0 };
      const ac = appMap.get(id) || { count: 0 };

      return {
        _id: p._id,
        companyName: p.companyName,
        companyEmail: p.companyEmail,
        industry: p.industry,
        companySize: p.companySize,
        profileCompleted: p.profileCompleted,
        websiteUrl: p.websiteUrl,
        totalJobs: jc.count,
        activeJobs: jc.activeJobs,
        totalApplications: ac.count,
        createdAt: p.createdAt,
      };
    });

    res.json({ success: true, data });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getJobPosterJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiterId: req.params.posterId })
      .select("_id jobTitle jobCategory location salary status isFeatured applicantCount createdAt")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: jobs });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateJobPosterStatus = async (req, res) => {
  try {
    const poster = await Recruiter.findById(req.params.id);
    if (!poster) return res.status(404).json({ success: false, message: "Job poster not found" });

    if (req.body.status) {
      poster.accountStatus = req.body.status;
    }
    await poster.save();

    res.json({ success: true, data: poster, message: "Job poster updated" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== VENUE MANAGEMENT ====================
exports.getVenueDetails = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) return res.status(404).json({ success: false, message: "Venue not found" });

    const reviews = await EcommReview.find({ itemId: venue._id, itemType: "venue" })
      .populate("userId", "fullName")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: {
        ...venue.toObject(),
        reviewList: reviews.map(r => ({
          _id: r._id,
          rating: r.rating,
          title: r.title || "",
          comment: r.comment || "",
          customerName: r.userId?.fullName || "Anonymous",
          createdAt: r.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateVenue = async (req, res) => {
  try {
    const venue = await Venue.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!venue) return res.status(404).json({ success: false, message: "Venue not found" });
    res.json({ success: true, data: venue, message: "Venue updated" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteVenue = async (req, res) => {
  try {
    const venue = await Venue.findByIdAndDelete(req.params.id);
    if (!venue) return res.status(404).json({ success: false, message: "Venue not found" });
    res.json({ success: true, message: "Venue deleted" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============= Blog Management =============

const Blog = require("../../models/shared/Blog.js");

exports.getBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, q } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (q) filter.title = { $regex: q, $options: "i" };

    const blogs = await Blog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments(filter);

    res.json({ success: true, data: blogs, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.createBlog = async (req, res) => {
  try {
    const blog = await Blog.create({
      title: req.body.title,
      content: req.body.content,
      author: req.user.id,
      category: req.body.category || "",
      status: req.body.status || "draft",
      featured: req.body.featured || false,
      seoTitle: req.body.seoTitle || "",
      seoDescription: req.body.seoDescription || "",
      seoTags: req.body.seoTags || [],
    });

    res.status(201).json({ success: true, data: blog, message: "Blog created" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });
    res.json({ success: true, data: blog });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

    if (req.body.title !== undefined) blog.title = req.body.title;
    if (req.body.content !== undefined) blog.content = req.body.content;
    if (req.body.category !== undefined) blog.category = req.body.category;
    if (req.body.status !== undefined) blog.status = req.body.status;
    if (req.body.featured !== undefined) blog.featured = req.body.featured;
    if (req.body.seoTitle !== undefined) blog.seoTitle = req.body.seoTitle;
    if (req.body.seoDescription !== undefined) blog.seoDescription = req.body.seoDescription;
    if (req.body.seoTags !== undefined) blog.seoTags = req.body.seoTags;

    await blog.save();
    res.json({ success: true, data: blog, message: "Blog updated" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });
    res.json({ success: true, message: "Blog deleted" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============= Banner Management =============

const Banner = require("../../models/shared/Banner.js");

exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json({ success: true, data: banners });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.createBanner = async (req, res) => {
  try {
    const banner = await Banner.create({
      title: req.body.title,
      subtitle: req.body.subtitle,
      image: req.body.image,
      buttonText: req.body.buttonText,
    });

    res.status(201).json({ success: true, data: banner, message: "Banner created" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: "Banner not found" });

    if (req.body.title !== undefined) banner.title = req.body.title;
    if (req.body.subtitle !== undefined) banner.subtitle = req.body.subtitle;
    if (req.body.image !== undefined) banner.image = req.body.image;
    if (req.body.buttonText !== undefined) banner.buttonText = req.body.buttonText;

    await banner.save();
    res.json({ success: true, data: banner, message: "Banner updated" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: "Banner not found" });
    res.json({ success: true, message: "Banner deleted" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============= Rental Order Management =============

const RentalOrder = require("../../models/shared/RentalOrder.js");

exports.getRentalOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, paymentStatus } = req.query;
    const filter = {};
    if (status) filter.rentalStatus = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const rentals = await RentalOrder.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("userId", "name email")
      .populate("sellerId", "name email")
      .populate("productId", "title images");

    const total = await RentalOrder.countDocuments(filter);

    res.json({ success: true, data: rentals, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getRentalOrderById = async (req, res) => {
  try {
    const rental = await RentalOrder.findById(req.params.id)
      .populate("userId", "name email phone")
      .populate("sellerId", "name email phone")
      .populate("productId", "title images price rentalPrice specifications");

    if (!rental) return res.status(404).json({ success: false, message: "Rental order not found" });
    res.json({ success: true, data: rental });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateRentalOrder = async (req, res) => {
  try {
    const rental = await RentalOrder.findById(req.params.id);
    if (!rental) return res.status(404).json({ success: false, message: "Rental order not found" });

    if (req.body.rentalStatus) rental.rentalStatus = req.body.rentalStatus;
    if (req.body.paymentStatus) rental.paymentStatus = req.body.paymentStatus;
    if (req.body.adminNotes !== undefined) rental.adminNotes = req.body.adminNotes;

    await rental.save();
    res.json({ success: true, data: rental, message: "Rental order updated" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===== Plan Management =====

exports.getPlans = async (req, res) => {
  try {
    const plans = await Plan.find().sort({ price: 1 });
    res.json({ success: true, data: plans });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.createPlan = async (req, res) => {
  try {
    const { planName, price, duration, description, features, isActive } = req.body;
    if (!planName || price === undefined || !duration) {
      return res.status(400).json({ success: false, message: "Plan name, price, and duration are required." });
    }
    const existing = await Plan.findOne({ planName });
    if (existing) {
      return res.status(400).json({ success: false, message: "A plan with this name already exists." });
    }
    const plan = await Plan.create({ planName, price, duration, description, features, isActive });
    res.status(201).json({ success: true, data: plan, message: "Plan created successfully." });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found." });
    }
    res.json({ success: true, data: plan, message: "Plan updated successfully." });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found." });
    }
    res.json({ success: true, message: "Plan deleted successfully." });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== MANUAL SELLER VERIFICATION ====================

function formatSellerVerification(record) {
  const seller = record.ownerId || {};
  return {
    id: String(record._id),
    sellerId: String(record.ownerId),
    sellerName: seller.fullName || seller.name || "",
    sellerEmail: seller.email || "",
    sellerPhone: seller.phone || "",
    provider: record.provider,
    status: record.status,
    businessName: record.businessName || "",
    documents: record.documents || {},
    submittedAt: record.submittedAt,
    reviewedAt: record.reviewedAt,
    verifiedAt: record.verifiedAt,
    rejectionReason: record.rejectionReason || "",
  };
}

exports.getSellerVerifications = async (req, res) => {
  try {
    const filter = { ownerType: "seller" };
    if (["pending", "verified", "rejected"].includes(req.query.status)) filter.status = req.query.status;
    const records = await IdentityVerification.find(filter)
      .populate("ownerId", "fullName name email phone")
      .sort({ submittedAt: -1, createdAt: -1 })
      .lean();
    res.json({ success: true, data: records.map(formatSellerVerification) });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js getSellerVerifications:", error);
    res.status(500).json({ success: false, message: "Unable to load seller verifications" });
  }
};

exports.reviewSellerVerification = async (req, res) => {
  try {
    const { action, rejectionReason } = req.body || {};
    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ success: false, message: "Action must be approve or reject" });
    }
    if (action === "reject" && !String(rejectionReason || "").trim()) {
      return res.status(400).json({ success: false, message: "A rejection reason is required" });
    }
    const record = await IdentityVerification.findOne({ _id: req.params.id, ownerType: "seller" });
    if (!record) return res.status(404).json({ success: false, message: "Verification request not found" });

    const now = new Date();
    record.status = action === "approve" ? "verified" : "rejected";
    record.reviewedBy = req.user?._id;
    record.reviewedAt = now;
    record.verifiedAt = action === "approve" ? now : undefined;
    record.rejectionReason = action === "reject" ? String(rejectionReason).trim() : undefined;
    record.audit.push({
      action: action === "approve" ? "manual_approved" : "manual_rejected",
      at: now,
      actorId: req.user?._id,
    });
    await record.save();

    await Profile.findOneAndUpdate(
      { userId: record.ownerId },
      { $set: { isVerified: action === "approve", verificationStatus: record.status, verificationDate: now } },
      { upsert: false }
    );

    res.json({ success: true, data: formatSellerVerification(record), message: `Seller ${action === "approve" ? "approved" : "rejected"}` });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js reviewSellerVerification:", error);
    res.status(500).json({ success: false, message: "Unable to review seller verification" });
  }
};

// ==================== VENDOR PAYMENT DISTRIBUTION ====================

const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;

exports.getVendorEarnings = async (req, res) => {
  try {
    const filter = {};
    if (["product", "service", "venue"].includes(req.query.vendorType)) filter.vendorType = req.query.vendorType;
    if (["pending", "paid", "partially_refunded", "refunded"].includes(req.query.status)) filter.status = req.query.status;
    if (req.query.vendorId) filter.vendorId = req.query.vendorId;
    const earnings = await VendorEarning.find(filter)
      .populate("vendorId", "fullName name email")
      .populate("orderId", "orderId amount paymentStatus")
      .populate("bookingId", "bookingType status paymentStatus")
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();
    res.json({
      success: true,
      data: earnings.map((entry) => ({
        id: String(entry._id),
        vendorId: String(entry.vendorId?._id || entry.vendorId),
        vendorName: entry.vendorId?.fullName || entry.vendorId?.name || entry.vendorName || "Vendor",
        vendorEmail: entry.vendorId?.email || "",
        vendorType: entry.vendorType,
        orderId: entry.orderId?._id || null,
        bookingId: entry.bookingId?._id || null,
        paymentId: String(entry.paymentId),
        status: entry.status,
        grossAmount: entry.grossAmount,
        commissionRate: entry.commissionRate,
        commission: entry.commission,
        netPayable: entry.netPayable,
        refundedAmount: entry.refundedAmount || 0,
        createdAt: entry.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js getVendorEarnings:", error);
    res.status(500).json({ success: false, message: "Unable to load vendor earnings" });
  }
};

exports.getPaymentBreakdown = async (req, res) => {
  try {
    const [payments, earnings, paidBookings] = await Promise.all([
      Payment.find({ paymentFor: { $in: ["product_order", "booking"] }, status: { $in: ["completed", "refunded"] } }).lean(),
      VendorEarning.find().populate("vendorId", "fullName name email").lean(),
      Booking.countDocuments({ paymentStatus: "paid" }),
    ]);

    const byVendorType = {
      product: { gross: 0, commission: 0, payable: 0, refunded: 0, count: 0 },
      service: { gross: 0, commission: 0, payable: 0, refunded: 0, count: 0 },
      venue: { gross: 0, commission: 0, payable: 0, refunded: 0, count: 0 },
    };
    const vendorsMap = new Map();
    let commissionCollected = 0;
    let vendorPayable = 0;
    let refundedTotal = 0;

    for (const entry of earnings) {
      const gross = Number(entry.grossAmount || 0);
      const commission = Number(entry.commission || 0);
      const net = Number(entry.netPayable || 0);
      const refunded = Math.min(Number(entry.refundedAmount || 0), net);
      const commissionAfterRefund = net > 0 ? round2(commission * (1 - refunded / net)) : 0;
      const payable = Math.max(0, round2(net - refunded));
      const type = byVendorType[entry.vendorType] || byVendorType.product;
      type.gross = round2(type.gross + gross);
      type.commission = round2(type.commission + commissionAfterRefund);
      type.payable = round2(type.payable + payable);
      type.refunded = round2(type.refunded + refunded);
      type.count += 1;
      commissionCollected = round2(commissionCollected + commissionAfterRefund);
      vendorPayable = round2(vendorPayable + payable);
      refundedTotal = round2(refundedTotal + refunded);

      const vendorId = String(entry.vendorId?._id || entry.vendorId);
      const key = `${entry.vendorType}:${vendorId}`;
      const vendor = vendorsMap.get(key) || {
        vendorId,
        vendorType: entry.vendorType,
        vendorName: entry.vendorId?.fullName || entry.vendorId?.name || entry.vendorName || "Vendor",
        vendorEmail: entry.vendorId?.email || "",
        gross: 0,
        commission: 0,
        payable: 0,
        orderCount: 0,
      };
      vendor.gross = round2(vendor.gross + gross);
      vendor.commission = round2(vendor.commission + commissionAfterRefund);
      vendor.payable = round2(vendor.payable + payable);
      vendor.orderCount += 1;
      vendorsMap.set(key, vendor);
    }

    let grossCollected = 0;
    let platformServiceFees = 0;
    let taxCollected = 0;
    let gatewayRefunds = 0;
    for (const payment of payments) {
      grossCollected = round2(grossCollected + Number(payment.totalAmount || 0));
      platformServiceFees = round2(platformServiceFees + Number(payment.platformFee || 0));
      taxCollected = round2(taxCollected + Number(payment.gst || 0));
      gatewayRefunds = round2(gatewayRefunds + Number(payment.metadata?.refundedAmount || 0));
    }

    return res.json({
      success: true,
      data: {
        grossCollected: round2(grossCollected),
        platformEarned: round2(commissionCollected + platformServiceFees),
        commissionCollected,
        platformServiceFees,
        taxCollected,
        vendorPayable,
        refunded: round2(Math.max(refundedTotal, gatewayRefunds)),
        byVendorType,
        vendors: [...vendorsMap.values()].sort((a, b) => b.payable - a.payable),
        paidBookings,
        recentPayments: payments.slice(0, 20).map((payment) => ({
          id: String(payment._id),
          paymentFor: payment.paymentFor,
          totalAmount: payment.totalAmount,
          platformFee: payment.platformFee || 0,
          gst: payment.gst || 0,
          status: payment.status,
          refundedAmount: Number(payment.metadata?.refundedAmount || 0),
          createdAt: payment.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js getPaymentBreakdown:", error);
    res.status(500).json({ success: false, message: "Unable to load payment breakdown" });
  }
};

// ==================== VENUES (CREATE) ====================
exports.createVenue = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const location = String(req.body.location || "").trim();
    if (!name || !location) {
      return res.status(400).json({ success: false, message: "Venue name and location are required" });
    }

    const sellerId = String(req.body.sellerId || "").trim();
    let sellerEmail = String(req.body.sellerEmail || "").trim().toLowerCase();
    if (sellerId) {
      const seller = await User.findById(sellerId);
      if (!seller) return res.status(404).json({ success: false, message: "Vendor user not found" });
      sellerEmail = seller.email || sellerEmail;
    }

    const images = Array.isArray(req.body.images) ? req.body.images.map(String) : [];
    const venue = await Venue.create({
      sellerId: sellerId || undefined,
      sellerEmail: sellerEmail || undefined,
      name,
      venueType: req.body.venueType || "event_space",
      location,
      address: String(req.body.address || "").trim(),
      description: String(req.body.description || "").trim(),
      images,
      facilities: Array.isArray(req.body.facilities) ? req.body.facilities.map(String) : [],
      guests: Number(req.body.guests || 0),
      minGuests: Number(req.body.minGuests || 0),
      maxGuests: Number(req.body.maxGuests || 0),
      pricePerDay: Number(req.body.pricePerDay || 0),
      pricePerHour: Number(req.body.pricePerHour || 0),
      serviceFee: Number(req.body.serviceFee || 0),
      rating: Number(req.body.rating || 0),
      reviews: Number(req.body.reviews || 0),
      status: req.body.status === "draft" ? "draft" : "active",
      isApproved: req.body.isApproved !== false,
      isFeatured: Boolean(req.body.isFeatured),
      spaces: Array.isArray(req.body.spaces) ? req.body.spaces : [],
      packages: Array.isArray(req.body.packages) ? req.body.packages : [],
    });

    res.status(201).json({ success: true, data: venue, message: "Venue created successfully" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js createVenue:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== SERVICES ====================
function normalizeServiceImages(images) {
  if (Array.isArray(images)) return images.map(String).filter(Boolean);
  if (typeof images !== "string") return [];
  return images.split(/[\n,]+/).map((value) => value.trim()).filter(Boolean);
}

exports.getServices = async (_req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 }).lean();
    const sellerIds = [...new Set(services.map((service) => String(service.sellerId)).filter(Boolean))];
    const sellers = sellerIds.length ? await User.find({ _id: { $in: sellerIds } }).select("fullName email").lean() : [];
    const sellerById = new Map(sellers.map((seller) => [String(seller._id), seller]));

    res.json({
      success: true,
      data: services.map((service) => {
        const seller = sellerById.get(String(service.sellerId));
        return {
          ...service,
          sellerName: seller?.fullName || seller?.email || "",
          sellerEmail: service.sellerEmail || seller?.email || "",
        };
      }),
    });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js getServices:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.createService = async (req, res) => {
  try {
    const title = String(req.body.title || "").trim();
    const category = String(req.body.category || "").trim();
    const price = Number(req.body.price || 0);
    const location = String(req.body.location || "").trim();
    const sellerId = String(req.body.sellerId || "").trim();

    if (!title || !category || !location || !sellerId || !Number.isFinite(price)) {
      return res.status(400).json({ success: false, message: "Title, category, vendor, location and price are required" });
    }

    const seller = await User.findById(sellerId);
    if (!seller) return res.status(404).json({ success: false, message: "Vendor user not found" });

    const status = req.body.status === "draft" ? "draft" : "active";
    const service = await Service.create({
      sellerId,
      sellerEmail: String(req.body.sellerEmail || seller.email || "").toLowerCase(),
      title,
      category,
      price,
      location,
      description: String(req.body.description || "").trim(),
      eventType: req.body.eventType,
      images: normalizeServiceImages(req.body.images),
      image: normalizeServiceImages(req.body.images)[0] || "",
      status,
      isActive: status === "active" && req.body.isActive !== false,
      isFeatured: Boolean(req.body.isFeatured),
      pricingModel: req.body.pricingModel || "fixed",
      durationMinutes: Number(req.body.durationMinutes || 60),
      serviceArea: Array.isArray(req.body.serviceArea) ? req.body.serviceArea : [],
      availableDays: Array.isArray(req.body.availableDays) ? req.body.availableDays : [],
      addons: Array.isArray(req.body.addons) ? req.body.addons : [],
    });

    res.status(201).json({ success: true, data: service, message: "Service created successfully" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js createService:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateService = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.images !== undefined) {
      updates.images = normalizeServiceImages(updates.images);
      updates.image = updates.images[0] || "";
    }
    if (updates.status === "inactive") updates.status = "draft";
    if (updates.status !== undefined && updates.isActive === undefined) {
      updates.isActive = updates.status === "active";
    }
    const service = await Service.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!service) return res.status(404).json({ success: false, message: "Service not found" });
    res.json({ success: true, data: service, message: "Service updated successfully" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js updateService:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: "Service not found" });
    res.json({ success: true, message: "Service deleted successfully" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js deleteService:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== JOBS (ADMIN CREATION) ====================
exports.createJob = async (req, res) => {
  try {
    const recruiterId = String(req.body.recruiterId || "").trim();
    const jobTitle = String(req.body.jobTitle || "").trim();
    if (!recruiterId || !jobTitle) {
      return res.status(400).json({ success: false, message: "Recruiter and job title are required" });
    }

    const recruiter = await Recruiter.findById(recruiterId);
    if (!recruiter) return res.status(404).json({ success: false, message: "Recruiter not found" });

    const job = await Job.create({
      recruiterId,
      jobTitle,
      jobCategory: String(req.body.jobCategory || "Other"),
      jobType: String(req.body.jobType || "Full-time"),
      experienceLevel: String(req.body.experienceLevel || "Junior"),
      salaryMin: Number(req.body.salaryMin || 0),
      salaryMax: Number(req.body.salaryMax || 0),
      salaryCurrency: String(req.body.salaryCurrency || "INR"),
      location: String(req.body.location || ""),
      remoteAvailable: Boolean(req.body.remoteAvailable),
      aboutRole: String(req.body.aboutRole || ""),
      responsibilities: Array.isArray(req.body.responsibilities) ? req.body.responsibilities : [],
      skills: Array.isArray(req.body.skills) ? req.body.skills : [],
      applicationDeadline: req.body.applicationDeadline ? new Date(req.body.applicationDeadline) : undefined,
      openings: Number(req.body.openings || 1),
      status: String(req.body.status || "active"),
    });

    res.status(201).json({ success: true, data: job, message: "Job created successfully" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js createJob:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== SETTINGS HISTORY ====================
exports.getSettingsHistory = async (_req, res) => {
  try {
    const history = await AdminSettingHistory.find().sort({ createdAt: 1 }).limit(100).lean();
    let previous = {};
    const entries = history.map((entry, index) => {
      const settings = entry.settings || {};
      const changes = {};
      for (const key of new Set([...Object.keys(previous), ...Object.keys(settings)])) {
        if (JSON.stringify(previous[key]) !== JSON.stringify(settings[key])) {
          changes[key] = { from: previous[key] ?? null, to: settings[key] ?? null };
        }
      }
      previous = settings;
      return {
        version: index + 1,
        changedAt: entry.createdAt,
        changes,
        changedByEmail: entry.changedByEmail || "",
        action: entry.action,
      };
    });

    res.json({ success: true, data: entries.reverse() });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js getSettingsHistory:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== SHIPROCKET (ADMIN) ====================
exports.createShiprocketShipment = orderController.createShipment;
exports.assignShiprocketAwb = orderController.assignShiprocketAwb;
exports.refreshShiprocketTracking = orderController.trackShipment;

// ==================== FEATURED LISTING TOGGLE ====================
const FEATURED_LISTING_MODELS = { product: Product, service: Service, venue: Venue };

exports.toggleFeaturedListing = async (req, res) => {
  try {
    const itemType = String(req.body.itemType || "").toLowerCase();
    const Model = FEATURED_LISTING_MODELS[itemType];
    if (!Model) {
      return res.status(400).json({ success: false, message: "Invalid item type" });
    }
    if (typeof req.body.isFeatured !== "boolean") {
      return res.status(400).json({ success: false, message: "isFeatured must be a boolean" });
    }

    const updates = { isFeatured: req.body.isFeatured };
    if (Model.schema.path("featuredAt")) {
      updates.featuredAt = req.body.isFeatured ? new Date() : null;
    }
    const data = await Model.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!data) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== COMMUNITIES (ADMIN) ====================
exports.getCommunities = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) filter.name = { $regex: String(req.query.search), $options: "i" };

    const communities = await Community.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: communities });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.createCommunity = async (req, res) => {
  try {
    const community = await Community.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json({ success: true, data: community });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateCommunity = async (req, res) => {
  try {
    const community = await Community.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!community) {
      return res.status(404).json({ success: false, message: "Community not found" });
    }
    res.json({ success: true, data: community });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteCommunity = async (req, res) => {
  try {
    const community = await Community.findByIdAndDelete(req.params.id);
    if (!community) {
      return res.status(404).json({ success: false, message: "Community not found" });
    }
    res.json({ success: true, message: "Community deleted" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== EVENT TEMPLATES (ADMIN) ====================
exports.getEventTemplates = async (_req, res) => {
  try {
    const data = await EventTemplate.find().sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (error) {
    console.error("Error in adminController.getEventTemplates:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.createEventTemplate = async (req, res) => {
  try {
    const data = await EventTemplate.create(req.body || {});
    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error("Error in adminController.createEventTemplate:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateEventTemplate = async (req, res) => {
  try {
    const data = await EventTemplate.findByIdAndUpdate(req.params.id, req.body || {}, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ success: false, message: "Template not found" });
    res.json({ success: true, data });
  } catch (error) {
    console.error("Error in adminController.updateEventTemplate:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteEventTemplate = async (req, res) => {
  try {
    const data = await EventTemplate.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: "Template not found" });
    res.json({ success: true, message: "Template deleted" });
  } catch (error) {
    console.error("Error in adminController.deleteEventTemplate:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getAdminEvents = async (_req, res) => {
  try {
    const data = await Event.find().populate("owner", "email fullName name").sort({ createdAt: -1 }).lean();
    res.json({ success: true, data });
  } catch (error) {
    console.error("Error in adminController.getAdminEvents:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== INSPIRATION CMS (ADMIN) ====================
exports.getInspiration = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) filter.title = { $regex: String(req.query.search), $options: "i" };

    const stories = await Inspiration.find(filter).sort({ publishedAt: -1, createdAt: -1 });
    res.json({ success: true, data: stories });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.createInspiration = async (req, res) => {
  try {
    const story = await Inspiration.create(req.body);
    res.status(201).json({ success: true, data: story });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateInspiration = async (req, res) => {
  try {
    const story = await Inspiration.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!story) {
      return res.status(404).json({ success: false, message: "Inspiration story not found" });
    }
    res.json({ success: true, data: story });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteInspiration = async (req, res) => {
  try {
    const story = await Inspiration.findByIdAndDelete(req.params.id);
    if (!story) {
      return res.status(404).json({ success: false, message: "Inspiration story not found" });
    }
    res.json({ success: true, message: "Inspiration story deleted" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

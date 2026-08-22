const User = require("../../models/shared/User.js");
const Product = require("../../models/shared/Product.js");
const Order = require("../../models/shared/Order.js");
const Venue = require("../../models/shared/Venue.js");
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
const { createRazorpayRefund } = require("../../services/razorpayService.js");

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
      permissions: ["moderation.jobs", "moderation.products", "moderation.posts"],
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
      password: String(req.body.password || "admin_created_user"),
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
      isApproved: normalizedStatus === "active",
      isPublished: normalizedStatus === "active",
      stockStatus: req.body.stockStatus || "in_stock",
      productType: normalizeAvailability(req.body.productType || req.body.type),
      priceUnit: req.body.priceUnit || "fixed",
      type: normalizeAvailability(req.body.type || req.body.productType),
      images: Array.isArray(req.body.images) ? req.body.images : [],
      tags: Array.isArray(req.body.tags) ? req.body.tags : [],
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
    const updates = { ...req.body };
    if (updates.status === "inactive") {
      updates.status = "draft";
    }

    // Admin saves are moderation decisions. Keep the public-catalogue flags in
    // sync with the active/draft choice so an active item does not remain
    // invisible after it has been created or edited in the Admin portal.
    if (updates.status !== undefined) {
      const isActive = updates.status === "active";
      updates.isApproved = isActive;
      updates.isPublished = isActive;
      updates.publishedAt = isActive ? new Date() : null;
    }

    if (updates.productType !== undefined || updates.type !== undefined) {
      const availability = normalizeAvailability(updates.productType || updates.type);
      updates.productType = availability;
      updates.type = availability;
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
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.paymentStatus !== "paid") {
      return res.status(400).json({ success: false, message: "Only paid orders can be refunded" });
    }

    if (!order.razorpayPaymentId) {
      return res.status(400).json({ success: false, message: "No Razorpay payment ID found for this order" });
    }

    const amount = req.body.amount ? Math.round(req.body.amount * 100) : undefined;
    const reason = req.body.reason || "Admin initiated refund";

    const refund = await createRazorpayRefund(order.razorpayPaymentId, amount, reason);
    if (!refund) {
      return res.status(500).json({ success: false, message: "Refund failed via Razorpay" });
    }

    order.paymentStatus = "refunded";
    await order.save();

    await AuditLog.create({
      userId: req.user?._id,
      userModel: "Admin",
      action: "refund_order",
      entity: "Order",
      entityId: order._id,
      changes: { paymentStatus: "refunded", refundId: refund.id, amount: amount ? amount / 100 : order.amount, reason },
      ipAddress: req.ip,
      userAgent: req.get("user-agent") || "",
      status: "success",
      details: `Refund processed for order ${order.orderId || order._id}, refund ID: ${refund.id}`,
    });

    res.json({ success: true, refundId: refund.id, message: "Refund processed successfully" });
  } catch (error) {
    console.error("Error in controllers/admin/adminController.js refundOrder:", error);
    res.status(500).json({ success: false, message: "Server error" });
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

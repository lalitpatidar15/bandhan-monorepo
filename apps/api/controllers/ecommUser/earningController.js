const Earning = require("../../models/shared/Earning.js");
const Order = require("../../models/shared/Order.js");
const User = require("../../models/shared/User.js");
const Payment = require("../../models/shared/Payment.js");
const Course = require("../../models/student/Course.js");
const Settlement = require("../../models/shared/Settlement.js");
const { getAuthenticatedOwnerId, isAdmin } = require("../../utils/ownership.js");
const { calculateCommission } = require("../../services/commissionService.js");

function normalizeRange(value) {
  const normalized = String(value || "This Month").trim().toLowerCase();

  if (normalized === "today") return "Today";
  if (normalized === "this week" || normalized === "week") return "This Week";
  if (normalized === "this year" || normalized === "year") return "This Year";
  return "This Month";
}

function getRangeBounds(range) {
  const normalizedRange = normalizeRange(range);
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  if (normalizedRange === "Today") {
    return { start: startOfDay, end: endOfDay };
  }

  const start = new Date(now);
  if (normalizedRange === "This Week") {
    const day = start.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + diff);
    start.setHours(0, 0, 0, 0);
    return { start, end: endOfDay };
  }

  if (normalizedRange === "This Year") {
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
    return { start, end: endOfDay };
  }

  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return { start, end: endOfDay };
}

function buildSellerScope(req) {
  const userId = getAuthenticatedOwnerId(req) || req.user?.id || req.user?._id;
  const role = String(req.user?.role || "").toLowerCase();

  if (role === "admin" || !userId) {
    return { userId, role, filter: {} };
  }

  // Instructors are paid from course enrollments; their payments do not carry a
  // sellerId, so the authenticated id is the ownership key for both sources.
  const ownerFilter = role === "instructor"
    ? { $or: [{ sellerId: userId }, { instructorId: userId }] }
    : { sellerId: userId };

  return {
    userId,
    role,
    filter: ownerFilter,
    orderFilter: { $or: [{ sellerId: userId }, { "items.sellerId": userId }] },
  };
}

function buildDateFilter(range, fieldName = "transactionDate") {
  const { start, end } = getRangeBounds(range);
  return { [fieldName]: { $gte: start, $lte: end } };
}

// Instructor payouts come from completed course payments, not from product
// orders. Resolve them through the courses owned by req.user.id.
async function getInstructorPayments(userId, range) {
  try {
    const courses = await Course.find({ instructorId: userId }).select("_id title").lean();
    if (!courses.length) return [];

    const courseTitles = new Map(courses.map((course) => [String(course._id), course.title || "Course"]));
    const paymentFilter = {
      courseId: { $in: [...courseTitles.keys()] },
      status: { $in: ["completed", "paid"] },
    };
    if (range !== "all") Object.assign(paymentFilter, buildDateFilter(range, "createdAt"));

    const payments = await Payment.find(paymentFilter)
      .populate({
        path: "userId",
        select: "name fullName nameEn email",
        strictPopulate: false,
      })
      .sort({ createdAt: -1 })
      .lean();

    return Promise.all(payments.map(async (payment) => {
      const amount = Number(payment.totalAmount || payment.amount || 0);
      const commission = payment.platformFee !== undefined && payment.platformFee !== null
        ? Number(payment.platformFee)
        : (await calculateCommission("Learning", amount)).commission;
      const net = Math.round((amount - commission) * 100) / 100;
      const courseId = payment.courseId?._id || payment.courseId;

      return {
        _id: payment._id,
        transactionId: payment.transactionId || payment.orderId || payment._id,
        sellerId: userId,
        serviceName: courseTitles.get(String(courseId)) || "Course",
        customerName: resolveCustomerName({ ...payment, userId: payment.userId || payment.studentId }),
        amount,
        commission,
        net,
        status: "Completed",
        transactionDate: payment.createdAt || new Date(),
        createdAt: payment.createdAt || new Date(),
      };
    }));
  } catch (error) {
    console.error("Unable to resolve instructor payments:", error);
    return [];
  }
}

// Safely extract customer name from User Population or Order Address
function resolveCustomerName(doc) {
  const user = doc.userId || doc.customerId || doc.user;
  if (user && typeof user === "object") {
    return user.name || user.fullName || user.nameEn || user.email || "Guest Customer";
  }
  if (doc.customerName && doc.customerName !== "Anonymous" && doc.customerName !== "Customer") {
    return doc.customerName;
  }
  if (doc.shippingAddress?.fullName) {
    return doc.shippingAddress.fullName;
  }
  if (doc.shippingAddress?.name) {
    return doc.shippingAddress.name;
  }
  return "Guest Customer";
}

function resolveOrderCategory(order) {
  return order?.category || order?.productCategory || order?.items?.[0]?.category || "";
}

async function orderToTransaction(order) {
  const amount = Number(order.amount || order.totalAmount || 0);
  const { commission, net } = await calculateCommission(resolveOrderCategory(order), amount);

  return {
    _id: order._id,
    transactionId: order.orderId || order._id,
    sellerId: order.sellerId,
    serviceName: order.service || order.productName || "Order",
    customerName: resolveCustomerName(order),
    amount,
    commission,
    net,
    status: order.orderStatus === "completed" || order.paymentStatus === "paid" ? "Completed" : "Pending",
    transactionDate: order.createdAt || order.updatedAt || new Date(),
    createdAt: order.createdAt || order.updatedAt || new Date(),
  };
}

async function toSummaryRecord(item) {
  const amount = Number(item.amount || 0);
  const fallback = await calculateCommission(resolveOrderCategory(item), amount);
  const commission = Number(item.commission || fallback.commission);
  const net = Number(item.net || fallback.net);
  const status = String(item.status || item.orderStatus || "Pending");

  return {
    amount,
    commission,
    net,
    status,
    customerName: resolveCustomerName(item),
    createdAt: item.createdAt || item.transactionDate || item.updatedAt || new Date(),
  };
}

exports.createTransaction = async (req, res) => {
  try {
    const count = await Earning.countDocuments();
    const authSellerId = getAuthenticatedOwnerId(req);
    const role = String(req.user?.role || "").toLowerCase();

    let sellerId = authSellerId || req.user?.id;
    let customerId = req.body.userId || req.body.customerId || null;
    let customerName = req.body.customerName || "";

    if (req.body.orderId) {
      const order = await Order.findById(req.body.orderId).populate({
        path: "userId",
        select: "name fullName email",
        strictPopulate: false,
      });
      if (order) {
        const hasSellerItem =
          Array.isArray(order.items) &&
          order.items.some((item) => String(item.sellerId) === String(authSellerId));
        if (isAdmin(req) && order.sellerId) {
          sellerId = order.sellerId;
        } else if (hasSellerItem) {
          sellerId = authSellerId || req.user?.id;
        } else if (role !== "admin") {
          sellerId = authSellerId || req.user?.id;
        } else {
          sellerId = order.sellerId || req.user?.id;
        }

        customerId = order.userId?._id || order.userId;
        customerName = resolveCustomerName(order);
      }
    }

    const data = await Earning.create({
      sellerId,
      userId: customerId,
      customerName: customerName,
      transactionId: `TRX-${89200 + count + 1}`,
      net: (req.body.amount || 0) - (req.body.commission || 0),
      ...req.body,
    });

    res.json({
      success: true,
      transaction: data,
    });
  } catch (error) {
    console.error("Error in controllers/ecommUser/earningController.js:", error);

    res.status(500).json({
      success: false,
      message: "Failed to process earnings request",
    });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const { userId, role, filter, orderFilter } = buildSellerScope(req);
    const range = normalizeRange(req.query.range);
    const earningFilter = { ...filter, ...buildDateFilter(range, "transactionDate") };
    const orderQuery = {
      ...orderFilter,
      ...buildDateFilter(range, "createdAt"),
    };

    // FIXED: strictPopulate: false added
    let transactions = await Earning.find(earningFilter)
      .populate({
        path: "userId",
        select: "name fullName nameEn email",
        strictPopulate: false,
      })
      .sort({ transactionDate: -1 })
      .lean();

    let source = "earnings";

    if (!transactions.length && role === "instructor" && userId) {
      transactions = await getInstructorPayments(userId, range);
      source = "instructor_payments";
    }

    if (!transactions.length && userId) {
      const orders = await Order.find(orderQuery)
        .populate({
          path: "userId",
          select: "name fullName nameEn email",
          strictPopulate: false,
        })
        .sort({ createdAt: -1 })
        .lean();

      transactions = await Promise.all(orders.map(orderToTransaction));
      source = "orders";
    }

    const normalized = await Promise.all(transactions.map(toSummaryRecord));
    const totalEarnings = normalized.reduce((sum, item) => sum + item.net, 0);
    const orderRevenue = normalized.reduce((sum, item) => sum + item.amount, 0);
    const commission = normalized.reduce((sum, item) => sum + item.commission, 0);
    const pending = normalized.filter((item) => String(item.status).toLowerCase() === "pending").reduce((sum, item) => sum + item.net, 0);
    const available = normalized.filter((item) => String(item.status).toLowerCase() === "completed").reduce((sum, item) => sum + item.net, 0);

    res.json({
      success: true,
      source,
      totalEarnings,
      availableBalance: available,
      pendingPayouts: pending,
      orderRevenue,
      commission,
      totalOrders: normalized.length,
    });
  } catch (error) {
    console.error("Error in getSummary", error);
    res.status(500).json({
      success: false,
      message: "Unable to load earnings summary",
    });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const { userId, role, filter, orderFilter } = buildSellerScope(req);
    const range = normalizeRange(req.query.range);
    const earningFilter = { ...filter, ...buildDateFilter(range, "transactionDate") };
    const orderQuery = {
      ...orderFilter,
      ...buildDateFilter(range, "createdAt"),
    };

    // FIXED: strictPopulate: false added
    let rawData = await Earning.find(earningFilter)
      .populate({
        path: "userId",
        select: "name fullName nameEn email",
        strictPopulate: false,
      })
      .sort({ createdAt: -1 })
      .lean();

    if (!rawData.length && role === "instructor" && userId) {
      rawData = await getInstructorPayments(userId, range);
    }

    if (!rawData.length && userId) {
      const orders = await Order.find(orderQuery)
        .populate({
          path: "userId",
          select: "name fullName nameEn email",
          strictPopulate: false,
        })
        .sort({ createdAt: -1 })
        .lean();

      rawData = await Promise.all(orders.map(orderToTransaction));
    } else {
      rawData = rawData.map((item) => ({
        ...item,
        customerName: resolveCustomerName(item),
      }));
    }

    res.json({
      success: true,
      transactions: rawData,
    });
  } catch (error) {
    console.error("Error in getTransactions", error);
    res.status(500).json({
      success: false,
      message: "Unable to load earnings transactions",
    });
  }
};

exports.getRevenueChart = async (req, res) => {
  try {
    const { userId, role, filter } = buildSellerScope(req);
    const range = normalizeRange(req.query.range);
    const matchStage = { ...filter, ...buildDateFilter(range, "transactionDate") };

    let data = await Earning.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $month: "$transactionDate" },
          revenue: { $sum: "$net" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    if (!data.length && role === "instructor" && userId) {
      const payments = await getInstructorPayments(userId, range);
      const byMonth = new Map();
      for (const payment of payments) {
        const month = new Date(payment.transactionDate).getMonth() + 1;
        byMonth.set(month, (byMonth.get(month) || 0) + payment.net);
      }
      data = [...byMonth.entries()]
        .sort(([a], [b]) => a - b)
        .map(([_id, revenue]) => ({ _id, revenue }));
    }

    res.json({
      success: true,
      chart: data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Chart loading failed" });
  }
};

exports.getCommissionBreakdown = async (req, res) => {
  try {
    const data = await Earning.findById(req.params.id)
      .populate({
        path: "userId",
        select: "name fullName email",
        strictPopulate: false,
      })
      .lean();

    if (!data) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    res.json({
      success: true,
      breakdown: {
        transactionId: data.transactionId,
        customerName: resolveCustomerName(data),
        amount: data.amount,
        commission: data.commission,
        net: data.net,
        gst: data.gst,
        paymentGatewayFee: data.paymentGatewayFee,
        discounts: data.discounts,
        finalPayout: data.net,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get breakdown" });
  }
};

exports.withdraw = async (req, res) => {
  try {
    const { userId, role, filter } = buildSellerScope(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const amount = Math.round(Number(req.body.amount || 0) * 100) / 100;
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: "Enter a withdrawal amount greater than 0" });
    }

    const earnings = await Earning.find(role === "instructor" ? filter : { sellerId: userId })
      .select("net status")
      .lean();
    const instructorPayments = role === "instructor" ? await getInstructorPayments(userId, "all") : [];
    const completedNet = earnings.reduce((sum, earning) => (
      String(earning.status || "").toLowerCase() === "completed" ? sum + Number(earning.net || 0) : sum
    ), 0) + instructorPayments.reduce((sum, payment) => sum + Number(payment.net || 0), 0);
    const settlements = await Settlement.find({
      sellerId: userId,
      status: { $nin: ["failed"] },
    }).select("netPayable").lean();
    const withdrawn = settlements.reduce((sum, settlement) => sum + Number(settlement.netPayable || 0), 0);
    const availableBalance = Math.max(0, Math.round((completedNet - withdrawn) * 100) / 100);

    if (amount > availableBalance) {
      return res.status(400).json({
        success: false,
        message: `Amount exceeds your available balance of ₹${availableBalance.toLocaleString("en-IN")}`,
        availableBalance,
      });
    }

    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const { commission } = await calculateCommission(req.body.category || "", completedNet);
    const settlement = await Settlement.create({
      sellerId: userId,
      period,
      totalSales: completedNet,
      commissionDeducted: commission,
      netPayable: amount,
      orderCount: earnings.length + instructorPayments.length,
      status: "pending",
      paymentMethod: String(req.body.paymentMethod || "bank_transfer"),
      notes: String(req.body.notes || "Seller withdrawal request"),
    });

    return res.status(201).json({
      success: true,
      message: "Withdrawal request submitted",
      data: settlement,
      availableBalance: Math.max(0, Math.round((availableBalance - amount) * 100) / 100),
    });
  } catch (error) {
    console.error("Error in controllers/ecommUser/earningController.js withdraw:", error);
    res.status(500).json({ success: false, message: "Withdrawal failed" });
  }
};
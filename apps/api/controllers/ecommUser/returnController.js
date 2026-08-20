const Return = require("../../models/shared/Return.js");
const Order = require("../../models/shared/Order.js");
const { getAuthenticatedOwnerId, isAdmin } = require("../../utils/ownership.js");

exports.createReturn = async (req, res) => {
  try {
    const { orderId, reason } = req.body;
    if (!orderId || !reason) {
      return res.status(400).json({ success: false, message: "Order and reason are required" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const requesterId = getAuthenticatedOwnerId(req) || req.user?.id;
    if (!isAdmin(req) && String(order.buyerId) !== String(requesterId)) {
      return res.status(403).json({ success: false, message: "You can request a return only for your own order" });
    }

    const sellerId = order.sellerId || order.items?.find((item) => item.sellerId)?.sellerId;
    if (!sellerId) {
      return res.status(409).json({ success: false, message: "This order is missing seller information" });
    }

    const normalizedStatus = String(order.orderStatus || order.status || "").toLowerCase();
    const requestKind = req.body.requestKind === "return" || ["delivered", "completed"].includes(normalizedStatus)
      ? "return"
      : "cancel";
    const existing = await Return.findOne({
      orderId: String(order._id),
      requestKind,
      status: { $in: ["Pending", "Approved"] },
    });
    if (existing) {
      return res.status(409).json({ success: false, message: `A ${requestKind} request is already active for this order` });
    }

    const inferredType = order.items?.some((item) => item.rentalStart || item.rentalEnd)
      ? "Rental"
      : order.items?.some((item) => item.itemType === "service")
        ? "Service"
        : "Product";

    const count = await Return.countDocuments();

    const data = await Return.create({
      sellerId,
      requestId: `RET-${count + 1001}`,
      orderId: String(order._id),
      reason,
      amount: Number(order.amount || 0),
      customerName: order.customerName || "",
      productName: order.productName || order.items?.map((item) => item.title).filter(Boolean).join(", ") || "",
      sku: order.items?.[0]?.variant || "",
      type: inferredType,
      requestKind,
      requestDate: new Date(),
      status: "Pending",
    });

    res.json({
      success: true,
      return: data
    });
  } catch (error) {
    console.error("Error in ecommUser/returnController.js:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process return request"
    });
  }
};

exports.getReturns = async (req, res) => {
  try {
    const { status, reason, search } = req.query;
    const role = String(req.user?.role || "").toLowerCase();
    const userId = getAuthenticatedOwnerId(req) || req.user?.id;

    let filter = {};

    if (role === "admin") {
      // Admin sees all returns
    } else if (role === "seller") {
      // Seller sees only returns for their items
      filter = { sellerId: userId };
    } else {
      // Buyer sees only their own returns (based on their orders)
      const userOrders = await Order.find({ buyerId: userId }).select("_id").lean();
      const orderIds = userOrders.map((o) => String(o._id));
      filter = { orderId: { $in: orderIds } };
    }

    if (status) filter.status = status;
    if (reason) filter.reason = reason;

    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { requestId: { $regex: search, $options: "i" } },
        { orderId: { $regex: search, $options: "i" } },
      ];
    }

    const data = await Return.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      returns: data
    });
  } catch (error) {
    console.error("Error in ecommUser/returnController.js:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process return request"
    });
  }
};

async function findManagedReturn(req, returnId) {
  const request = await Return.findById(returnId);
  if (!request) {
    const error = new Error("Return request not found");
    error.statusCode = 404;
    throw error;
  }
  const userId = getAuthenticatedOwnerId(req) || req.user?.id;
  if (!isAdmin(req) && String(request.sellerId) !== String(userId)) {
    const error = new Error("You cannot manage this return request");
    error.statusCode = 403;
    throw error;
  }
  return request;
}

exports.approveReturn = async (req, res) => {
  try {
    const data = await findManagedReturn(req, req.params.id);
    data.status = "Approved";
    await data.save();
    res.json({ success: true, return: data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Failed to approve return" });
  }
};


exports.rejectReturn = async (req, res) => {
  try {
    const data = await findManagedReturn(req, req.params.id);
    data.status = "Rejected";
    await data.save();
    res.json({ success: true, return: data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Failed to reject return" });
  }
};


exports.refundReturn = async (req, res) => {
  try {
    const data = await findManagedReturn(req, req.params.id);
    data.status = "Refunded";
    await data.save();
    res.json({ success: true, return: data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Failed to refund return" });
  }
};


exports.returnSummary = async (req, res) => {
  const userId = getAuthenticatedOwnerId(req) || req.user?.id;
  const role = String(req.user?.role || "").toLowerCase();

  let filter = {};
  if (role === "seller") {
    filter = { sellerId: userId };
  } else if (role !== "admin") {
    const userOrders = await Order.find({ buyerId: userId }).select("_id").lean();
    filter = { orderId: { $in: userOrders.map((order) => String(order._id)) } };
  }

  const total = await Return.countDocuments(filter);
  const pending = await Return.countDocuments({ ...filter, status: "Pending" });
  const approved = await Return.countDocuments({ ...filter, status: "Approved" });
  const rejected = await Return.countDocuments({ ...filter, status: "Rejected" });

  const refunded = await Return.aggregate([
    {
      $match: { ...filter, status: "Refunded" }
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" }
      }
    }
  ]);

  res.json({
    success: true,
    totalRequests: total,
    pending,
    approved,
    rejected,
    refundedAmount: refunded[0] ? refunded[0].total : 0
  });
};

const Order = require("../../models/shared/Order.js");
const Shipping = require("../../models/shared/Shipping.js");
const shiprocket = require("../../services/shiprocketService.js");
const { buildShiprocketOrderPayload, normalizeShiprocketResponse } = require("../../services/shiprocketIntegration.js");
const Product = require("../../models/shared/Product.js");
const User = require("../../models/shared/User.js");
const Payment = require("../../models/shared/Payment.js");
const Invoice = require("../../models/shared/Invoice.js");
const Cart = require("../../models/shared/Cart.js");
const mongoose = require("mongoose");
const { resolveBuyerIdentity, resolveSellerIdentity } = require("../../utils/ecommIdentity.js");

const ORDER_STATUSES = new Set(["pending", "confirmed", "completed", "cancelled"]);
const ALLOWED_ORDER_FIELDS = new Set(["customerName", "service", "amount", "productName", "eventDate"]);
const ALLOWED_SHIPMENT_FIELDS = new Set(["customerName", "productName", "type", "partner", "address", "awbCode", "trackingUrl", "status", "shipmentId", "shiprocketOrderId"]);

function normalizeOrderStatus(value) {
  if (typeof value !== "string") return "pending";
  const normalized = value.trim().toLowerCase();
  return ORDER_STATUSES.has(normalized) ? normalized : "pending";
}

function normalizePaymentStatus(value) {
  if (typeof value !== "string") return "pending";
  const normalized = value.trim().toLowerCase();
  if (normalized === "partial") return "partially_refunded";
  return ["pending", "authorized", "paid", "failed", "refunded", "partially_refunded"].includes(normalized) ? normalized : "pending";
}

function pickAllowed(obj, allowed) {
  const result = {};
  for (const key of Object.keys(obj)) {
    if (allowed.has(key)) {
      result[key] = obj[key];
    }
  }
  return result;
}

async function findOrderForUser(orderId, user) {
  const order = await Order.findById(orderId);
  if (!order) return null;
  if (user.role !== "admin" && String(order.buyerId || order.sellerId) !== String(user.id)) {
    const error = new Error("Not authorized to access this order");
    error.statusCode = 403;
    throw error;
  }
  return order;
}

function getOrderItemSummary(order) {
  const items = Array.isArray(order.items) ? order.items : [];
  if (items.length === 0) {
    return [{ title: order.productName || order.service || "Product", quantity: 1, price: Number(order.amount || 0) }];
  }

  return items.map((item) => ({
    title: item.title || item.name || "Product",
    quantity: Number(item.quantity || 1),
    price: Number(item.price || 0),
  }));
}

function buildShipmentPayload(order, normalized, fallbackStatus = "created") {
  const itemsSummary = getOrderItemSummary(order);
  return {
    orderId: order._id,
    customerName: order.customerName || order.shippingAddress?.name || "Customer",
    productName: order.productName || itemsSummary.map((item) => item.title).join(", "),
    type: order.service ? "PRODUCT" : "PRODUCT",
    provider: "shiprocket",
    partner: normalized.courierName || "Shiprocket",
    status: normalized.awbCode ? "in_transit" : fallbackStatus,
    shiprocketOrderId: normalized.shiprocketOrderId || "",
    shipmentId: normalized.shipmentId || "",
    awbCode: normalized.awbCode || "",
    courierName: normalized.courierName || "",
    trackingUrl: normalized.trackingUrl || "",
    labelUrl: normalized.labelUrl || "",
    address: order.shippingAddress ? [order.shippingAddress.street, order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.pincode].filter(Boolean).join(", ") : "",
  };
}

exports.createOrder = async (req, res) => {
  try {
    const orderStatus = normalizeOrderStatus(req.body.orderStatus || req.body.status);
    const paymentStatus = normalizePaymentStatus(req.body.paymentStatus);

    const order = await Order.create({
      sellerId: req.user?.id,
      customerName: req.body.customerName,
      service: req.body.service,
      amount: req.body.amount,
      orderStatus,
      status: orderStatus,
      paymentStatus
    });

    res.status(201).json({
      success: true,
      order
    });

  } catch (err) {
    console.error("Error in controllers/ecommUser/orderController.js:", err);

    res.status(500).json({
      success: false,
      message: "Failed to create order"
    });
  }
};

exports.createUserOrder = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const {
      shippingAddress,
      razorpayOrderId,
      razorpayPaymentId,
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId) {
      return res.status(400).json({ success: false, message: "A verified payment is required" });
    }
    if (!shippingAddress?.street || !shippingAddress?.city || !shippingAddress?.state || !shippingAddress?.pincode || !shippingAddress?.phone) {
      return res.status(400).json({ success: false, message: "A complete shipping address is required" });
    }

    const existingPayment = await Payment.findOne({
      userId: req.user.id,
      orderId: razorpayOrderId,
      transactionId: razorpayPaymentId,
      paymentFor: "product_order",
      status: "completed",
    });
    if (!existingPayment) {
      return res.status(400).json({ success: false, message: "Payment has not been verified" });
    }

    if (existingPayment.fulfilledOrderIds?.length) {
      const orders = await Order.find({ _id: { $in: existingPayment.fulfilledOrderIds }, buyerId: req.user.id });
      return res.json({ success: true, order: orders[0], orders, alreadyCreated: true });
    }

    let createdOrders = [];
    await session.withTransaction(async () => {
      createdOrders = [];
      const payment = await Payment.findOne({
        _id: existingPayment._id,
        userId: req.user.id,
        status: "completed",
        fulfilledAt: null,
      }).session(session);
      if (!payment) throw Object.assign(new Error("This payment has already been used"), { statusCode: 409 });

      const paidItems = Array.isArray(payment.metadata?.items) ? payment.metadata.items : [];
      const paidSummary = payment.metadata?.summary || {};
      if (!paidItems.length || Number(paidSummary.total) !== Number(payment.totalAmount)) {
        throw Object.assign(new Error("Stored payment quote is invalid"), { statusCode: 409 });
      }

      const productIds = [...new Set(paidItems.map((item) => String(item.productId)))];
      const products = await Product.find({ _id: { $in: productIds } }).session(session);
      const productById = new Map(products.map((product) => [String(product._id), product]));
      const groups = new Map();

      for (const item of paidItems) {
        const product = productById.get(String(item.productId));
        const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
        if (!product || !product.isPublished || !product.isApproved || product.status !== "active") {
          throw Object.assign(new Error(`${item.title || "A product"} is no longer available`), { statusCode: 409 });
        }

        const stockFilter = { _id: product._id, stock: { $gte: quantity } };
        const stockUpdate = { $inc: { stock: -quantity, orders: quantity } };
        const updateOptions = { session, new: true };
        if (item.variant) {
          stockFilter.variants = { $elemMatch: { name: item.variant, stock: { $gte: quantity } } };
          stockUpdate.$inc["variants.$[selected].stock"] = -quantity;
          updateOptions.arrayFilters = [{ "selected.name": item.variant }];
        }
        const updated = await Product.findOneAndUpdate(stockFilter, stockUpdate, updateOptions);
        if (!updated) {
          throw Object.assign(new Error(`Stock changed before checkout for ${item.title}`), { statusCode: 409 });
        }

        const sellerKey = String(item.sellerId || product.sellerId);
        const group = groups.get(sellerKey) || {
          sellerId: item.sellerId || product.sellerId,
          items: [],
          subtotal: 0,
          shipping: 0,
        };
        const unitPrice = Number(item.unitPrice);
        const shippingCost = Number(item.shippingCost || 0);
        group.items.push({
          productId: product._id,
          sellerId: group.sellerId,
          itemType: "product",
          title: item.title || product.title,
          image: item.image || product.images?.[0] || "",
          price: unitPrice,
          quantity,
          variant: item.variant || "",
        });
        group.subtotal += unitPrice * quantity;
        group.shipping += shippingCost * quantity;
        groups.set(sellerKey, group);
      }

      const buyerUser = await User.findById(req.user.id).select("name fullName nameEn email phone").session(session);
      const buyerIdentity = resolveBuyerIdentity({}, buyerUser || req.user || {});
      const groupList = [...groups.values()];
      const allocationBase = Number(paidSummary.subtotal || 0) + Number(paidSummary.shipping || 0);
      let allocatedTotal = 0;

      for (let index = 0; index < groupList.length; index += 1) {
        const group = groupList[index];
        const weight = allocationBase > 0 ? (group.subtotal + group.shipping) / allocationBase : 1 / groupList.length;
        const isLast = index === groupList.length - 1;
        const groupAmount = isLast
          ? Number(payment.totalAmount) - allocatedTotal
          : Math.round(Number(payment.totalAmount) * weight * 100) / 100;
        allocatedTotal += groupAmount;

        const sellerUser = await User.findById(group.sellerId).select("name fullName nameEn email").session(session);
        const sellerIdentity = resolveSellerIdentity({}, sellerUser || {});
        const [order] = await Order.create([{
          sellerId: group.sellerId,
          buyerId: req.user.id,
          customerName: buyerIdentity.name,
          customerEmail: buyerIdentity.email,
          sellerName: sellerIdentity.name,
          sellerEmail: sellerIdentity.email,
          items: group.items,
          productName: group.items.map((item) => item.title).join(", "),
          amount: groupAmount,
          shippingAddress,
          paymentMethod: payment.paymentMethod,
          razorpayOrderId,
          razorpayPaymentId,
          paymentStatus: "paid",
          orderStatus: "confirmed",
          status: "confirmed",
        }], { session });
        createdOrders.push(order);

        const groupServiceFee = Math.round(Number(paidSummary.serviceFee || 0) * weight * 100) / 100;
        const groupTax = Math.round(Number(paidSummary.tax || 0) * weight * 100) / 100;
        await Invoice.create([{
          invoiceNo: `INV-${Date.now()}-${String(order._id).slice(-6).toUpperCase()}`,
          orderId: order._id,
          userId: req.user.id,
          userDetails: {
            name: buyerIdentity.name,
            email: buyerIdentity.email,
            phone: shippingAddress.phone || buyerUser?.phone || "",
            address: [shippingAddress.street, shippingAddress.city, shippingAddress.state, shippingAddress.pincode].filter(Boolean).join(", "),
          },
          items: group.items.map((item) => ({
            name: item.title,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity,
            type: "buy",
          })),
          subtotal: group.subtotal,
          shipping: group.shipping,
          serviceFee: groupServiceFee,
          tax: groupTax,
          discount: 0,
          total: groupAmount,
          paymentMethod: payment.paymentMethod,
          transactionId: razorpayPaymentId,
          paymentStatus: "paid",
          status: "paid",
        }], { session });
      }

      payment.fulfilledOrderIds = createdOrders.map((order) => order._id);
      payment.fulfilledAt = new Date();
      payment.isInvoice = true;
      payment.invoiceStatus = "paid";
      await payment.save({ session });
      await Cart.findOneAndUpdate(
        { _id: payment.metadata.cartId, userId: req.user.id },
        { $set: { items: [] } },
        { session }
      );
    });

    res.status(201).json({ success: true, order: createdOrders[0], orders: createdOrders });
  } catch (err) {
    console.error("createUserOrder error:", err);
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.statusCode ? err.message : "Failed to create order",
    });
  } finally {
    await session.endSession();
  }
};

exports.getOrderStats = async (req, res) => {
  try {
    const filter = { sellerId: req.user.id };
    const total = await Order.countDocuments(filter);
    const pending = await Order.countDocuments({ ...filter, orderStatus: "pending" });
    const confirmed = await Order.countDocuments({ ...filter, orderStatus: "confirmed" });
    const completed = await Order.countDocuments({ ...filter, orderStatus: "completed" });
    const cancelled = await Order.countDocuments({ ...filter, orderStatus: "cancelled" });

    res.json({
      success: true,
      data: { total, pending, confirmed, completed, cancelled }
    });
  } catch (err) {
    console.error("Error in controllers/ecommUser/orderController.js:", err);

    res.status(500).json({ success: false, message: "Failed to fetch order stats" });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const ownership = req.user.role === "admin" ? {} : { $or: [{ buyerId: req.user.id }, { sellerId: req.user.id }] };
    const orders = await Order.find(ownership).sort({ createdAt: -1 });
    const shipments = await Shipping.find({ orderId: { $in: orders.map((order) => order._id) } }).lean();
    const shipmentByOrder = new Map(shipments.map((shipment) => [String(shipment.orderId), shipment]));
    res.json({ success: true, orders: orders.map((order) => ({ ...order.toObject(), shipping: shipmentByOrder.get(String(order._id)) || null })) });
  } catch (err) {
    console.error("Error in controllers/ecommUser/orderController.js:", err);

    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

async function findOwnedOrder(orderId, user) {
  const order = await Order.findById(orderId);
  if (!order) return null;
  if (user.role !== "admin" && String(order.buyerId || order.sellerId) !== user.id) {
    const error = new Error("Not authorized to access this order");
    error.statusCode = 403;
    throw error;
  }
  return order;
}

exports.getOrderById = async (req, res) => {
  try {
    const order = await findOwnedOrder(req.params.id, req.user);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    const shipping = await Shipping.findOne({ orderId: order._id }).lean();
    res.json({ success: true, order: { ...order.toObject(), shipping: shipping || null } });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message || "Failed to fetch order" });
  }
};
exports.refreshOrderTracking = async (req, res) => {
  try {
    const order = await findOwnedOrder(req.params.id, req.user);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const shipping = await Shipping.findOne({ orderId: order._id, provider: "shiprocket" });

    // Agar AWB nahi hai, toh 404 bhejne ke bajaye order status fallback return karein
    if (!shipping?.awbCode) {
      return res.status(200).json({ 
        success: false, 
        message: "Order is processing. Tracking link will be generated once dispatched.",
        orderStatus: order.status || "Processing"
      });
    }

    // Shiprocket API call
    const tracking = await shiprocket.trackAwb(shipping.awbCode);
    const activity = tracking?.tracking_data?.shipment_track?.[0] || tracking?.tracking_data?.shipment_track_activities?.[0];

    shipping.status = activity?.current_status || activity?.status || shipping.status;
    shipping.trackingUrl = tracking?.tracking_data?.track_url || shipping.trackingUrl;
    shipping.lastSyncedAt = new Date();
    shipping.lastError = undefined;
    await shipping.save();

    res.json({ success: true, shipping, tracking });

  } catch (err) {
    console.error("Order tracking refresh failed:", err.cause?.response?.data || err.message);
    res.status(err.statusCode || 500).json({ success: false, message: err.message || "Failed to refresh tracking" });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const existing = await Order.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (existing.sellerId?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to update this order" });
    }

    const allowedUpdates = pickAllowed(req.body, ALLOWED_ORDER_FIELDS);

    if (req.body.orderStatus !== undefined || req.body.status !== undefined) {
      const normalized = normalizeOrderStatus(req.body.orderStatus || req.body.status);
      allowedUpdates.orderStatus = normalized;
      allowedUpdates.status = normalized;
    }

    if (req.body.paymentStatus !== undefined) {
      allowedUpdates.paymentStatus = normalizePaymentStatus(req.body.paymentStatus);
    }

    const order = await Order.findByIdAndUpdate(req.params.id, allowedUpdates, { new: true, runValidators: true });

    res.json({ success: true, order });
  } catch (err) {
    console.error("Error in controllers/ecommUser/orderController.js:", err);

    res.status(500).json({ success: false, message: "Failed to update order" });
  }
};

exports.createShipment = async (req, res) => {
  try {
    const orderId = String(req.body.orderId || req.body.order_id || req.params.id || "").trim();
    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }

    const order = await findOrderForUser(orderId, req.user);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const shiprocketPayload = buildShiprocketOrderPayload({
      _id: order._id,
      orderId: order._id,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      sellerName: order.sellerName,
      amount: order.amount,
      items: Array.isArray(order.items) ? order.items : [],
      service: order.service || order.productName,
      paymentMethod: order.paymentMethod,
      shippingAddress: order.shippingAddress,
    });

    const shiprocketResponse = await shiprocket.createOrder(shiprocketPayload);
    const normalized = normalizeShiprocketResponse(shiprocketResponse);

    if (normalized.shipmentId) {
      const awbResponse = await shiprocket.assignAwb(normalized.shipmentId, req.body.courierId || undefined);
      const awbData = normalizeShiprocketResponse(awbResponse);
      normalized.awbCode = awbData.awbCode || normalized.awbCode;
      normalized.courierName = awbData.courierName || normalized.courierName;
      normalized.trackingUrl = awbData.trackingUrl || normalized.trackingUrl;
    }

    const shipmentPayload = buildShipmentPayload(order, normalized);
    const shipment = await Shipping.findOneAndUpdate(
      { orderId: order._id },
      shipmentPayload,
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );

    order.shipmentDetails = {
      ...order.shipmentDetails?.toObject?.() || order.shipmentDetails || {},
      shiprocketOrderId: normalized.shiprocketOrderId || order.shipmentDetails?.shiprocketOrderId || "",
      shipmentId: normalized.shipmentId || order.shipmentDetails?.shipmentId || "",
      awbCode: normalized.awbCode || order.shipmentDetails?.awbCode || "",
      courierName: normalized.courierName || order.shipmentDetails?.courierName || "Shiprocket",
      trackingUrl: normalized.trackingUrl || order.shipmentDetails?.trackingUrl || "",
      status: normalized.awbCode ? "SHIPPED" : "CREATED",
      trackingStatus: normalized.awbCode ? "AWB_ASSIGNED" : "CREATED",
      partner: "Shiprocket",
      meta: normalized.meta || {},
    };

    order.orderStatus = order.orderStatus === "pending" ? "confirmed" : order.orderStatus;
    order.status = order.status === "pending" ? "confirmed" : order.status;
    await order.save();

    res.status(201).json({
      success: true,
      shipment,
      order,
      data: normalized,
    });
  } catch (err) {
    console.error("Error in controllers/ecommUser/orderController.js:", err);

    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to create shipment"
    });
  }
};

exports.trackShipment = async (req, res) => {
  try {
    const orderId = String(req.params.orderId || req.query.orderId || req.body.orderId || "").trim();
    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }

    const order = await findOrderForUser(orderId, req.user);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const shipment = await Shipping.findOne({ orderId: order._id, provider: "shiprocket" });
    if (!shipment?.awbCode) {
      return res.status(404).json({ success: false, message: "AWB is not available yet" });
    }

    const tracking = await shiprocket.trackAwb(shipment.awbCode);
    const activity = tracking?.tracking_data?.shipment_track?.[0] || tracking?.tracking_data?.shipment_track_activities?.[0];
    shipment.status = activity?.current_status || activity?.status || shipment.status;
    shipment.trackingUrl = tracking?.tracking_data?.track_url || shipment.trackingUrl;
    shipment.lastSyncedAt = new Date();
    shipment.lastError = undefined;
    await shipment.save();

    order.shipmentDetails = {
      ...order.shipmentDetails?.toObject?.() || order.shipmentDetails || {},
      awbCode: shipment.awbCode || order.shipmentDetails?.awbCode || "",
      trackingUrl: shipment.trackingUrl || order.shipmentDetails?.trackingUrl || "",
      status: shipment.status || order.shipmentDetails?.status || "SHIPPED",
      trackingStatus: activity?.current_status || activity?.status || order.shipmentDetails?.trackingStatus || "IN_TRANSIT",
    };
    await order.save();

    res.json({ success: true, shipment, data: tracking });
  } catch (err) {
    console.error("Order tracking failed:", err);
    res.status(err.statusCode || 500).json({ success: false, message: err.message || "Failed to track shipment" });
  }
};

exports.generateLabel = async (req, res) => {
  try {
    const orderId = String(req.params.orderId || req.query.orderId || req.body.orderId || "").trim();
    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }

    const order = await findOrderForUser(orderId, req.user);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const shipment = await Shipping.findOne({ orderId: order._id, provider: "shiprocket" });
    if (!shipment?.shipmentId) {
      return res.status(404).json({ success: false, message: "Shipment ID is not available yet" });
    }

    const labelResponse = await shiprocket.generateLabel(shipment.shipmentId);
    const labelUrl = labelResponse?.label_url || labelResponse?.label_url?.[0] || labelResponse?.labelUrl || "";
    shipment.labelUrl = labelUrl;
    await shipment.save();

    res.json({ success: true, data: { labelUrl, response: labelResponse } });
  } catch (err) {
    console.error("Label generation failed:", err);
    res.status(err.statusCode || 500).json({ success: false, message: err.message || "Failed to generate label" });
  }
};

exports.getShippingStats = async (req, res) => {
  try {
    const ready = await Shipping.countDocuments({ status: "ready_to_ship" });
    const inTransit = await Shipping.countDocuments({ status: "in_transit" });
    const outForDelivery = await Shipping.countDocuments({ status: "out_for_delivery" });
    const delivered = await Shipping.countDocuments({ status: "delivered" });
    const delayed = await Shipping.countDocuments({ status: "delayed" });

    res.json({
      success: true,
      data: { ready, inTransit, outForDelivery, delivered, delayed }
    });
  } catch (err) {
    console.error("Error in controllers/ecommUser/orderController.js:", err);

    res.status(500).json({ success: false, message: "Failed to fetch shipping stats" });
  }
};

exports.getShipments = async (req, res) => {
  try {
    const data = await Shipping.find().sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (err) {
    console.error("Error in controllers/ecommUser/orderController.js:", err);

    res.status(500).json({ success: false, message: "Failed to fetch shipments" });
  }
};

exports.updateShipment = async (req, res) => {
  try {
    const allowedUpdates = pickAllowed(req.body, ALLOWED_SHIPMENT_FIELDS);
    const shipment = await Shipping.findByIdAndUpdate(
      req.params.id,
      allowedUpdates,
      { new: true, runValidators: true }
    );

    if (!shipment) {
      return res.status(404).json({ success: false, message: "Shipment not found" });
    }

    res.json({ success: true, shipment });
  } catch (err) {
    console.error("Error in controllers/ecommUser/orderController.js:", err);

    res.status(500).json({ success: false, message: "Failed to update shipment" });
  }
};

const RentalOrder = require("../../models/shared/RentalOrder.js");
const Product = require("../../models/shared/Product.js");
const Conversation = require("../../models/shared/Conversation.js");

exports.createRentalOrder = async (req, res) => {
  try {
    const {
      productId,
      quantity,
      rentalStart,
      rentalEnd,
      variantName,
      shippingAddress,
      shippingMethod,
      paymentId,
      razorpayOrderId,
    } = req.body;

    if (!productId || !rentalStart || !rentalEnd) {
      return res.status(400).json({ success: false, message: "productId, rentalStart, rentalEnd are required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (!["rent", "rental", "both"].includes(product.productType)) {
      return res.status(400).json({ success: false, message: "This product is not available for rent" });
    }

    const start = new Date(rentalStart);
    const end = new Date(rentalEnd);
    if (end <= start) {
      return res.status(400).json({ success: false, message: "Return date must be after rental start date" });
    }

    const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    const qty = parseInt(quantity) || 1;
    const dailyRate = product.rentalPrice || product.price;
    const deposit = (product.securityDeposit || 0) * qty;

    const rentalOrder = await RentalOrder.create({
      userId: req.user.id,
      sellerId: product.sellerId || product.createdBy,
      productId: product._id,
      productTitle: product.title,
      productImage: product.images && product.images[0] ? product.images[0] : "",
      variantName,
      quantity: qty,
      rentalStart: start,
      rentalEnd: end,
      rentalDurationDays: days,
      dailyRate,
      subtotal: days * dailyRate * qty,
      securityDeposit: deposit,
      lateFeePerDay: product.lateReturnFee || 0,
      totalAmount: days * dailyRate * qty + deposit,
      paymentId,
      razorpayOrderId,
      paymentStatus: paymentId ? "full_paid" : "pending",
      rentalStatus: paymentId ? "reserved" : "pending_deposit",
      shippingAddress,
      shippingMethod: shippingMethod || "standard",
    });

    // Rentals need coordination for delivery and return, unlike ordinary purchases.
    const conversation = await Conversation.findOneAndUpdate(
      { buyerId: req.user.id, sellerId: rentalOrder.sellerId, rentalOrderId: rentalOrder._id },
      {
        $setOnInsert: {
          buyerId: req.user.id,
          sellerId: rentalOrder.sellerId,
          rentalOrderId: rentalOrder._id,
          productId: product._id,
          productName: product.title,
          productImage: rentalOrder.productImage,
          amount: rentalOrder.totalAmount,
          orderStatus: rentalOrder.rentalStatus,
          orderNumber: rentalOrder.rentalId || String(rentalOrder._id),
        },
      },
      { new: true, upsert: true }
    );

    return res.status(201).json({ success: true, data: rentalOrder, conversationId: conversation._id });
  } catch (err) {
    console.error("createRentalOrder error:", err);
    return res.status(500).json({ success: false, message: "Failed to create rental order" });
  }
};

exports.getMyRentals = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { userId: req.user.id };
    if (status) filter.rentalStatus = status;

    const rentals = await RentalOrder.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("productId", "title images price rentalPrice");

    const total = await RentalOrder.countDocuments(filter);

    return res.json({ success: true, data: rentals, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("getMyRentals error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch rentals" });
  }
};

exports.getSellerRentals = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { sellerId: req.user.id };
    if (status) filter.rentalStatus = status;

    const rentals = await RentalOrder.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("productId", "title images price rentalPrice")
      .populate("userId", "name email phone");

    const total = await RentalOrder.countDocuments(filter);

    return res.json({ success: true, data: rentals, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("getSellerRentals error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch seller rentals" });
  }
};

exports.checkAvailability = async (req, res) => {
  try {
    const { productId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: "startDate and endDate are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const overlapping = await RentalOrder.find({
      productId,
      rentalStatus: { $nin: ["cancelled", "completed"] },
      rentalStart: { $lt: end },
      rentalEnd: { $gt: start },
    });

    const product = await Product.findById(productId);
    const maxQty = product ? (product.stock || 1) : 1;
    const bookedQty = overlapping.reduce((sum, r) => sum + (r.quantity || 1), 0);

    return res.json({
      success: true,
      available: maxQty - bookedQty,
      isAvailable: maxQty - bookedQty > 0,
    });
  } catch (err) {
    console.error("checkAvailability error:", err);
    return res.status(500).json({ success: false, message: "Failed to check availability" });
  }
};

exports.getRentalById = async (req, res) => {
  try {
    const rental = await RentalOrder.findOne({ rentalId: req.params.rentalId })
      .populate("productId", "title images price rentalPrice specifications")
      .populate("userId", "name email phone")
      .populate("sellerId", "name email phone");

    if (!rental) {
      return res.status(404).json({ success: false, message: "Rental not found" });
    }

    if (rental.userId._id.toString() !== req.user.id && rental.sellerId._id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    return res.json({ success: true, data: rental });
  } catch (err) {
    console.error("getRentalById error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch rental" });
  }
};

exports.confirmDelivery = async (req, res) => {
  try {
    const rental = await RentalOrder.findOne({ rentalId: req.params.rentalId });
    if (!rental) return res.status(404).json({ success: false, message: "Rental not found" });
    if (rental.userId.toString() !== req.user.id) return res.status(403).json({ success: false, message: "Not authorized" });

    if (!["shipped", "return_shipped"].includes(rental.rentalStatus)) {
      return res.status(400).json({ success: false, message: "Rental is not in deliverable state" });
    }

    rental.rentalStatus = "in_use";
    rental.deliveredAt = new Date();
    await rental.save();

    return res.json({ success: true, data: rental });
  } catch (err) {
    console.error("confirmDelivery error:", err);
    return res.status(500).json({ success: false, message: "Failed to confirm delivery" });
  }
};

exports.initiateReturn = async (req, res) => {
  try {
    const rental = await RentalOrder.findOne({ rentalId: req.params.rentalId });
    if (!rental) return res.status(404).json({ success: false, message: "Rental not found" });
    if (rental.userId.toString() !== req.user.id) return res.status(403).json({ success: false, message: "Not authorized" });

    if (rental.rentalStatus !== "in_use") {
      return res.status(400).json({ success: false, message: "Rental is not in use" });
    }

    rental.rentalStatus = "return_shipped";
    rental.returnInitiatedAt = new Date();
    rental.returnTrackingNumber = req.body.trackingNumber || "";
    rental.returnShippedAt = new Date();
    await rental.save();

    return res.json({ success: true, data: rental });
  } catch (err) {
    console.error("initiateReturn error:", err);
    return res.status(500).json({ success: false, message: "Failed to initiate return" });
  }
};

exports.inspectReturn = async (req, res) => {
  try {
    const rental = await RentalOrder.findOne({ rentalId: req.params.rentalId });
    if (!rental) return res.status(404).json({ success: false, message: "Rental not found" });
    if (rental.sellerId.toString() !== req.user.id) return res.status(403).json({ success: false, message: "Not authorized" });

    if (rental.rentalStatus !== "return_shipped" && rental.rentalStatus !== "returned") {
      return res.status(400).json({ success: false, message: "Rental is not in return state" });
    }

    const { returnCondition, damageReported, damageDescription, notes } = req.body;

    rental.rentalStatus = "inspection";
    rental.inspectionDate = new Date();
    rental.returnCondition = returnCondition || "good";
    rental.damageReported = !!damageReported;
    rental.damageDescription = damageDescription || "";
    rental.inspectionNotes = notes || "";
    rental.returnReceivedAt = new Date();

    if (rental.actualReturnDate && rental.returnWindow && new Date(rental.actualReturnDate) > new Date(rental.returnWindow)) {
      rental.lateFee = rental.calculateLateFee();
    }

    if (damageReported) {
      rental.damageFee = parseInt(req.body.damageFee) || 0;
    }

    rental.totalAmount = rental.subtotal + rental.securityDeposit + rental.lateFee + rental.damageFee + rental.extensionFee;
    await rental.save();

    return res.json({ success: true, data: rental });
  } catch (err) {
    console.error("inspectReturn error:", err);
    return res.status(500).json({ success: false, message: "Failed to inspect return" });
  }
};

exports.completeRental = async (req, res) => {
  try {
    const rental = await RentalOrder.findOne({ rentalId: req.params.rentalId });
    if (!rental) return res.status(404).json({ success: false, message: "Rental not found" });

    if (rental.userId.toString() !== req.user.id && rental.sellerId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (rental.rentalStatus !== "inspection") {
      return res.status(400).json({ success: false, message: "Rental is not in inspection state" });
    }

    rental.rentalStatus = "completed";
    rental.completedAt = new Date();

    if (!rental.damageReported && rental.securityDeposit > 0) {
      rental.depositRefundAmount = rental.securityDeposit;
    } else if (rental.damageReported) {
      rental.depositRefundAmount = Math.max(0, rental.securityDeposit - rental.damageFee);
    }

    await rental.save();

    return res.json({ success: true, data: rental });
  } catch (err) {
    console.error("completeRental error:", err);
    return res.status(500).json({ success: false, message: "Failed to complete rental" });
  }
};

exports.cancelRental = async (req, res) => {
  try {
    const rental = await RentalOrder.findOne({ rentalId: req.params.rentalId });
    if (!rental) return res.status(404).json({ success: false, message: "Rental not found" });
    if (rental.userId.toString() !== req.user.id && rental.sellerId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const nonCancellable = ["returned", "completed", "cancelled"];
    if (nonCancellable.includes(rental.rentalStatus)) {
      return res.status(400).json({ success: false, message: "Rental cannot be cancelled in current state" });
    }

    rental.rentalStatus = "cancelled";
    rental.cancelledAt = new Date();
    rental.cancelledBy = req.user.id;
    rental.cancellationReason = req.body.reason || "";
    await rental.save();

    return res.json({ success: true, data: rental });
  } catch (err) {
    console.error("cancelRental error:", err);
    return res.status(500).json({ success: false, message: "Failed to cancel rental" });
  }
};

exports.requestExtension = async (req, res) => {
  try {
    const rental = await RentalOrder.findOne({ rentalId: req.params.rentalId });
    if (!rental) return res.status(404).json({ success: false, message: "Rental not found" });
    if (rental.userId.toString() !== req.user.id) return res.status(403).json({ success: false, message: "Not authorized" });

    if (rental.rentalStatus !== "in_use") {
      return res.status(400).json({ success: false, message: "Can only extend active rentals" });
    }

    const { newEndDate, reason } = req.body;
    if (!newEndDate) return res.status(400).json({ success: false, message: "newEndDate is required" });

    const newEnd = new Date(newEndDate);
    if (newEnd <= rental.rentalEnd) {
      return res.status(400).json({ success: false, message: "New end date must be after current end date" });
    }

    const additionalDays = Math.ceil((newEnd - rental.rentalEnd) / (1000 * 60 * 60 * 24));
    if (additionalDays > rental.maxExtensionDays) {
      return res.status(400).json({ success: false, message: `Maximum extension is ${rental.maxExtensionDays} days` });
    }

    const additionalFee = additionalDays * rental.dailyRate * rental.quantity;

    rental.extensionRequests.push({
      requestedAt: new Date(),
      newEndDate: newEnd,
      additionalDays,
      additionalFee,
      status: "pending",
      reason,
    });

    await rental.save();

    return res.json({ success: true, data: rental });
  } catch (err) {
    console.error("requestExtension error:", err);
    return res.status(500).json({ success: false, message: "Failed to request extension" });
  }
};

exports.approveExtension = async (req, res) => {
  try {
    const rental = await RentalOrder.findOne({ rentalId: req.params.rentalId });
    if (!rental) return res.status(404).json({ success: false, message: "Rental not found" });
    if (rental.sellerId.toString() !== req.user.id) return res.status(403).json({ success: false, message: "Not authorized" });

    const idx = parseInt(req.params.requestIndex);
    if (idx < 0 || idx >= rental.extensionRequests.length) {
      return res.status(400).json({ success: false, message: "Invalid extension request index" });
    }

    const approved = rental.approveExtension(idx);
    if (!approved) {
      return res.status(400).json({ success: false, message: "Extension request is not pending" });
    }

    await rental.save();

    return res.json({ success: true, data: rental });
  } catch (err) {
    console.error("approveExtension error:", err);
    return res.status(500).json({ success: false, message: "Failed to approve extension" });
  }
};

exports.rejectExtension = async (req, res) => {
  try {
    const rental = await RentalOrder.findOne({ rentalId: req.params.rentalId });
    if (!rental) return res.status(404).json({ success: false, message: "Rental not found" });
    if (rental.sellerId.toString() !== req.user.id) return res.status(403).json({ success: false, message: "Not authorized" });

    const idx = parseInt(req.params.requestIndex);
    if (idx < 0 || idx >= rental.extensionRequests.length) {
      return res.status(400).json({ success: false, message: "Invalid extension request index" });
    }

    const rejected = rental.rejectExtension(idx);
    if (!rejected) {
      return res.status(400).json({ success: false, message: "Extension request is not pending" });
    }

    await rental.save();

    return res.json({ success: true, data: rental });
  } catch (err) {
    console.error("rejectExtension error:", err);
    return res.status(500).json({ success: false, message: "Failed to reject extension" });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const rental = await RentalOrder.findOne({ rentalId: req.params.rentalId });
    if (!rental) return res.status(404).json({ success: false, message: "Rental not found" });

    if (rental.userId.toString() !== req.user.id && rental.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (!req.body.message || !req.body.message.trim()) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    rental.messages.push({
      senderId: req.user.id,
      message: req.body.message.trim(),
      sentAt: new Date(),
    });

    await rental.save();

    return res.json({ success: true, data: rental.messages[rental.messages.length - 1] });
  } catch (err) {
    console.error("sendMessage error:", err);
    return res.status(500).json({ success: false, message: "Failed to send message" });
  }
};

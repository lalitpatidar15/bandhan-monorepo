const Cart = require("../../models/shared/Cart.js");
const Booking = require("../../models/shared/Booking.js");
const Service = require("../../models/shared/Service.js");
const Product = require("../../models/shared/Product.js");
const Venue = require("../../models/shared/Venue.js");
const { getSetting } = require("../../services/configService.js");

const PAYMENT_STATUSES = new Set(["pending", "authorized", "paid", "failed", "refunded", "partially_refunded"]);

function normalizePaymentStatus(value) {
  if (typeof value !== "string") return "pending";

  const normalized = value.trim().toLowerCase();
  if (normalized === "partial") return "partially_refunded";

  return PAYMENT_STATUSES.has(normalized) ? normalized : "pending";
}

function formatBookingPaymentResponse(booking, message) {
  return {
    success: true,
    message,
    orderId: booking._id,
    bookingId: booking._id,
    entityType: "booking",
    entityId: booking._id,
    amount: booking.pricing?.total || 0,
    currency: "INR",
    paymentMethod: booking.paymentMethod || "pending",
    paymentStatus: normalizePaymentStatus(booking.paymentStatus),
    orderStatus: booking.status,
    data: {
      booking,
      orderId: booking._id,
      paymentStatus: normalizePaymentStatus(booking.paymentStatus),
      orderStatus: booking.status,
    }
  };
}



//=========== ADD TO CART ============


exports.addToCart = async (req, res) => {
  try {
    const {
      serviceId,
      productId,
      venueId,
      quantity = 1,
      eventDate,
      guests,
      packageType,
      variant,
      rentalDays,
      bookingDate,
      startTime,
      endTime,
      guestCount,
    } = req.body;

    let itemType = "service";
    let title, image, price;

    if (venueId) {
      itemType = "venue";
      const venue = await Venue.findById(venueId);
      if (!venue) return res.status(404).json({ success: false, message: "Venue not found" });
      title = venue.name;
      image = venue.images?.[0] || "";
      price = venue.pricePerDay;
    } else if (productId) {
      itemType = "product";
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
      const selectedVariant = variant && product.variants
        ? product.variants.find(v => v.name === variant)
        : null;
      title = product.title;
      image = product.images?.[0] || "";
      price = selectedVariant?.price || product.price;
    } else if (serviceId) {
      const service = await Service.findById(serviceId);
      if (!service) {
        return res.status(404).json({ success: false, message: "Service not found" });
      }
      title = service.title;
      image = service.image;
      price = service.price;
    } else {
      return res.status(400).json({ success: false, message: "Product, service, or venue is required" });
    }

    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    const matchKey = venueId ? "venueId" : productId ? "productId" : "serviceId";
    const matchVal = venueId || productId || serviceId;

    const existingItem = cart.items.find(
      (item) => item[matchKey] && item[matchKey].toString() === matchVal
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      const base = {
        itemType,
        title,
        image,
        priceAtTime: price,
        quantity,
      };
      if (venueId) {
        cart.items.push({ ...base, venueId, bookingDate, startTime, endTime, guestCount, quantity: 1 });
      } else if (productId) {
        cart.items.push({ ...base, productId, variant, rentalDays });
      } else {
        cart.items.push({ ...base, serviceId, eventDate, guests, packageType });
      }
    }

    await cart.save();

    res.json({ success: true, message: "Item added to cart", cart });

  } catch (error) {
    console.error("addToCart error:", error);
    res.status(500).json({ success: false, message: "Failed to add item to cart" });
  }
};

// ============ GET CART ================

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart || cart.items.length === 0) {
      return res.json({
        success: true,
        isEmpty: true,
        items: [],
        summary: {
          subtotal: 0,
          serviceFee: 0,
          tax: 0,
          total: 0,
        },
      });
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + (item.priceAtTime || 0) * (item.quantity || 1),
      0
    );

    const [serviceFee, rawTaxRate] = await Promise.all([
      getSetting("serviceFee"),
      getSetting("taxRate"),
    ]);
    const tax = Math.round(subtotal * (rawTaxRate || 0));
    const total = subtotal + (serviceFee || 0) + tax;

    res.json({
      success: true,
      isEmpty: false,
      items: cart.items,
      summary: { subtotal, serviceFee: serviceFee || 0, tax, total },
    });

  } catch (error) {
    console.error("getCart error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch cart" });
  }
};



// ============== UPDATE QUANTITY ===============

exports.updateCartItem = async (req, res) => {
  try {
    const { serviceId, productId, venueId, quantity } = req.body;

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const matchKey = venueId ? "venueId" : productId ? "productId" : "serviceId";
    const matchVal = venueId || productId || serviceId;

    const item = cart.items.find(
      (i) => i[matchKey] && i[matchKey].toString() === matchVal
    );

    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter(
        (i) => !(i[matchKey] && i[matchKey].toString() === matchVal)
      );
    } else {
      item.quantity = quantity;
    }

    await cart.save();

    res.json({ success: true, message: "Cart updated", cart });

  } catch (error) {
    console.error("Error in controllers/ecommUser/cartController.js:", error);

    res.status(500).json({ success: false, message: "Failed to update cart" });
  }
};



// ============ REMOVE ITEM ============

exports.removeFromCart = async (req, res) => {
  try {
    const { serviceId, productId, venueId } = req.params;

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const matchKey = venueId ? "venueId" : productId ? "productId" : "serviceId";
    const matchVal = venueId || productId || serviceId;

    cart.items = cart.items.filter(
      (item) => !(item[matchKey] && item[matchKey].toString() === matchVal)
    );

    await cart.save();

    res.json({ success: true, message: "Item removed", cart });

  } catch (error) {
    console.error("Error in controllers/ecommUser/cartController.js:", error);

    res.status(500).json({ success: false, message: "Failed to remove item" });
  }
};



// ============ CLEAR CART ==============
exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { userId: req.user.id },
      { items: [] }
    );

    res.json({
      success: true,
      message: "Cart cleared",
    });

  } catch (error) {
    console.error("Error in controllers/ecommUser/cartController.js:", error);

    res.status(500).json({ success: false, message: "Failed to clear cart" });
  }
};


// ======== create booking ========
exports.createBooking = async (req, res) => {
  try {
     console.log("BODY:", req.body); 
    console.log("USER:", req.user);
    const userId = req.user.id;

    const cart = await Cart.findOne({ userId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty"
      });
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + (item.priceAtTime || 0) * (item.quantity || 1),
      0
    );

    const [serviceFee, rawTaxRate] = await Promise.all([
      getSetting("serviceFee"),
      getSetting("taxRate"),
    ]);
    const tax = Math.round(subtotal * (rawTaxRate || 0));
    const total = subtotal + (serviceFee || 0) + tax;

    const booking = await Booking.create({
      userId,
      items: cart.items, 
      pricing: { subtotal, serviceFee: serviceFee || 0, tax, total },
      status: "pending"
    });

    res.json(formatBookingPaymentResponse(booking, "Booking created successfully"));

  } catch (err) {
    console.error("Error in controllers/ecommUser/cartController.js:", err);

    res.status(500).json({ success: false, message: "Failed to create booking" });
  }
};

//  ======== checkout booking ========
exports.checkoutBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullAddress, city, pincode, paymentMethod } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(400).json({ success: false, message: "Booking is already paid" });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      {
        address: { fullAddress, city, pincode },
        paymentMethod: paymentMethod || "pending",
        paymentStatus: normalizePaymentStatus("pending"),
        status: booking.status || "confirmed"
      },
      { new: true, runValidators: true }
    );

    await Cart.findOneAndUpdate(
      { userId: booking.userId },
      { items: [] }
    );

    res.json(formatBookingPaymentResponse(updatedBooking, "Checkout completed"));

  } catch (err) {
    console.error("Error in controllers/ecommUser/cartController.js:", err);

    res.status(500).json({ success: false, message: "Checkout failed" });
  }
};


// ========== booking success ========
exports.getBookingSuccess = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate("items.serviceId");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.json(formatBookingPaymentResponse(booking, "Booking details fetched successfully"));

  } catch (err) {
    console.error("Error in controllers/ecommUser/cartController.js:", err);

    res.status(500).json({ success: false, message: "Failed to fetch booking details" });
  }
};


// ========== order tracking ========
exports.getOrderTracking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate("items.serviceId");

    res.json({
      success: true,
      tracking: {
        orderId: booking._id,
        status: booking.status,
        steps: [
          { label: "Booked", completed: true },
          { label: "Confirmed", completed: booking.status === "confirmed" },
          { label: "In Service", completed: false },
          { label: "Completed", completed: false }
        ],
        items: booking.items,
        address: booking.address,
        pricing: booking.pricing,
        bookingDate: booking.createdAt
      }
    });

  } catch (err) {
    console.error("Error in controllers/ecommUser/cartController.js:", err);

    res.status(500).json({ success: false, message: "Failed to fetch order tracking" });
  }
};


// =========== GET SUGGESTIONS =========== event planner
exports.getSuggestions = async (req, res) => {
  try {
    const {
      eventType,
      guestCount,
      minBudget,
      maxBudget,
      location,
    } = req.query;

    let filter = { isActive: true };

    if (eventType) {
      filter.eventType = { $in: [eventType.toLowerCase()] };
    }

    if (guestCount) {
      filter.minGuests = { $lte: Number(guestCount) };
      filter.maxGuests = { $gte: Number(guestCount) };
    }

    if (minBudget && maxBudget) {
      filter.price = {
        $gte: Number(minBudget),
        $lte: Number(maxBudget),
      };
    }

    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    const services = await Service.find(filter).sort({ rating: -1 });

    res.json({
      success: true,
      total: services.length,
      services,
    });

  } catch (error) {
    console.error("Error in controllers/ecommUser/cartController.js:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch suggestions"
    });
  }
};

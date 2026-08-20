const Conversation = require("../../models/shared/Conversation.js");
const Message = require("../../models/shared/Message.js");
const User = require("../../models/shared/User.js");
const Order = require("../../models/shared/Order.js");
const Quote = require("../../models/shared/Quote.js");
const RentalOrder = require("../../models/shared/RentalOrder.js");
const mongoose = require("mongoose");
const { buildConversationQuoteContext } = require("../../utils/chatEligibility.js");

const populateUserFields = "fullName profilePic email role";

function normalizeRole(role) {
  return String(role || "").trim().toLowerCase();
}

function normalizeQuoteStatus(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (["accepted", "approved"].includes(normalized)) return "approved";
  if (["rejected", "declined"].includes(normalized)) return "rejected";
  if (["pending", "open"].includes(normalized)) return "pending";
  return normalized || "pending";
}

async function getConversationQuoteStatus(conversation) {
  if (!conversation) return "pending";

  const directStatus = normalizeQuoteStatus(conversation.status || conversation.quoteStatus);
  if (directStatus && directStatus !== "pending") return directStatus;

  if (conversation.quoteId) {
    const quote = await Quote.findById(conversation.quoteId).select("status");
    if (quote && quote.status) {
      return normalizeQuoteStatus(quote.status);
    }
  }

  return "pending";
}

function normalizeId(value) {
  if (!value) return "";
  if (typeof value === "object") {
    return String(value._id || value.id || value.toString() || "");
  }
  return String(value);
}

exports.createConversation = async (req, res) => {
  try {
    const serviceId = normalizeId(req.body.serviceId);
    const venueId = normalizeId(req.body.venueId);
    const orderId = normalizeId(req.body.orderId);
    const productId = normalizeId(req.body.productId);
    const rentalOrderId = normalizeId(req.body.rentalOrderId);
    const quoteId = normalizeId(req.body.quoteId);
    let buyerId = normalizeId(req.body.buyerId);
    let sellerId = normalizeId(req.body.sellerId);

    // A chat is only allowed after a quote request, rental order, or explicit quoteId.
    if (!serviceId && !venueId && !productId && !rentalOrderId && !quoteId) {
      return res.status(400).json({
        success: false,
        message: "A verified quote request or rental order is required to start a chat.",
      });
    }
    if (orderId) return res.status(403).json({ success: false, message: "Product purchases do not create chat threads." });

    const currentRole = normalizeRole(req.user.role);
    let serviceDoc = null;
    let venueDoc = null;
    let productDoc = null;
    if (quoteId) {
      const requestedQuote = await Quote.findById(quoteId).lean();
      if (!requestedQuote) {
        return res.status(404).json({ success: false, message: "Quote not found." });
      }
      const quoteStatus = normalizeQuoteStatus(requestedQuote.status);
      if (quoteStatus === "rejected") {
        return res.status(403).json({
          success: false,
          message: "Chat is disabled because this quote request was rejected.",
        });
      }

      if (!sellerId && requestedQuote.sellerId) sellerId = normalizeId(requestedQuote.sellerId);
      if (!buyerId && requestedQuote.userId) buyerId = normalizeId(requestedQuote.userId);
      if (!serviceId && requestedQuote.serviceId) serviceId = normalizeId(requestedQuote.serviceId);
      if (!venueId && requestedQuote.venueId) venueId = normalizeId(requestedQuote.venueId);
      if (!productId && requestedQuote.productId) productId = normalizeId(requestedQuote.productId);

      if (sellerId && requestedQuote.sellerId && String(sellerId) !== String(requestedQuote.sellerId)) {
        return res.status(403).json({ success: false, message: "Seller mismatch for this quote." });
      }
      if (buyerId && requestedQuote.userId && String(buyerId) !== String(requestedQuote.userId)) {
        return res.status(403).json({ success: false, message: "Buyer mismatch for this quote." });
      }
    }

    if (serviceId) {
      const Service = require("../../models/shared/Service.js");
      serviceDoc = await Service.findById(serviceId).lean();
      if (!serviceDoc) return res.status(404).json({ success: false, message: "Service not found." });
    }
    if (venueId) {
      const Venue = require("../../models/shared/Venue.js");
      venueDoc = await Venue.findById(venueId).lean();
      if (!venueDoc) return res.status(404).json({ success: false, message: "Venue not found." });
    }
    if (productId) {
      const Product = require("../../models/shared/Product.js");
      productDoc = await Product.findById(productId).lean();
      if (!productDoc) return res.status(404).json({ success: false, message: "Product not found." });
    }
    const order = orderId
      ? (mongoose.Types.ObjectId.isValid(orderId)
          ? await Order.findById(orderId)
          : await Order.findOne({ orderId: orderId }))
      : null;

    if (orderId && !order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const rental = rentalOrderId ? await RentalOrder.findById(rentalOrderId) : null;
    if (rentalOrderId && !rental) return res.status(404).json({ success: false, message: "Rental order not found." });
    const orderBuyerId = rental ? normalizeId(rental.userId) : order ? normalizeId(order.buyerId) : "";
    const orderSellerId = rental
      ? normalizeId(rental.sellerId)
      : serviceDoc
        ? normalizeId(serviceDoc.sellerId)
        : venueDoc
          ? normalizeId(venueDoc.sellerId || venueDoc.ownerId || venueDoc.managerId || "")
          : productDoc
            ? normalizeId(productDoc.sellerId)
            : order
              ? (normalizeId(order.sellerId) || normalizeId(order.items?.[0]?.sellerId))
              : "";

    const authenticatedUserId = normalizeId(req.user._id || req.user.id);

    if (currentRole === "seller") {
      if (quoteId && sellerId && String(sellerId) !== authenticatedUserId) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to chat for this quote.",
        });
      }
      if (orderSellerId && orderSellerId !== authenticatedUserId) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to chat for this order.",
        });
      }
      sellerId = authenticatedUserId;
      if (!quoteId) {
        buyerId = orderBuyerId;
      }
    } else if (currentRole === "buyer") {
      if (quoteId && buyerId && String(buyerId) !== authenticatedUserId) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to chat for this quote.",
        });
      }
      if (orderBuyerId && orderBuyerId !== authenticatedUserId) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to chat for this order.",
        });
      }
      buyerId = authenticatedUserId;
      if (!quoteId) {
        sellerId = orderSellerId;
      }
    } else {
      sellerId = sellerId || orderSellerId;
      buyerId = buyerId || orderBuyerId;
    }

    if (!sellerId || !buyerId) {
      return res.status(400).json({
        success: false,
        message: "Both sellerId and buyerId are required to create a conversation.",
      });
    }

    if (String(sellerId) === String(buyerId)) {
      return res.status(400).json({
        success: false,
        message: "Seller and buyer cannot be the same user.",
      });
    }

    const firstItem = order ? (Array.isArray(order.items) ? order.items[0] : null) : null;
    const resolvedProductId = productId || (firstItem?.productId ? String(firstItem.productId) : "");
    const resolvedProductName = req.body.productName || (order ? order.productName : undefined) || firstItem?.title || "";
    const resolvedAmount = req.body.amount || (order ? (order.amount || order.total) : 0) || 0;
    const resolvedShippingAddress = order ? order.shippingAddress || {} : {};
    const resolvedOrderStatus = order ? (order.orderStatus || order.status || "pending") : "";
    const resolvedProductImage = firstItem?.image || firstItem?.productSnapshot?.images?.[0] || req.body.productImage || "";

    // If this is a service-only conversation, try to resolve service metadata
    if (serviceId) {
      if (!sellerId && serviceDoc?.sellerId) sellerId = normalizeId(serviceDoc.sellerId);
    }

    const payload = {
      buyerId,
      sellerId,
      participants: [buyerId, sellerId].filter(Boolean),
      productId: resolvedProductId || null,
      serviceId: serviceId || null,
      venueId: venueId || null,
      orderId: orderId || null,
      rentalOrderId: rentalOrderId || null,
      productName: resolvedProductName || undefined,
      amount: resolvedAmount,
      orderStatus: resolvedOrderStatus,
      shippingAddress: resolvedShippingAddress,
      productImage: resolvedProductImage,
      serviceImage: serviceDoc?.image || undefined,
      orderNumber: order?.orderId || order?._id?.toString() || rental?.rentalId || rentalOrderId || "",
    };

    const [sellerUser, buyerUser] = await Promise.all([
      User.findById(payload.sellerId).select("fullName"),
      User.findById(payload.buyerId).select("fullName"),
    ]);

    const conversationData = {
      ...payload,
      sellerName: sellerUser?.fullName || req.body.sellerName || "",
      buyerName: buyerUser?.fullName || req.body.buyerName || "",
      customerId: payload.buyerId,
      customerName: buyerUser?.fullName || req.body.buyerName || "",
    };

    if (serviceDoc) {
      conversationData.serviceName = serviceDoc.title || serviceDoc.name || conversationData.serviceName || "";
      conversationData.serviceImage = serviceDoc.image || conversationData.serviceImage || "";
    }
    if (productDoc) {
      conversationData.productName = productDoc.title || productDoc.name || conversationData.productName || "";
      conversationData.productImage = productDoc.images?.[0] || conversationData.productImage || "";
    }

    let quote = null;
    if (quoteId || serviceId || venueId || productId) {
      const quoteQuery = {
        userId: buyerId,
        sellerId,
      };
      if (serviceId) quoteQuery.serviceId = serviceId;
      if (venueId) quoteQuery.venueId = venueId;
      if (productId) quoteQuery.productId = productId;
      if (quoteId) quoteQuery._id = quoteId;
      quote = quote || (await Quote.findOne(quoteQuery).sort({ createdAt: -1 }));
    }

    const quoteContext = buildConversationQuoteContext({ quote });
    if ((serviceId || venueId || productId) && !quote && !req.body.quoteId) {
      return res.status(403).json({
        success: false,
        message: "A quote request is required before starting a chat.",
      });
    }

    const payloadWithQuote = {
      ...payload,
      quoteId: quote?._id || null,
      quoteStatus: quoteContext.quoteStatus,
      quoteEventDate: quoteContext.quoteEventDate,
      quoteGuestRange: quoteContext.quoteGuestRange,
      quoteBudget: quoteContext.quoteBudget,
      quoteServices: quoteContext.quoteServices,
      quoteNote: quoteContext.quoteNote,
      quoteFullName: quoteContext.quoteFullName,
      quotePhone: quoteContext.quotePhone,
      quoteEmail: quoteContext.quoteEmail,
      quoteListingType: quoteContext.quoteListingType,
    };

    const conversationDataWithQuote = {
      ...conversationData,
      ...payloadWithQuote,
    };

    // Ensure conversations are unique per quote, service/product, order, and participants
    const query = {
      sellerId: conversationDataWithQuote.sellerId,
      buyerId: conversationDataWithQuote.buyerId,
    };
    if (conversationDataWithQuote.quoteId) query.quoteId = conversationDataWithQuote.quoteId;
    if (conversationDataWithQuote.serviceId) query.serviceId = conversationDataWithQuote.serviceId;
    if (conversationDataWithQuote.productId) query.productId = conversationDataWithQuote.productId;
    if (conversationDataWithQuote.orderId) query.orderId = conversationDataWithQuote.orderId;
    if (conversationDataWithQuote.rentalOrderId) query.rentalOrderId = conversationDataWithQuote.rentalOrderId;

    const existingConversation = await Conversation.findOne(query);
    if (existingConversation) {
      const populatedExistingConversation = await Conversation.findById(existingConversation._id)
        .populate("sellerId", populateUserFields)
        .populate("buyerId", populateUserFields)
        .populate("serviceId")
        .populate("productId")
        .populate("orderId")
        .populate("rentalOrderId");

      if (req.io) {
        req.io.to(String(existingConversation.buyerId)).emit("conversation_updated", populatedExistingConversation);
        req.io.to(String(existingConversation.sellerId)).emit("conversation_updated", populatedExistingConversation);
      }

      return res.json({ success: true, conversation: populatedExistingConversation || existingConversation });
    }

    const conversation = await Conversation.create(conversationDataWithQuote);
    const populatedConversation = await Conversation.findById(conversation._id)
      .populate("sellerId", populateUserFields)
      .populate("buyerId", populateUserFields)
      .populate("serviceId")
      .populate("productId")
      .populate("orderId")
      .populate("rentalOrderId");

    if (req.io) {
      req.io.to(String(conversation.buyerId)).emit("conversation_updated", populatedConversation);
      req.io.to(String(conversation.sellerId)).emit("conversation_updated", populatedConversation);
    }

    res.json({ success: true, conversation: populatedConversation || conversation });
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ success: false, message: "Failed to create conversation." });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const userId = normalizeId(req.user._id || req.user.id);

    const conversations = await Conversation.find({
      $or: [{ sellerId: userId }, { buyerId: userId }],
    })
      .sort({ updatedAt: -1 })
      .populate("sellerId", populateUserFields)
      .populate("buyerId", populateUserFields)
      .populate("serviceId")
      .populate("productId")
      .populate("orderId")
      .populate("rentalOrderId");

    res.json({ success: true, conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ success: false, message: "Failed to fetch conversations." });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const conversationId = req.params.conversationId || req.params.id;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
    const skip = (page - 1) * limit;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found." });
    }

    const userId = normalizeId(req.user._id || req.user.id);
    if (String(conversation.sellerId) !== userId && String(conversation.buyerId) !== userId) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    const total = await Message.countDocuments({ conversationId });
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate("senderId", populateUserFields);

    res.json({
      success: true,
      messages,
      pagination: {
        page,
        limit,
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ success: false, message: "Failed to fetch messages." });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const conversationId = req.body.conversationId || req.params.id;
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found." });
    }

    const userId = normalizeId(req.user._id || req.user.id);
    if (String(conversation.sellerId) !== userId && String(conversation.buyerId) !== userId) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    const quoteStatus = await getConversationQuoteStatus(conversation);
    if (quoteStatus === "rejected") {
      return res.status(403).json({
        success: false,
        message: "Chat is disabled because this quote request was rejected.",
      });
    }

    const senderRole = normalizeRole(req.user.role) || "customer";
    const messageData = {
      conversationId,
      senderId: req.user.id,
      senderRole,
      text: req.body.text || "",
      image: req.body.image || "",
    };

    const message = await Message.create(messageData);
    const lastMessageText = message.text || (message.image ? "Image" : "New message");

    const updateFields = {
      lastMessage: lastMessageText,
      lastMessageAt: new Date(),
    };
    if (senderRole === "seller") {
      updateFields.unreadCountBuyer = (conversation.unreadCountBuyer || 0) + 1;
    } else {
      updateFields.unreadCountSeller = (conversation.unreadCountSeller || 0) + 1;
    }

    const updatedConversation = await Conversation.findByIdAndUpdate(conversationId, updateFields, { new: true });

    const populatedMessage = await Message.findById(message._id).populate("senderId", populateUserFields);

    if (req.io) {
      const receivePayload = {
        conversationId,
        message: populatedMessage,
      };

      req.io.to(conversationId).emit("receive_message", receivePayload);
      req.io.to(String(conversation.buyerId)).emit("receive_message", receivePayload);
      req.io.to(String(conversation.sellerId)).emit("receive_message", receivePayload);
      req.io.to(String(conversation.buyerId)).emit("conversation_updated", updatedConversation);
      req.io.to(String(conversation.sellerId)).emit("conversation_updated", updatedConversation);
    }

    res.json({ success: true, message: populatedMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, message: "Failed to send message." });
  }
};

exports.markMessagesRead = async (req, res) => {
  try {
    const conversationId = req.params.conversationId || req.params.id;
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found." });
    }

    const userId = normalizeId(req.user._id || req.user.id);
    if (String(conversation.sellerId) !== userId && String(conversation.buyerId) !== userId) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    const currentRole = normalizeRole(req.user.role);
    const updateFields = {};
    if (currentRole === "seller") {
      updateFields.unreadCountSeller = 0;
    } else if (currentRole === "buyer") {
      updateFields.unreadCountBuyer = 0;
    }

    await Message.updateMany(
      {
        conversationId,
        senderId: { $ne: req.user.id },
        seen: false,
      },
      { seen: true }
    );

    const updatedConversation = await Conversation.findByIdAndUpdate(conversationId, updateFields, { new: true });

    if (req.io) {
      req.io.to(conversationId).emit("messagesRead", { conversationId, userId });
      req.io.to(String(conversation.buyerId)).emit("conversation_updated", updatedConversation);
      req.io.to(String(conversation.sellerId)).emit("conversation_updated", updatedConversation);
    }

    res.json({ success: true, conversation: updatedConversation });
  } catch (error) {
    console.error("Error marking messages read:", error);
    res.status(500).json({ success: false, message: "Failed to mark messages as read." });
  }
};

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image file is required." });
    }

    const imageUrl = req.file.url || req.file.path || "";
    res.json({ success: true, url: imageUrl });
  } catch (error) {
    console.error("Error uploading chat image:", error);
    res.status(500).json({ success: false, message: "Failed to upload chat image." });
  }
};

exports.markSeen = exports.markMessagesRead;

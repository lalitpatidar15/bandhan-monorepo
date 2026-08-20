const mongoose = require("mongoose");
const User = require("../../models/shared/User.js");
const Service = require("../../models/shared/Service.js");
const Quote = require("../../models/shared/Quote.js");
const Conversation = require("../../models/shared/Conversation.js");
const Product = require("../../models/shared/Product.js");
const { buildConversationQuoteContext } = require("../../utils/chatEligibility.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("../../config/cloudinary.js");

function normalizeListingType(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "services") return "service";
  if (normalized === "venues") return "venue";
  if (normalized === "products") return "product";
  return normalized;
}

function formatSuggestion(service) {
  return {
    id: service._id,
    title: service.title || "Untitled Service",
    category: service.category || "service",
    price: Number(service.price || 0),
    rating: Number(service.rating || 0),
    location: service.location || "Location not specified",
    image: service.image || "",
    description: service.description || "",
    eventType: service.eventType || "",
    guests: {
      min: Number(service.minGuests || 0),
      max: Number(service.maxGuests || 0),
    },
  };
}

// ========= request- quote ========
exports.createQuote = async (req, res) => {
  try {
    const {
      eventType,
      eventDate,
      location,
      guestRange,
      services,
      budget,
      isBudgetFlexible,
      note,
      fullName,
      phone,
      email,
      serviceId,
      venueId,
      productId,
      listingType
    } = req.body;

    if (
      !eventType ||
      !eventDate ||
      !location ||
      !guestRange ||
      !budget ||
      !fullName ||
      !phone ||
      !email
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    const cleanDate =
      typeof eventType === "string" && typeof eventDate === "string" && eventDate.includes("T")
        ? eventDate.split("T")[0]
        : String(eventDate || "");

    const selectedServices = Array.isArray(services) ? services : [];

    const ServiceModel = require("../../models/shared/Service.js");
    const Venue = require("../../models/shared/Venue.js");
    const validServiceId = serviceId && mongoose.Types.ObjectId.isValid(serviceId) ? serviceId : null;
    const validProductId = productId && mongoose.Types.ObjectId.isValid(productId) ? productId : null;
    const validVenueId = venueId && mongoose.Types.ObjectId.isValid(venueId) ? venueId : null;

    const listing = validServiceId
      ? await ServiceModel.findById(validServiceId).select("sellerId title price")
      : validProductId
        ? await Product.findById(validProductId).select("sellerId name title price")
        : validVenueId
          ? await Venue.findById(validVenueId).select("sellerId ownerId managerId name pricePerDay")
          : null;

    if ((serviceId || productId || venueId) && !listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }
    const sellerId = listing?.sellerId || listing?.ownerId || listing?.managerId;
    const buyerId = req.user?.id;
    const listingTypeValue = normalizeListingType(
      listingType || (serviceId ? "service" : productId ? "product" : venueId ? "venue" : "service")
    ) || "service";

    if (!["service", "venue", "product"].includes(listingTypeValue)) {
      return res.status(400).json({
        success: false,
        message: "listingType must be service, venue, or product",
      });
    }

    const listingTitle = validServiceId
      ? listing?.title || ""
      : validProductId
        ? listing?.title || listing?.name || ""
        : validVenueId
          ? listing?.name || listing?.title || ""
          : undefined;
    const listingPrice = validServiceId
      ? Number(listing?.price || 0)
      : validProductId
        ? Number(listing?.price || 0)
        : validVenueId
          ? Number((listing?.pricePerDay || 0))
          : undefined;

    const quote = await Quote.create({
      userId: buyerId, // optional login
      sellerId,
      serviceId: validServiceId || undefined,
      venueId: validVenueId || undefined,
      productId: validProductId || undefined,
      listingType: listingTypeValue,
      eventType,
      eventDate: cleanDate,
      location,
      guestRange,
      services: selectedServices,
      budget,
      isBudgetFlexible,
      note,
      fullName,
      phone,
      email,
      title: listingTitle,
      price: listingPrice,
    });

    let conversationId = null;

    if (
      mongoose.Types.ObjectId.isValid(String(buyerId || "")) &&
      mongoose.Types.ObjectId.isValid(String(sellerId || ""))
    ) {
      const [sellerUser, buyerUser] = await Promise.all([
        User.findById(sellerId).select("fullName"),
        User.findById(buyerId).select("fullName"),
      ]);

      const quoteContext = buildConversationQuoteContext({ quote });
      const existingConversation = await Conversation.findOne({
        sellerId,
        buyerId,
        quoteId: quote._id,
      });

      if (!existingConversation) {
        const conversation = await Conversation.create({
          participants: [buyerId, sellerId],
          buyerId,
          sellerId,
          buyerName: buyerUser?.fullName || fullName,
          sellerName: sellerUser?.fullName || "Seller",
          serviceId: validServiceId || undefined,
          venueId: validVenueId || undefined,
          productId: validProductId || undefined,
          quoteId: quote._id,
          quoteStatus: quoteContext.quoteStatus || "pending",
          status: "pending",
          quoteEventDate: quoteContext.quoteEventDate,
          quoteGuestRange: quoteContext.quoteGuestRange,
          quoteBudget: quoteContext.quoteBudget,
          quoteServices: quoteContext.quoteServices,
          quoteNote: quoteContext.quoteNote,
          quoteFullName: quoteContext.quoteFullName,
          quotePhone: quoteContext.quotePhone,
          quoteEmail: quoteContext.quoteEmail,
          quoteListingType: quoteContext.quoteListingType,
          orderNumber: "",
          lastMessage: "New quote request submitted.",
          lastMessageAt: new Date(),
          customerId: buyerId,
          customerName: buyerUser?.fullName || fullName,
        });
        conversationId = conversation._id;
      } else {
        await Conversation.findByIdAndUpdate(existingConversation._id, {
          quoteStatus: quoteContext.quoteStatus || "pending",
          status: "pending",
          lastMessage: existingConversation.lastMessage || "New quote request submitted.",
          lastMessageAt: existingConversation.lastMessageAt || new Date(),
        });
        conversationId = existingConversation._id;
      }
    }

    res.status(201).json({
      success: true,
      message: "Quote request created successfully",
      quoteId: quote._id,
      conversationId,
      data: quote,
    });

  } catch (error) {
    console.error("Error in controllers/ecommUser/userController.js:", error);

    res.status(500).json({
      success: false,
      message: "Failed to process user request",
    });
  }
};

exports.getMyQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find({ userId: req.user.id })
      .populate("serviceId", "title image category price sellerId")
      .populate("venueId", "name images location price ownerId managerId")
      .populate("productId", "name title images price sellerId")
      .populate("sellerId", "fullName email profilePic")
      .sort({ createdAt: -1 });

    const quoteIds = quotes.map((quote) => quote._id);
    const conversations = await Conversation.find({
      buyerId: req.user.id,
      quoteId: { $in: quoteIds },
    }).select("_id quoteId sellerId sellerName");

    const conversationByQuote = new Map(
      conversations.map((conversation) => [String(conversation.quoteId), conversation])
    );

    res.json({
      success: true,
      data: quotes.map((quote) => ({
        ...quote.toObject(),
        conversationId: conversationByQuote.get(String(quote._id))?._id || null,
        conversationSellerName: conversationByQuote.get(String(quote._id))?.sellerName || "",
      })),
    });
  } catch (error) {
    console.error("Error fetching user quotes:", error);
    res.status(500).json({ success: false, message: "Failed to fetch your quotes." });
  }
};


// ========= role selection ========
exports. userPath = async (req, res) => {
  try {
    const { role } = req.body;


    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required"
      });
    }

    const validRoles = ["buyer", "eventOwner", "learner", "jobSeeker"];

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role selected"
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user.role = role;
    user.onboardingStep = 2;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User path selected successfully",
      data: user
    });

  } catch (error) {
    console.log("ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ========= update user ========
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const allowedFields = ["name", "phone", "email", "profileImage", "bio", "address"];
    
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided to update"
      });
    }

    const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user"
    });
  }
};

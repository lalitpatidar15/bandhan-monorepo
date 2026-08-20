const mongoose = require("mongoose");
const Review = require("../../models/shared/Review.js");
const Product = require("../../models/shared/Product.js");
const User = require("../../models/shared/User.js"); // Added User Model to fetch logged-in user details
const cloudinary = require("../../config/cloudinary.js");
const {
  getAuthenticatedOwnerId,
  isAdmin,
  buildOwnerScopeFilter,
} = require("../../utils/ownership.js");
const { resolveBuyerIdentity, resolveSellerIdentity } = require("../../utils/ecommIdentity.js");

const buildReviewOwnershipFilter = (req, extra = {}) => {
  if (isAdmin(req)) {
    return extra;
  }

  const sellerId = getAuthenticatedOwnerId(req);
  const buyerId = req.user?.id || req.user?._id;
  if (!sellerId && !buyerId) {
    return extra;
  }

  if (sellerId && buyerId && sellerId !== buyerId) {
    return { ...extra, $or: [{ sellerId }, { userId: buyerId }] };
  }

  if (sellerId) {
    return { ...extra, sellerId };
  }

  return { ...extra, userId: buyerId };
};

// CREATE REVIEW (FIXED: Auto-fetches logged-in User's real name)
exports.createReview = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user && (req.user._id || req.user.id);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "productId is required" });
    }

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(productId).select("sellerId title");
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const resolvedSellerId = product.sellerId;
    if (!resolvedSellerId) {
      return res.status(400).json({
        success: false,
        message: "sellerId could not be resolved for this product",
      });
    }

    const existingReview = await Review.findOne({ productId, userId }).select("_id");
    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product. You can edit your existing review.",
      });
    }

    let imageUrl = "";
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "reviews",
      });
      imageUrl = result.secure_url;
    }

    const dbUser = userId ? await User.findById(userId).select("name nameEn fullName profileImage email") : null;
    const buyerIdentity = resolveBuyerIdentity(req.body, dbUser || req.user || {});
    const sellerUser = resolvedSellerId ? await User.findById(resolvedSellerId).select("name nameEn fullName email") : null;
    const sellerIdentity = resolveSellerIdentity(req.body, sellerUser || {});

    let resolvedCustomerName = buyerIdentity.name;
    if (!resolvedCustomerName || resolvedCustomerName === "Anonymous") {
      resolvedCustomerName = req.user?.name || req.user?.fullName || "Guest Customer";
    }

    const data = await Review.create({
      productId,
      sellerId: resolvedSellerId,
      userId,
      customerName: resolvedCustomerName,
      customerEmail: buyerIdentity.email,
      sellerName: sellerIdentity.name,
      sellerEmail: sellerIdentity.email,
      customerImage: imageUrl,
      productName: req.body.productName || (product && product.title) || "",
      rating: Number(req.body.rating),
      title: req.body.title,
      comment: req.body.comment,
    });

    res.json({ success: true, review: data });
  } catch (error) {
    console.error("Error in controllers/ecommUser/reviewController.js:", error);

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product. You can edit your existing review.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to process review request",
    });
  }
};

// GET ALL REVIEWS BY PRODUCT (FIXED: Added populate & fallback mapping)
exports.getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "productId is required" });
    }

    const filter = { productId };
    const rawReviews = await Review.find(filter)
      .populate("userId", "name fullName nameEn profileImage") // Fetch live user details
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Mapping real customer name seamlessly
    const reviews = rawReviews.map((r) => {
      const realUser = r.userId;
      const realName =
        realUser?.name ||
        realUser?.fullName ||
        realUser?.nameEn ||
        (r.customerName && r.customerName !== "Anonymous" ? r.customerName : "Customer");

      return {
        ...r,
        customerName: realName,
        customerImage: r.customerImage || realUser?.profileImage || "",
      };
    });

    const total = await Review.countDocuments(filter);
    const averageRating =
      total > 0
        ? Number(
            (
              await Review.aggregate([
                { $match: filter },
                { $group: { _id: null, avgRating: { $avg: "$rating" } } },
              ])
            )[0]?.avgRating?.toFixed(1) || 0
          )
        : 0;

    res.json({
      success: true,
      reviews,
      total,
      averageRating,
    });
  } catch (error) {
    console.error(
      "Error in controllers/ecommUser/reviewController.js (getReviewsByProduct):",
      error
    );
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch product reviews" });
  }
};

// GET REVIEWS FOR SELLER DASHBOARD (FIXED: Added populate & fallback mapping)
exports.getReviews = async (req, res) => {
  try {
    const { rating, needsResponse, page = 1, limit = 10 } = req.query;

    const filter = req.query.mine === "true"
      ? { userId: req.user?.id || req.user?._id || null }
      : buildOwnerScopeFilter(req, {});

    if (rating) {
      filter.rating = Number(rating);
    }

    if (needsResponse === "true") {
      filter.sellerReply = "";
    }

    const rawData = await Review.find(filter)
      .populate("userId", "name fullName nameEn profileImage") // Populates Real Customer Data
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    // Ensure customerName is always real user's name
    const data = rawData.map((r) => {
      const realUser = r.userId;
      const realName =
        realUser?.name ||
        realUser?.fullName ||
        realUser?.nameEn ||
        (r.customerName && r.customerName !== "Anonymous" ? r.customerName : "Customer");

      return {
        ...r,
        customerName: realName,
        customerImage: r.customerImage || realUser?.profileImage || "",
      };
    });

    const total = await Review.countDocuments(filter);

    res.json({
      success: true,
      total,
      currentPage: Number(page),
      reviews: data,
    });
  } catch (error) {
    console.error("Error fetching seller reviews:", error);
    res.status(500).json({ success: false, message: "Failed to fetch reviews" });
  }
};

// REVIEW SUMMARY
exports.reviewSummary = async (req, res) => {
  try {
    const filter = buildOwnerScopeFilter(req, {});
    const reviews = await Review.find(filter);

    const totalReviews = reviews.length;

    const avg =
      totalReviews > 0
        ? (reviews.reduce((a, b) => a + b.rating, 0) / totalReviews).toFixed(1)
        : 0;

    const distribution = {
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
    };

    res.json({
      success: true,
      averageRating: avg,
      totalReviews,
      distribution,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get summary" });
  }
};

// REPLY TO REVIEW
exports.replyReview = async (req, res) => {
  try {
    const data = await Review.findOneAndUpdate(
      buildReviewOwnershipFilter(req, { _id: req.params.id }),
      {
        sellerReply: req.body.reply,
        repliedAt: new Date(),
      },
      {
        new: true,
      }
    );

    if (!data) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    // Create a user notification for the review author
    try {
      const Notification = require("../../models/shared/Notification.js");
      if (data.userId) {
        await Notification.create({
          userId: data.userId,
          userModel: "User",
          senderId: (req.user && (req.user._id || req.user.id)) || null,
          senderModel: "User",
          title: `Seller replied to your review on ${data.productName || ""}`,
          message: req.body.reply || "",
          type: "system",
          referenceId: data._id,
          redirectUrl: `/product/${data.productId}`,
        });
      }
    } catch (notifyErr) {
      console.warn(
        "Failed to create notification for review reply",
        notifyErr
      );
    }

    res.json({
      success: true,
      review: data,
    });
  } catch (error) {
    console.error("Error replying to review", error);
    res.status(500).json({ success: false, message: "Failed to post reply" });
  }
};

// EDIT REPLY
exports.editReply = async (req, res) => {
  try {
    const data = await Review.findOneAndUpdate(
      buildReviewOwnershipFilter(req, { _id: req.params.id }),
      {
        sellerReply: req.body.reply,
      },
      {
        new: true,
      }
    );

    if (!data) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    res.json({
      success: true,
      review: data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to edit reply" });
  }
};

// DELETE REPLY
exports.deleteReply = async (req, res) => {
  try {
    const data = await Review.findOneAndUpdate(
      buildReviewOwnershipFilter(req, { _id: req.params.id }),
      {
        sellerReply: "",
        repliedAt: null,
      },
      {
        new: true,
      }
    );

    if (!data) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    res.json({
      success: true,
      review: data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete reply" });
  }
};

// GET SINGLE REVIEW
exports.getReview = async (req, res) => {
  try {
    const data = await Review.findOne(
      buildReviewOwnershipFilter(req, { _id: req.params.id })
    ).populate("userId", "name fullName nameEn profileImage");

    if (!data)
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });

    const realUser = data.userId;
    const formattedData = data.toObject();
    formattedData.customerName =
      realUser?.name ||
      realUser?.fullName ||
      realUser?.nameEn ||
      (data.customerName && data.customerName !== "Anonymous"
        ? data.customerName
        : "Customer");

    res.json({ success: true, review: formattedData });
  } catch (error) {
    console.error("Error in controllers/ecommUser/reviewController.js:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to process review request" });
  }
};

// UPDATE REVIEW
exports.updateReview = async (req, res) => {
  try {
    const data = await Review.findOneAndUpdate(
      buildReviewOwnershipFilter(req, { _id: req.params.id }),
      req.body,
      {
        new: true,
      }
    );
    if (!data)
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    res.json({ success: true, review: data });
  } catch (error) {
    console.error("Error in controllers/ecommUser/reviewController.js:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to process review request" });
  }
};

// DELETE REVIEW
exports.deleteReview = async (req, res) => {
  try {
    const data = await Review.findOneAndDelete(
      buildReviewOwnershipFilter(req, { _id: req.params.id })
    );
    if (!data)
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    console.error("Error in controllers/ecommUser/reviewController.js:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to process review request" });
  }
};

// CHECK IF LOGGED-IN USER CAN REVIEW A PRODUCT
exports.canReviewProduct = async (req, res) => {
  try {
    const userId = req.user && (req.user._id || req.user.id);
    const productId = req.params.productId;

    if (!userId) {
      return res.status(401).json({ success: false, canReview: false, reason: "authentication_required" });
    }

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, canReview: false, reason: "invalid_product" });
    }

    const product = await Product.findById(productId).select("_id");
    if (!product) {
      return res.status(404).json({ success: false, canReview: false, reason: "product_not_found" });
    }

    const existingReview = await Review.findOne({ productId, userId }).select("_id");
    if (existingReview) {
      return res.json({ success: true, canReview: false, reason: "already_reviewed", reviewId: existingReview._id });
    }

    res.json({ success: true, canReview: true });
  } catch (err) {
    console.error("Error in canReviewProduct:", err);
    res.status(500).json({ success: false, canReview: false });
  }
};

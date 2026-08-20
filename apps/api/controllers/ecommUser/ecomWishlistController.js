const EcomWishlist = require("../../models/shared/EcomWishlist.js");
const mongoose = require("mongoose");

exports.getWishlist = async (req, res) => {
  try {
    const items = await EcomWishlist.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, wishlist: items });
  } catch (error) {
    console.error("Error in controllers/ecommUser/ecomWishlistController.js:", error);

    res.status(500).json({ success: false, message: "Failed to process wishlist request" });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const { entityId, entityType, title, image, price } = req.body;
    const existing = await EcomWishlist.findOne({ userId: req.user.id, entityId, entityType });
    if (existing) {
      return res.json({ success: true, message: "Already in wishlist", wishlist: existing });
    }
    const item = await EcomWishlist.create({ userId: req.user.id, entityId, entityType, title, image, price });
    res.status(201).json({ success: true, wishlist: item });
  } catch (error) {
    console.error("Error in controllers/ecommUser/ecomWishlistController.js:", error);

    res.status(500).json({ success: false, message: "Failed to process wishlist request" });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    await EcomWishlist.findOneAndDelete({ userId: req.user.id, entityId, entityType });
    res.json({ success: true, message: "Removed from wishlist" });
  } catch (error) {
    console.error("Error in controllers/ecommUser/ecomWishlistController.js:", error);

    res.status(500).json({ success: false, message: "Failed to process wishlist request" });
  }
};

exports.checkWishlist = async (req, res) => {
  try {
    const { entityId, entityType } = req.query;
    if (!mongoose.Types.ObjectId.isValid(entityId)) {
      return res.status(400).json({ success: false, message: "Invalid entity ID format" });
    }
    const item = await EcomWishlist.findOne({ userId: req.user.id, entityId, entityType });
    res.json({ success: true, isWishlisted: !!item });
  } catch (error) {
    console.error("Error in controllers/ecommUser/ecomWishlistController.js:", error);

    res.status(500).json({ success: false, message: "Failed to process wishlist request" });
  }
};

const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.js");
const { requireRole } = require("../../middlewares/role.js");
const wishlistController = require("../../controllers/ecommUser/ecomWishlistController.js");

router.get("/", auth, requireRole("buyer","admin","eventOwner","learner","jobSeeker"), wishlistController.getWishlist);
router.post("/add", auth, requireRole("buyer","admin","eventOwner","learner","jobSeeker"), wishlistController.addToWishlist);
router.delete("/remove/:entityType/:entityId", auth, requireRole("buyer","admin","eventOwner","learner","jobSeeker"), wishlistController.removeFromWishlist);
router.get("/check", auth, requireRole("buyer","admin","eventOwner","learner","jobSeeker"), wishlistController.checkWishlist);

module.exports = router;

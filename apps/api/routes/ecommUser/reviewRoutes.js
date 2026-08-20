const express = require("express");
const auth = require("../../middlewares/auth.js");
const requireEcommUser = require("../../middlewares/requireEcommUser.js");
const { requireRole } = require("../../middlewares/role.js");
const upload = require("../../middlewares/upload.js");
const controller = require("../../controllers/ecommUser/reviewController.js");

const router = express.Router();

// Public product reviews endpoint for product page
router.get("/product/:productId", controller.getReviewsByProduct);

router.use(auth, requireEcommUser);
// Check review eligibility
router.get("/can-review/:productId", controller.canReviewProduct);
router.post("/", upload.single("image"), controller.createReview);
router.get("/user", (req, _res, next) => { req.query.mine = "true"; next(); }, controller.getReviews);

// Seller / admin review management
router.get("/", requireRole("seller", "admin"), controller.getReviews);
router.get("/seller", requireRole("seller", "admin"), controller.getReviews);
router.get("/summary", requireRole("seller", "admin"), controller.reviewSummary);
router.get("/:id", controller.getReview);
router.patch("/:id", controller.updateReview);
router.delete("/:id", controller.deleteReview);

// Seller reply management
router.post("/:id/reply", requireRole("seller", "admin"), controller.replyReview);
router.patch("/:id/reply", requireRole("seller", "admin"), controller.editReply);
router.delete("/:id/reply", requireRole("seller", "admin"), controller.deleteReply);

module.exports = router;

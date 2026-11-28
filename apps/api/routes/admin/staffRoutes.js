const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.js");
const requireRole = require("../../middlewares/requireRole.js");
const { requirePermission } = require("../../middlewares/permissions.js");
const adminController = require("../../controllers/admin/adminController.js");

// Staff access is intentionally separate from the full admin router.
router.use(auth, requireRole("admin", "sub_admin", "moderator"));

router.get("/dashboard", requirePermission("dashboard.read"), adminController.getDashboardStats);
router.get("/users", requirePermission("users.read"), adminController.getUsers);
router.get("/moderation/reviews", requirePermission("moderation.reviews"), adminController.getReviewModerationQueue);

module.exports = router;

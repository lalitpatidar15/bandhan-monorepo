const express = require("express");
const auth = require("../../middlewares/auth.js");
const requireEcommUser = require("../../middlewares/requireEcommUser.js");
const controller = require("../../controllers/ecommUser/notificationController.js");

const router = express.Router();
router.use(auth, requireEcommUser);
const { requireRole } = require("../../middlewares/role.js");
// Allow sellers/admins to create notifications for users
router.post("/", requireRole("seller", "admin"), controller.createNotification);
// existing routes use the same controller instance below
router.get("/", controller.getNotifications);
router.get("/unread", (req, _res, next) => { req.query.unread = "true"; next(); }, controller.getNotifications);
router.patch("/read-all", controller.markAllAsRead);
router.patch("/:id/read", controller.markAsRead);
router.delete("/:id", controller.deleteNotification);
router.delete("/", controller.deleteAllNotifications);

module.exports = router;

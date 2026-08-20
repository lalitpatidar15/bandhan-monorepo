const Notification = require("../../models/shared/Notification.js");

const format = (item) => ({
  id: item._id,
  _id: item._id,
  userId: item.userId,
  title: item.title,
  message: item.message,
  type: item.type,
  read: item.isRead,
  isRead: item.isRead,
  relatedId: item.referenceId || null,
  referenceId: item.referenceId || null,
  referenceModel: item.referenceModel || null,
  redirectUrl: item.redirectUrl || "",
  createdAt: item.createdAt
});

exports.createNotification = async (req, res) => {
  try {
    const { userId, title, message, type = "system", referenceId = null, redirectUrl = "" } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({ success: false, message: "userId, title and message are required" });
    }

    const payload = {
      userId,
      userModel: "User",
      senderId: req.user && (req.user._id || req.user.id) || null,
      senderModel: "User",
      title,
      message,
      type,
      referenceId,
      redirectUrl,
    };

    const created = await Notification.create(payload);

    res.json({ success: true, notification: format(created) });
  } catch (error) {
    console.error("Error creating notification", error);
    res.status(500).json({ success: false, message: "Failed to create notification" });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    const filter = { userId: req.user.id };
    if (req.query.unread === "true") filter.isRead = false;
    const [notifications, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(offset).limit(limit),
      Notification.countDocuments({ userId: req.user.id, isRead: false })
    ]);
    res.json({ success: true, unreadCount, notifications: notifications.map(format) });
  } catch (error) {
    console.error("Error in controllers/ecommUser/notificationController.js:", error);

    res.status(500).json({ success: false, message: "Failed to process notification request" });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const item = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: "Notification not found" });
    res.json({ success: true, message: "Notification marked as read", notification: format(item) });
  } catch (error) {
    console.error("Error in controllers/ecommUser/notificationController.js:", error);

    res.status(500).json({ success: false, message: "Failed to process notification request" });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true });
    res.json({ success: true, message: "All notifications marked as read", modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error("Error in controllers/ecommUser/notificationController.js:", error);

    res.status(500).json({ success: false, message: "Failed to process notification request" });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const item = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!item) return res.status(404).json({ success: false, message: "Notification not found" });
    res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    console.error("Error in controllers/ecommUser/notificationController.js:", error);

    res.status(500).json({ success: false, message: "Failed to process notification request" });
  }
};

exports.deleteAllNotifications = async (req, res) => {
  try {
    const result = await Notification.deleteMany({ userId: req.user.id });
    res.json({ success: true, message: "Notifications deleted", deletedCount: result.deletedCount });
  } catch (error) {
    console.error("Error in controllers/ecommUser/notificationController.js:", error);

    res.status(500).json({ success: false, message: "Failed to process notification request" });
  }
};

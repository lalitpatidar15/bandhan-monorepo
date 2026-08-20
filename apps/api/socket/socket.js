
const jwt = require("jsonwebtoken");
const User = require("../models/shared/User.js");
const Conversation = require("../models/shared/Conversation.js");
const Message = require("../models/shared/Message.js");

const onlineUsers = new Map();

module.exports = (io) => {

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token || socket.handshake.query?.token;
            if (!token) {
                return next(new Error("Authentication required"));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            if (!user || user.status === "inactive") {
                return next(new Error("Invalid or deactivated user"));
            }

            socket.userId = decoded.id;
            socket.userRole = user.role;
            next();
        } catch (err) {
            console.error("Error in socket/socket.js:", err);
            next(new Error("Invalid authentication token"));
        }
    });

    io.on("connection", (socket) => {

        console.log("Socket Connected :", socket.id);

        // ==========================
        // USER JOIN
        // ==========================

        socket.on("join", () => {
            const userId = socket.userId;
            if (!userId) return;

            onlineUsers.set(userId, socket.id);
            socket.join(userId);

            socket.emit("userOnline", { userId });

            console.log(userId + " joined");
        });

        // ==========================
        // JOIN CHAT
        // ==========================

        socket.on("joinConversation", ({ conversationId }) => {
            if (!conversationId || typeof conversationId !== "string") return;

            socket.join(conversationId);

            console.log("Joined Conversation :", conversationId);
        });

        // ==========================
        // LEAVE CHAT
        // ==========================

        socket.on("leaveConversation", ({ conversationId }) => {

            socket.leave(conversationId);

        });

        // ==========================
        // TYPING
        // ==========================

        socket.on("typing", ({ conversationId, sender }) => {
            if (!conversationId || !sender) return;
            socket.to(conversationId).emit("typing", { sender });
        });

        // ==========================
        // STOP TYPING
        // ==========================

        socket.on("stopTyping", ({ conversationId }) => {
            if (!conversationId) return;
            socket.to(conversationId).emit("stopTyping");
        });

        // ==========================
        // MESSAGE DELIVERED
        // ==========================

        socket.on("messageDelivered", ({ conversationId, messageId }) => {
            if (!conversationId || !messageId) return;
            socket.to(conversationId).emit("messageDelivered", { messageId });
        });

        // ==========================
        // MESSAGE SEEN
        // ==========================

        socket.on("messageSeen", ({ conversationId, messageIds }) => {
            if (!conversationId || !messageIds) return;
            socket.to(conversationId).emit("messagesSeen", { conversationId, messageIds });
        });

        // ==========================
        // NEW NOTIFICATION
        // ==========================

        socket.on("newNotification", ({ notification }) => {
            if (!notification) return;
            io.to(socket.userId).emit("newNotification", notification);
        });

        // ==========================
        // NOTIFICATION COUNT
        // ==========================

        socket.on("notificationCount", ({ count }) => {
            io.to(socket.userId).emit("notificationCount", count);
        });

        // ==========================
        // NOTIFICATION READ
        // ==========================

        socket.on("notificationRead", ({ notificationId }) => {
            if (!notificationId) return;
            io.to(socket.userId).emit("notificationRead", { notificationId });
        });

        // ==========================
        // MARK ALL READ
        // ==========================

        socket.on("markAllNotificationsRead", () => {
            io.to(socket.userId).emit("markAllNotificationsRead");
        });

        // ==========================
        // NOTIFICATION DELETE
        // ==========================

        socket.on("notificationDeleted", ({ notificationId }) => {
            if (!notificationId) return;
            io.to(socket.userId).emit("notificationDeleted", notificationId);
        });

        // ==========================
        // USER DISCONNECT
        // ==========================

        socket.on("disconnect", () => {
            const userId = socket.userId;
            if (userId && onlineUsers.get(userId) === socket.id) {
                onlineUsers.delete(userId);
                io.emit("userOffline", { userId });
            }
            console.log("Socket Disconnected :", socket.id);
        });

    });

};

module.exports.onlineUsers = onlineUsers;
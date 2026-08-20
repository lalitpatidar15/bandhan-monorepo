const Notification = require("../models/shared/Notification.js");
const NotificationDevice = require("../models/shared/NotificationDevice.js");
const { sendPushNotification } = require("../utils/firebaseNotification.js");

exports.createNotification = async (data) => {

    try {
        if (!data || !data.userId || !data.userModel || !data.title || !data.message) {
            throw new Error("Invalid notification payload");
        }

        const notification = await Notification.create({

            userId: data.userId,

            userModel: data.userModel,

            senderId: data.senderId || null,

            senderModel: data.senderModel || null,

            title: data.title,

            message: data.message,

            type: data.type || "system",

            referenceId: data.referenceId || null,

            referenceModel: data.referenceModel || null,

            redirectUrl: data.redirectUrl || "",

            icon: data.icon || ""

        });

        const devices = await NotificationDevice.find({

            userId: data.userId,

            userModel: data.userModel,

            isActive: true

        });

        if (!Array.isArray(devices)) {
            return notification;
        }

        for (const device of devices) {

            try {

                await sendPushNotification({

                    token: device.fcmToken,

                    title: data.title,

                    body: data.message,

                    data: {

                        type: data.type || "system",

                        notificationId: notification._id.toString(),

                        referenceId: data.referenceId ? data.referenceId.toString() : "",

                        redirectUrl: data.redirectUrl || ""

                    }

                });

            }

            catch (error) {

                console.log("FCM Error :", error.message);

            }

        }

        return notification;

    }

    catch (error) {
        if (error?.name === "MongooseError" || error?.message?.includes("buffering timed out") || error?.message?.includes("connect ECONNREFUSED")) {
            console.warn("Notification skipped because MongoDB is not ready yet:", error.message);
            return null;
        }

        console.error("Error in services/notificationService.js:", error);
        throw error;
    }

};

exports.getUnreadCount = async (userId) => {

    try {

        return await Notification.countDocuments({

            userId,

            isRead: false

        });

    }

    catch (error) {

        
    console.error("Error in services/notificationService.js:", error);
throw error;

    }

};

exports.markAsRead = async (notificationId, userId) => {

    try {

        const notification = await Notification.findOneAndUpdate(

            {

                _id: notificationId,

                userId

            },

            {

                isRead: true

            },

            {

                new: true

            }

        );

        return notification;

    }

    catch (error) {

        
    console.error("Error in services/notificationService.js:", error);
throw error;

    }

};

exports.markAllAsRead = async (userId) => {

    try {

        await Notification.updateMany(

            {

                userId,

                isRead: false

            },

            {

                $set: {

                    isRead: true

                }

            }

        );

        return true;

    }

    catch (error) {

        
    console.error("Error in services/notificationService.js:", error);
throw error;

    }

};

exports.deleteNotification = async (notificationId, userId) => {

    try {

        await Notification.findOneAndDelete({

            _id: notificationId,

            userId

        });

        return true;

    }

    catch (error) {

        
    console.error("Error in services/notificationService.js:", error);
throw error;

    }

};

exports.clearAllNotifications = async (userId) => {

    try {

        await Notification.deleteMany({

            userId

        });

        return true;

    }

    catch (error) {

        
    console.error("Error in services/notificationService.js:", error);
throw error;

    }

};
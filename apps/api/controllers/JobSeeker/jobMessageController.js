const mongoose = require("mongoose");
const JobConversation = require("../../models/jobPoster/JobConversation.js");
const JobMessage = require("../../models/jobSeeker/JobMessage.js");
const JobSeeker = require("../../models/jobSeeker/JobSeeker.js");
const Job = require("../../models/jobPoster/Job.js");
const recruiters = require("../../models/jobPoster/Recruiter.js");
const Application = require("../../models/jobPoster/Application.js");
const Notification = require("../../models/shared/Notification.js");
const notificationService = require("../../services/notificationService.js");
const NotificationDevice = require("../../models/shared/NotificationDevice.js");
const SavedJob = require("../../models/jobSeeker/SavedJob.js");
const { onlineUsers } = require("../../socket/socket.js");
const bcrypt = require("bcryptjs");
const Payment = require("../../models/shared/Payment.js");

const jwt = require("jsonwebtoken");
const uploadHelpers = require("../../middlewares/upload.js");

// =========== message  ===============
exports.startConversation = async (req, res) => {

    try {

        const recruiterId = req.user.id;

        const { applicationId } = req.params;

        const application = await Application.findOne({

            _id: applicationId,

            recruiterId

        })

        .populate({

            path: "seekerId",

            select: `
                fullName
                email
                profilePhoto
                currentRole
                experienceLevel
            `

        })

        .populate({

            path: "jobId",

            select: `
                jobTitle
                location
            `

        });

        if (!application) {

            return res.status(404).json({

                success: false,

                message: "Application not found"

            });

        }

        if (
            application.status !== "Shortlisted" &&
            application.status !== "Offer" &&
            application.status !== "Hired"
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "You can only message candidates whose applications have been shortlisted or hired"
            });

        }

        let conversation = await JobConversation.findOne({

            recruiterId,

            seekerId: application.seekerId._id,

            applicationId

        });

        if (!conversation) {

            conversation = await JobConversation.create({

                recruiterId,

                seekerId: application.seekerId._id,

                applicationId

            });

        }

        return res.status(200).json({

            success: true,

            message: "Conversation Ready",

            data: {

                conversationId: conversation._id,

                applicationId: application._id,

                candidate: {

                    candidateId: application.seekerId._id,

                    fullName: application.seekerId.fullName,

                    email: application.seekerId.email,

                    currentRole: application.seekerId.currentRole,

                    experienceLevel:
                        application.seekerId.experienceLevel,

                    profilePhoto:
                        application.seekerId.profilePhoto,

                    isOnline: onlineUsers.has(

                        application.seekerId._id.toString()

                    )

                },

                job: {

                    jobId: application.jobId._id,

                    jobTitle: application.jobId.jobTitle,

                    location: application.jobId.location

                },

                unreadRecruiter:

                    conversation.unreadRecruiter,

                unreadSeeker:

                    conversation.unreadSeeker,

                lastMessage:

                    conversation.lastMessage,

                lastMessageAt:

                    conversation.lastMessageAt

            }

        });

    }

    catch (error) {

        

        console.error("Error in JobSeeker/jobMessageController.js:", error);
return res.status(500).json({

            success: false,

            message: "Server error"

        });

    }

};

exports.getConversations = async (req, res) => {

    try {

        let filter = {};

        if (req.user.role === "recruiter") {

            filter.recruiterId = req.user.id;

        }

        else {

            filter.seekerId = req.user.id;

        }

        const search = req.query.search || "";

        let conversations = await JobConversation.find(filter)

        .populate({

            path: "seekerId",

            select: `
                fullName
                profilePhoto
                currentRole
            `

        })

        .populate({

            path: "recruiterId",

            select: `
                companyName
                companyLogo
            `

        })

        .populate({

            path: "applicationId",

            populate: {

                path: "jobId",

                select: "jobTitle"

            }

        })

        .sort({

            lastMessageAt: -1,

            updatedAt: -1

        });

        if (search) {

            conversations = conversations.filter(item => {

                if (req.user.role === "recruiter") {

                    return item.seekerId?.fullName

                        ?.toLowerCase()

                        .includes(search.toLowerCase());

                }

                return item.recruiterId?.companyName

                    ?.toLowerCase()

                    .includes(search.toLowerCase());

            });

        }

        const data = conversations.map(item => ({

            conversationId: item._id,

            applicationId: item.applicationId?._id,

            jobTitle:

                item.applicationId?.jobId?.jobTitle ||

                "",

            recruiter: {

                recruiterId: item.recruiterId?._id,

                companyName:

                    item.recruiterId?.companyName ||

                    "",

                companyLogo:

                    item.recruiterId?.companyLogo ||

                    ""

            },

            candidate: {

                candidateId: item.seekerId?._id,

                fullName:

                    item.seekerId?.fullName ||

                    "",

                profilePhoto:

                    item.seekerId?.profilePhoto ||

                    "",

                currentRole:

                    item.seekerId?.currentRole ||

                    "",

                isOnline:

                    onlineUsers.has(

                        item.seekerId?._id.toString()

                    )

            },

            lastMessage:

                item.lastMessage,

            lastMessageType:

                item.lastMessageType,

            lastMessageBy:

                item.lastMessageBy,

            lastMessageAt:

                item.lastMessageAt,

            unreadCount:

                req.user.role === "recruiter"

                ? item.unreadRecruiter

                : item.unreadSeeker

        }));

        return res.status(200).json({

            success: true,

            totalConversations: data.length,

            data

        });

    }

    catch (error) {

        

        console.error("Error in JobSeeker/jobMessageController.js:", error);
return res.status(500).json({

            success: false,

            message: "Server error"

        });

    }

};

exports.getMessages = async (req, res) => {

    try {

        const { conversationId } = req.params;

        const conversation = await JobConversation.findById(conversationId);

        if (!conversation) {

            return res.status(404).json({
                success: false,
                message: "Conversation not found"
            });

        }

        const userId = req.user.id;

        const isRecruiter =
            conversation.recruiterId.toString() === userId;

        const isSeeker =
            conversation.seekerId.toString() === userId;

        if (!isRecruiter && !isSeeker) {

            return res.status(403).json({
                success: false,
                message: "Access denied"
            });

        }

        const messages = await JobMessage.find({

            conversationId,

            deletedForEveryone: false,

            deletedFor: {
                $ne: userId
            }

        })
        .sort({
            createdAt: 1
        });

        const data = messages.map(item => ({

            messageId: item._id,

            sender: item.sender,

            senderId: item.senderId,

            receiverId: item.receiverId,

            message: item.message,

            messageType: item.messageType,

            fileUrl: item.fileUrl,

            isRead: item.isRead,

            readAt: item.readAt,

            deliveredAt: item.deliveredAt,

            createdAt: item.createdAt,

            isMine:
                item.senderId.toString() === userId

        }));

        return res.status(200).json({

            success: true,

            conversationId,

            totalMessages: data.length,

            data

        });

    }

    catch (error) {

        

        console.error("Error in JobSeeker/jobMessageController.js:", error);
return res.status(500).json({

            success: false,

            message: "Server error"

        });

    }

};

exports.sendMessage = async (req, res) => {

    try {

        const { conversationId } = req.params;

        const {
            message,
            messageType,
            fileUrl
        } = req.body;

        if (!message && !fileUrl) {

            return res.status(400).json({
                success: false,
                message: "Message is required"
            });

        }

        const conversation = await JobConversation.findById(conversationId);

        if (!conversation) {

            return res.status(404).json({
                success: false,
                message: "Conversation not found"
            });

        }

        const app = await Application.findById(
            conversation.applicationId
        ).select("status");

        if (
            !app ||
            (app.status !== "Shortlisted" &&
             app.status !== "Offer" &&
             app.status !== "Hired")
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "Messaging is only allowed for shortlisted or hired applications"
            });

        }

        let sender;
        let receiverId;
        let receiverModel;

        if (req.user.role === "recruiter") {

            sender = "Recruiter";

            receiverId = conversation.seekerId;

            receiverModel = "JobSeeker";

            conversation.unreadSeeker += 1;

        }

        else {

            sender = "JobSeeker";

            receiverId = conversation.recruiterId;

            receiverModel = "Recruiter";

            conversation.unreadRecruiter += 1;

        }

        const newMessage = await JobMessage.create({

            conversationId,

            sender,

            senderId: req.user.id,

            receiverId,

            message: message || "",

            messageType: messageType || "text",

            fileUrl: fileUrl || "",

            deliveredAt: new Date()

        });

        conversation.lastMessage =
            messageType === "image"
                ? " Image"
                : messageType === "file"
                ? " File"
                : message;

        conversation.lastMessageType = messageType || "text";

        conversation.lastMessageBy = sender;

        conversation.lastMessageAt = new Date();

        await conversation.save();

        if (req.io) {
            req.io.to(conversationId).emit("receiveMessage", newMessage);

            if (receiverId) {
                req.io.to(receiverId.toString()).emit("conversationUpdated", {
                    conversationId,
                    lastMessage: conversation.lastMessage,
                    lastMessageType: conversation.lastMessageType,
                    lastMessageAt: conversation.lastMessageAt
                });
            }
        }

        // ==========================
        // Notification
        // ==========================

        await notificationService.createNotification({

    userId: receiverId,

    userModel: receiverModel,

    senderId: req.user.id,

    senderModel: sender,

    title: "New Message",

    message:
        sender === "Recruiter"
            ? "Recruiter sent you a message."
            : "Candidate sent you a message.",

    type: "message",

    referenceId: newMessage._id,

    referenceModel: "JobMessage",

    redirectUrl: `/messages/${conversationId}`,

    icon: "message"

});

        return res.status(201).json({

            success: true,

            message: "Message sent successfully",

            data: newMessage

        });

    }

    catch (error) {

        console.error("sendMessage error:", error);

        return res.status(500).json({

            success: false,

            message: error.message || "Server error"

        });

    }

};

exports.markAsRead = async (req, res) => {

    try {

        const { conversationId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            return res.status(400).json({ success: false, message: "Invalid conversation ID format" });
        }

        const conversation = await JobConversation.findById(
            conversationId
        );

        if (!conversation) {

            return res.status(404).json({

                success: false,
                message: "Conversation not found"

            });

        }

        let sender;
        let unreadField;

        if (req.user.role === "recruiter") {

            sender = "JobSeeker";
            unreadField = "unreadRecruiter";

        }

        else {

            sender = "Recruiter";
            unreadField = "unreadSeeker";

        }

        await JobMessage.updateMany(

            {

                conversationId,

                sender,

                receiverId: req.user.id,

                isRead: false

            },

            {

                $set: {

                    isRead: true,

                    readAt: new Date()

                }

            }

        );

        conversation[unreadField] = 0;

        await conversation.save();

        const updatedMessages = await JobMessage.find({

            conversationId,

            sender,

            receiverId: req.user.id,

            isRead: true

        })
        .select("_id");

        req.io.to(conversationId).emit(

            "messagesSeen",

            {

                conversationId,

                messageIds: updatedMessages.map(
                    item => item._id
                ),

                seenBy: req.user.id,

                seenAt: new Date()

            }

        );

        req.io.to(conversation.recruiterId.toString()).emit(

            "conversationUpdated",

            {

                conversationId,

                unreadRecruiter:
                    conversation.unreadRecruiter,

                unreadSeeker:
                    conversation.unreadSeeker

            }

        );

        req.io.to(conversation.seekerId.toString()).emit(

            "conversationUpdated",

            {

                conversationId,

                unreadRecruiter:
                    conversation.unreadRecruiter,

                unreadSeeker:
                    conversation.unreadSeeker

            }

        );

        return res.status(200).json({

            success: true,

            message: "Messages marked as read"

        });

    }

    catch (error) {

        

        console.error("Error in JobSeeker/jobMessageController.js:", error);
return res.status(500).json({

            success: false,

            message: "Server error"

        });

    }

};

// ============= notification ==============
// exports.getNotifications = async (req, res) => {

//     try {

//         const userId = req.user.id;

//         const page = parseInt(req.query.page) || 1;

//         const limit = parseInt(req.query.limit) || 10;

//         const skip = (page - 1) * limit;

//         const search = req.query.search || "";

//         const type = req.query.type || "all";

//         const query = {

//             userId

//         };

//         if (type !== "all") {

//             query.type = type;

//         }

//         if (search) {

//             query.$or = [

//                 {

//                     title: {

//                         $regex: search,

//                         $options: "i"

//                     }

//                 },

//                 {

//                     message: {

//                         $regex: search,

//                         $options: "i"

//                     }

//                 }

//             ];

//         }

//         const notifications = await Notification.find(query)

//             .sort({

//                 createdAt: -1

//             })

//             .skip(skip)

//             .limit(limit);

//         const total = await Notification.countDocuments(query);

//         return res.status(200).json({

//             success: true,

//             message: "Notifications fetched successfully",

//             pagination: {

//                 total,

//                 page,

//                 limit,

//                 totalPages: Math.ceil(total / limit)

//             },

//             data: notifications

//         });

//     }

//     catch (error) {

//         

// console.error("Error in JobSeeker/jobMessageController.js:", error);
// return res.status(500).json({

//             success: false,

//             message: "Server error"

//         });

//     }

// };

// exports.getUnreadCount = async (req, res) => {

//     try {

//         const count = await notificationService.getUnreadCount(

//             req.user.id

//         );

//         return res.status(200).json({

//             success: true,

//             unreadCount: count

//         });

//     }

//     catch (error) {

//         

// console.error("Error in JobSeeker/jobMessageController.js:", error);
// return res.status(500).json({

//             success: false,

//             message: "Server error"

//         });

//     }

// };

// exports.markNotificationsAsRead = async (req, res) => {

//     try {

//         const notification = await notificationService.markAsRead(

//             req.io,

//             req.params.id,

//             req.user.id

//         );

//         if (!notification) {

//             return res.status(404).json({

//                 success: false,

//                 message: "Notification not found"

//             });

//         }

//         return res.status(200).json({

//             success: true,

//             message: "Notification marked as read",

//             data: notification

//         });

//     }

//     catch (error) {

//         

// console.error("Error in JobSeeker/jobMessageController.js:", error);
// return res.status(500).json({

//             success: false,

//             message: "Server error"

//         });

//     }

// };

// exports.markAllRead = async (req, res) => {

//     try {

//         await notificationService.markAllAsRead(

//             req.io,

//             req.user.id

//         );

//         return res.status(200).json({

//             success: true,

//             message: "All notifications marked as read"

//         });

//     }

//     catch (error) {

//         

// console.error("Error in JobSeeker/jobMessageController.js:", error);
// return res.status(500).json({

//             success: false,

//             message: "Server error"

//         });

//     }

// };

// exports.deleteNotification = async (req, res) => {

//     try {

//         await notificationService.deleteNotification(

//             req.io,

//             req.params.id,

//             req.user.id

//         );

//         return res.status(200).json({

//             success: true,

//             message: "Notification deleted successfully"

//         });

//     }

//     catch (error) {

//         

// console.error("Error in JobSeeker/jobMessageController.js:", error);
// return res.status(500).json({

//             success: false,

//             message: "Server error"

//         });

//     }

// };

exports.getNotifications = async (req, res) => {

    try {

        const userId = req.user.id;

        const page = parseInt(req.query.page) || 1;

        const limit = parseInt(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const search = req.query.search || "";

        const type = req.query.type || "all";

        const query = {

            userId

        };

        if (type !== "all") {

            query.type = type;

        }

        if (search) {

            query.$or = [

                {

                    title: {

                        $regex: search,

                        $options: "i"

                    }

                },

                {

                    message: {

                        $regex: search,

                        $options: "i"

                    }

                }

            ];

        }

        const notifications = await Notification.find(query)

            .sort({

                createdAt: -1

            })

            .skip(skip)

            .limit(limit);

        const total = await Notification.countDocuments(query);

        return res.status(200).json({

            success: true,

            message: "Notifications fetched successfully",

            pagination: {

                total,

                page,

                limit,

                totalPages: Math.ceil(total / limit)

            },

            data: notifications

        });

    }

    catch (error) {

        console.error("getNotifications error:", error);

        return res.status(500).json({

            success: false,

            message: error.message || "Server error"

        });

    }

};

exports.getUnreadCount = async (req, res) => {

    try {

        const count = await notificationService.getUnreadCount(

            req.user.id

        );

        return res.status(200).json({

            success: true,

            unreadCount: count

        });

    }

    catch (error) {

        console.error("getUnreadCount error:", error);

        return res.status(500).json({

            success: false,

            message: error.message || "Server error"

        });

    }

};

exports.markNotificationsAsRead = async (req, res) => {

    try {

        const notification = await notificationService.markAsRead(

            req.params.id,

            req.user.id

        );

        if (!notification) {

            return res.status(404).json({

                success: false,

                message: "Notification not found"

            });

        }

        return res.status(200).json({

            success: true,

            message: "Notification marked as read",

            data: notification

        });

    }

    catch (error) {

        

        console.error("Error in JobSeeker/jobMessageController.js:", error);
return res.status(500).json({

            success: false,

            message: "Server error"

        });

    }

};

exports.markAllRead = async (req, res) => {

    try {

        await notificationService.markAllAsRead(

            req.user.id

        );

        return res.status(200).json({

            success: true,

            message: "All notifications marked as read"

        });

    }

    catch (error) {

        

        console.error("Error in JobSeeker/jobMessageController.js:", error);
return res.status(500).json({

            success: false,

            message: "Server error"

        });

    }

};

exports.deleteNotification = async (req, res) => {

    try {

        await notificationService.deleteNotification(

            req.params.id,

            req.user.id

        );

        return res.status(200).json({

            success: true,

            message: "Notification deleted successfully"

        });

    }

    catch (error) {

        

        console.error("Error in JobSeeker/jobMessageController.js:", error);
return res.status(500).json({

            success: false,

            message: "Server error"

        });

    }

};

exports.clearAllNotifications = async (req, res) => {

    try {

        await notificationService.clearAllNotifications(

            req.user.id

        );

        return res.status(200).json({

            success: true,

            message: "All notifications cleared successfully"

        });

    }

    catch (error) {

        

        console.error("Error in JobSeeker/jobMessageController.js:", error);
return res.status(500).json({

            success: false,

            message: "Server error"

        });

    }

};

exports.saveFcmToken = async (req, res) => {

    try {

        const {

            userId,

            userModel,

            fcmToken,

            platform

        } = req.body;

        if (

            !userId ||

            !userModel ||

            !fcmToken

        ) {

            return res.status(400).json({

                success: false,

                message: "All fields are required"

            });

        }

        const device = await NotificationDevice.findOne({

            userId,

            fcmToken

        });

        if (device) {

            device.platform = platform || "android";

            device.isActive = true;

            await device.save();

        }

        else {

            await NotificationDevice.create({

                userId,

                userModel,

                fcmToken,

                platform: platform || "android"

            });

        }

        return res.status(200).json({

            success: true,

            message: "FCM Token Saved Successfully"

        });

    }

    catch (error) {

        

        console.error("Error in JobSeeker/jobMessageController.js:", error);
return res.status(500).json({

            success: false,

            message: "Server error"

        });

    }

};

// ==========dashboard ==========
exports.getJobSeekerDashboard = async (req, res) => {

    try {

        const seekerId = req.user.id;

        const seeker = await JobSeeker.findById(seekerId).lean();

        if (!seeker) {

            return res.status(404).json({

                success: false,
                message: "Job Seeker not found"

            });

        }

        // ================= SUMMARY =================

        const [

            totalApplications,
            totalSavedJobs,
            totalNotifications,
            totalMessages

        ] = await Promise.all([

            Application.countDocuments({
             seekerId,
             isDraft: false
            }),

            SavedJob.countDocuments({

                seekerId

            }),

            Notification.countDocuments({

                userId: seekerId,
                isRead: false

            }),

            JobConversation.countDocuments({

                seekerId

            })

        ]);

        // ================= RECENT APPLICATIONS =================

        const recentApplications = await Application.find({

            seekerId,
            isDraft: false

        })

        .populate({

            path: "jobId",

            select: `
                jobTitle
                location
                jobType
                salaryMin
                salaryMax
                salaryCurrency
                remoteAvailable
                applicationDeadline
            `

        })

        .populate({

            path: "recruiterId",

            select: `
                companyName
                companyLogo
            `

        })

        .sort({

            createdAt: -1

        })

        .limit(5)

        .lean();

        // ================= SAVED JOB IDS =================

        const savedJobs = await SavedJob.find({

            seekerId

        }).select("jobId");

        const savedIds = savedJobs.map(item => item.jobId.toString());
                // ================= RECOMMENDED JOBS =================

        let recommendedJobs = await Job.find({

            status: "active",
            isPublished: true,

            $or: [

                {
                    skills: {
                        $in: seeker.skills || []
                    }
                },

                {
                    experienceLevel: seeker.experienceLevel
                },

                {
                    location: seeker.location
                }

            ]

        })

        .populate({

            path: "recruiterId",

            select: `
                companyName
                companyLogo
            `

        })

        .sort({

            createdAt: -1

        })

        .lean();

        // Agar matching jobs 5 se kam hain to latest jobs bhi dikhao

        if (recommendedJobs.length < 5) {

            const existingIds = recommendedJobs.map(job => job._id);

            const latestJobs = await Job.find({

                status: "active",

                isPublished: true,

                _id: {

                    $nin: existingIds

                }

            })

            .populate({

                path: "recruiterId",

                select: `
                    companyName
                    companyLogo
                `

            })

            .sort({

                createdAt: -1

            })

            .limit(5 - recommendedJobs.length)

            .lean();

            recommendedJobs = [

                ...recommendedJobs,
                ...latestJobs

            ];

        }

        // Duplicate Remove

        recommendedJobs = recommendedJobs.filter(

            (job, index, self) =>

                index === self.findIndex(

                    item =>

                        item._id.toString() === job._id.toString()

                )

        );

        // Maximum 5 Jobs

        // recommendedJobs = recommendedJobs.slice(0, 5);

        // ================= PROFILE COMPLETION =================

        let profileFields = [

            seeker.fullName,
            seeker.email,
            seeker.phone,
            seeker.location,
            seeker.currentRole,
            seeker.experienceLevel,
            seeker.resume,
            seeker.profilePhoto,
            seeker.degree,
            seeker.college,
            seeker.salaryExpectation

        ];

        let completedFields = profileFields.filter(field =>

            field !== undefined &&
            field !== null &&
            field !== ""

        ).length;

        let overallCompletion = Math.round(

            (completedFields / profileFields.length) * 100

        );
                return res.status(200).json({

            success: true,

            data: {

                // ================= WELCOME =================

                welcome: {

                    fullName: seeker.fullName,

                    profilePhoto: seeker.profilePhoto,

                    resume: seeker.resume

                },

                // ================= SUMMARY =================

                summary: {

                    applications: totalApplications,

                    messages: totalMessages,

                    notifications: totalNotifications,

                    savedJobs: totalSavedJobs

                },

                // ================= RECENT APPLICATIONS =================

                recentApplications: recentApplications.map(item => ({

                    applicationId: item._id,

                    jobId: item.jobId?._id,

                    jobTitle: item.jobId?.jobTitle || "",

                    companyName: item.recruiterId?.companyName || "",

                    companyLogo: item.recruiterId?.companyLogo || "",

                    location: item.jobId?.location || "",

                    jobType: item.jobId?.jobType || "",

                    salaryMin: item.jobId?.salaryMin || 0,

                    salaryMax: item.jobId?.salaryMax || 0,

                    salaryCurrency: item.jobId?.salaryCurrency || "INR",

                    remoteAvailable: item.jobId?.remoteAvailable || false,

                    applicationDeadline: item.jobId?.applicationDeadline,

                    status: item.status,

                    appliedAt: item.createdAt

                })),

                // ================= RECOMMENDED JOBS =================

                recommendedJobs: recommendedJobs.map(job => ({

                    jobId: job._id,

                    jobTitle: job.jobTitle,

                    companyName: job.recruiterId?.companyName || "",

                    companyLogo: job.recruiterId?.companyLogo || "",

                    location: job.location,

                    salaryMin: job.salaryMin,

                    salaryMax: job.salaryMax,

                    salaryCurrency: job.salaryCurrency,

                    experienceLevel: job.experienceLevel,

                    jobType: job.jobType,

                    remoteAvailable: job.remoteAvailable,

                    applicationDeadline: job.applicationDeadline,

                    openings: job.openings,

                    views: job.views,

                    totalApplicants: job.totalApplicants,

                    skills: job.skills,

                    createdAt: job.createdAt,

                    isSaved: savedIds.includes(job._id.toString())

                })),

                // ================= PROFILE COMPLETION =================

                profileCompletion: {

                    overall: overallCompletion,

                    resume: seeker.resume ? 100 : 0,

                    skills:
                        seeker.skills &&
                        seeker.skills.length > 0
                            ? 100
                            : 0,

                    experience:
                        seeker.currentRole
                            ? 100
                            : 0

                },

                // ================= QUICK ACTIONS =================

                quickActions: {

                    searchJobs: "/jobs",

                    uploadResume: "/profile",

                    editProfile: "/profile",

                    messages: "/messages"

                }

            }

        });

    }

    catch (error) {

        

        console.error("Error in JobSeeker/jobMessageController.js:", error);
return res.status(500).json({

            success: false,

            message: "Server error"

        });

    }

};

// ========== application tracking ==========
exports.getApplications = async (req, res) => {

    try {

        const seekerId = req.user.id;

        let {
            page = 1,
            limit = 10,
            search = "",
            status = "All",
            sort = "recent"
        } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);

        const filter = {
            seekerId
        };

        if (status !== "All") {

            const statusMap = {
                Applied: "Submitted",
                Review: "Reviewed",
                Interview: "Shortlisted",
                Rejected: "Rejected",
                Offer: "Offer",
                Hired: "Hired",
                Draft: "Draft"
            };

            if (statusMap[status]) {
                filter.status = statusMap[status];
            }

        }

        let applications = await Application.find(filter)

            .populate({
                path: "jobId",
                select: `
                    jobTitle
                    location
                    status
                    createdAt
                `
            })

            .populate({
                path: "recruiterId",
                select: `
                    companyName
                    companyLogo
                `
            })

            .sort({
                createdAt: sort === "oldest" ? 1 : -1
            });

        if (search) {

            const keyword = search.toLowerCase();

            applications = applications.filter(item => {

                const jobTitle =
                    item.jobId?.jobTitle?.toLowerCase() || "";

                const company =
                    item.recruiterId?.companyName?.toLowerCase() || "";

                return (
                    jobTitle.includes(keyword) ||
                    company.includes(keyword)
                );

            });

        }

        const totalRecords = applications.length;

        const totalPages = Math.ceil(
            totalRecords / limit
        );

        const startIndex = (page - 1) * limit;

        const endIndex = startIndex + limit;

        const paginatedApplications =
            applications.slice(startIndex, endIndex);

        const summary = {

            totalApplications: applications.length,

            applied:
                applications.filter(
                    item => item.status === "Submitted"
                ).length,

            reviewed:
                applications.filter(
                    item => item.status === "Reviewed"
                ).length,

            interview:
                applications.filter(
                    item => item.status === "Shortlisted"
                ).length,

            rejected:
                applications.filter(
                    item => item.status === "Rejected"
                ).length

        };

        const applicationList = paginatedApplications.map(item => {

            const timeline = {

                applied: false,

                reviewed: false,

                interview: false,

                offer: false

            };

            switch (item.status) {

                case "Submitted":

                    timeline.applied = true;

                    break;

                case "Reviewed":

                    timeline.applied = true;
                    timeline.reviewed = true;

                    break;

                case "Shortlisted":

                    timeline.applied = true;
                    timeline.reviewed = true;
                    timeline.interview = true;

                    break;

                case "Offer":

                    timeline.applied = true;
                    timeline.reviewed = true;
                    timeline.interview = true;
                    timeline.offer = true;

                    break;

                case "Hired":

                    timeline.applied = true;
                    timeline.reviewed = true;
                    timeline.interview = true;
                    timeline.offer = true;

                    break;

                case "Rejected":

                    timeline.applied = true;

                    break;

            }

            return {

                applicationId: item._id,

                jobId: item.jobId?._id,

                recruiterId: item.recruiterId?._id,

                jobTitle: item.jobId?.jobTitle || "",

                companyName:
                    item.recruiterId?.companyName || "",

                companyLogo:
                    item.recruiterId?.companyLogo || "",

                location:
                    item.jobId?.location || "",

                status: item.status,

                appliedDate: item.submittedAt,

                lastUpdated: item.updatedAt,

                timeline

            };

        });

        return res.status(200).json({

            success: true,

            summary,

            pagination: {

                currentPage: page,

                totalPages,

                totalRecords,

                limit

            },

            applications: applicationList

        });

    }

    catch (error) {

        

        console.error("Error in JobSeeker/jobMessageController.js:", error);
return res.status(500).json({

            success: false,

            message: "Server error"

        });

    }

};

// ================ payment dashboard ===============
exports.getPaymentDashboard = async (req, res) => {

    try {

        const recruiterId = req.user.id;

        // ================= Total Spent =================

        const totalSpentData = await Payment.aggregate([

            {
                $match: {
                    recruiterId: new mongoose.Types.ObjectId(recruiterId),
                    status: "completed"
                }
            },

            {
                $group: {
                    _id: null,
                    totalSpent: {
                        $sum: "$totalAmount"
                    }
                }
            }

        ]);

        const totalSpent =
            totalSpentData.length > 0
                ? totalSpentData[0].totalSpent
                : 0;

        // ================= Current Plan =================

        const currentPlan = await Payment.findOne({

            recruiterId,

            paymentFor: "plan",

            status: "completed"

        })

        .sort({
            createdAt: -1
        });

        let activePlan = "Free";

        let nextBillingDate = null;

        let currentPlanData = {

            planName: "Free",

            price: 0,

            duration: 30,

            remainingDays: 0,

            features: [

                "Basic Listing",

                "Limited Visibility"

            ]

        };

        if (currentPlan) {

            activePlan = currentPlan.planName;

            nextBillingDate = currentPlan.planExpiry;

            let remainingDays = 0;

            if (currentPlan.planExpiry) {

                remainingDays = Math.max(

                    Math.ceil(

                        (
                            new Date(currentPlan.planExpiry) -
                            new Date()
                        ) /
                        (1000 * 60 * 60 * 24)

                    ),

                    0

                );

            }

            let features = [];

            if (currentPlan.planName === "Featured") {

                features = [

                    "Top Placement",

                    "Highlighted Job",

                    "Priority Support"

                ];

            }

            if (currentPlan.planName === "Premium") {

                features = [

                    "Unlimited Jobs",

                    "Featured Jobs",

                    "Priority Support",

                    "Analytics"

                ];

            }

            currentPlanData = {

                planName: currentPlan.planName,

                price: currentPlan.totalAmount,

                duration: currentPlan.planDuration,

                remainingDays,

                features

            };

        }

        // ================= Payment Method =================

        const lastPayment = await Payment.findOne({

            recruiterId,

            status: "completed"

        })

        .sort({

            paidAt: -1

        });

        const paymentMethod = lastPayment

            ? {

                method: lastPayment.paymentMethod,

                cardType: lastPayment.cardType,

                cardLast4: lastPayment.cardLast4,

                wallet: lastPayment.wallet,

                vpa: lastPayment.vpa,

                lastUsed: lastPayment.paidAt

            }

            : null;

        // ================= Recent Transactions =================

        const recentTransactions = await Payment.find({

            recruiterId

        })

        .sort({

            createdAt: -1

        })

        .limit(5)

        .select(

            `
            paymentFor
            planName
            totalAmount
            status
            paymentMethod
            receipt
            paidAt
            createdAt
            `
        );

        return res.status(200).json({

            success: true,

            data: {

                overview: {

                    totalSpent,

                    activePlan,

                    nextBillingDate

                },

                currentPlan: currentPlanData,

                paymentMethod,

                recentTransactions

            }

        });

    }

    catch (error) {

        

        console.error("Error in JobSeeker/jobMessageController.js:", error);
return res.status(500).json({

            success: false,

            message: "Server error"

        });

    }

};

exports.getPaymentHistory = async (req, res) => {

    try {

        const recruiterId = req.user.id;

        const page = Number(req.query.page) || 1;

        const limit = Number(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const {

            status,

            paymentFor,

            search,

            startDate,

            endDate

        } = req.query;

        const filter = {

            recruiterId

        };

        if (status) {

            filter.status = status;

        }

        if (paymentFor) {

            filter.paymentFor = paymentFor;

        }

        if (startDate || endDate) {

            filter.createdAt = {};

            if (startDate) {

                filter.createdAt.$gte = new Date(startDate);

            }

            if (endDate) {

                filter.createdAt.$lte = new Date(endDate);

            }

        }

        if (search) {

            filter.$or = [

                {

                    planName: {

                        $regex: search,

                        $options: "i"

                    }

                },

                {

                    paymentFor: {

                        $regex: search,

                        $options: "i"

                    }

                },

                {

                    transactionId: {

                        $regex: search,

                        $options: "i"

                    }

                }

            ];

        }

        const totalPayments = await Payment.countDocuments(filter);

        const payments = await Payment.find(filter)

        .populate(

            "jobId",

            "jobTitle"

        )

        .sort({

            createdAt: -1

        })

        .skip(skip)

        .limit(limit);

        const history = payments.map(payment => ({

            paymentId: payment._id,

            date: payment.paidAt || payment.createdAt,

            description:

                payment.paymentFor === "plan"

                ?

                `${payment.planName} Plan`

                :

                payment.paymentFor === "featured_job"

                ?

                "Featured Job Upgrade"

                :

                payment.paymentFor,

            amount: payment.totalAmount,

            currency: payment.currency,

            status: payment.status,

            paymentMethod: payment.paymentMethod,

            receipt: payment.receipt,

            transactionId: payment.transactionId,

            job: payment.jobId

        }));

        return res.status(200).json({

            success: true,

            totalPayments,

            currentPage: page,

            totalPages: Math.ceil(

                totalPayments / limit

            ),

            data: history

        });

    }

    catch (error) {

        

        console.error("Error in JobSeeker/jobMessageController.js:", error);
return res.status(500).json({

            success: false,

            message: "Server error"

        });

    }

};

exports.getPaymentDetails = async (req, res) => {

    try {

        const recruiterId = req.user.id;

        const { paymentId } = req.params;

        const payment = await Payment.findOne({

            _id: paymentId,

            recruiterId

        })

        .populate(

            "jobId",

            "jobTitle location status"

        )

        .populate(

            "recruiterId",

            "companyName companyEmail"

        );

        if (!payment) {

            return res.status(404).json({

                success: false,

                message: "Payment not found."

            });

        }

        let remainingDays = 0;

        if (payment.planExpiry) {

            remainingDays = Math.max(

                Math.ceil(

                    (

                        new Date(payment.planExpiry) -

                        new Date()

                    ) /

                    (1000 * 60 * 60 * 24)

                ),

                0

            );

        }

        return res.status(200).json({

            success: true,

            data: {

                paymentId: payment._id,

                recruiter: {

                    companyName: payment.recruiterId?.companyName || "",

                    companyEmail: payment.recruiterId?.companyEmail || ""

                },

                paymentFor: payment.paymentFor,

                planName: payment.planName,

                planDuration: payment.planDuration,

                planExpiry: payment.planExpiry,

                remainingDays,

                subtotal: payment.subtotal,

                platformFee: payment.platformFee,

                gst: payment.gst,

                totalAmount: payment.totalAmount,

                currency: payment.currency,

                paymentMethod: payment.paymentMethod,

                paymentGateway: payment.paymentGateway,

                transactionId: payment.transactionId,

                orderId: payment.orderId,

                receipt: payment.receipt,

                status: payment.status,

                paidAt: payment.paidAt,

                billing: {

                    billingName: payment.billingName,

                    billingCompany: payment.billingCompany,

                    billingAddress: payment.billingAddress,

                    gstNumber: payment.gstNumber

                },

                job: payment.jobId

                ? {

                    id: payment.jobId._id,

                    title: payment.jobId.jobTitle,

                    location: payment.jobId.location,

                    status: payment.jobId.status

                }

                : null,

                createdAt: payment.createdAt,

                updatedAt: payment.updatedAt

            }

        });

    }

    catch (error) {

        

        console.error("Error in JobSeeker/jobMessageController.js:", error);
return res.status(500).json({

            success: false,

            message: "Server error"

        });

    }

};





const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    userModel: {
        type: String,
        enum: [
            "Recruiter",
            "JobSeeker",
            "Student",
            "Instructor",
            "User"
        ],
        required: true
    },

    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },

    senderModel: {
        type: String,
        enum: [
            "Recruiter",
            "JobSeeker",
            "Student",
            "Instructor",
            "User"
        ],
        default: null
    },

    title: {
        type: String,
        required: true,
        trim: true
    },

    message: {
        type: String,
        required: true,
        trim: true
    },

    type: {
        type: String,
        enum: [
            "application",
            "message",
            "job",
            "system",
            "interview",
            "payment"
        ],
        default: "system"
    },

    referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },

    referenceModel: {
        type: String,
        default: null
    },

    redirectUrl: {
        type: String,
        default: ""
    },

    icon: {
        type: String,
        default: ""
    },

    isRead: {
        type: Boolean,
        default: false
    }

},
{
    timestamps: true
});

notificationSchema.index({
    userId: 1,
    createdAt: -1
});

module.exports = mongoose.model(
    "Notification",
    notificationSchema
);
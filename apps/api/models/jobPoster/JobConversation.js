

const mongoose = require("mongoose");

const jobConversationSchema = new mongoose.Schema({

    recruiterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recruiter",
        required: true
    },

    seekerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "JobSeeker",
        required: true
    },

    applicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Application",
        required: true
    },

    lastMessage: {
        type: String,
        default: ""
    },

    lastMessageType: {
        type: String,
        enum: [
            "text",
            "image",
            "file"
        ],
        default: "text"
    },

    lastMessageBy: {
        type: String,
        enum: [
            "Recruiter",
            "JobSeeker"
        ],
        default: "Recruiter"
    },

    lastMessageAt: {
        type: Date,
        default: null
    },

    unreadRecruiter: {
        type: Number,
        default: 0
    },

    unreadSeeker: {
        type: Number,
        default: 0
    },

    isBlocked: {
        type: Boolean,
        default: false
    }

},
{
    timestamps: true
});

jobConversationSchema.index({

    recruiterId: 1,
    seekerId: 1,
    applicationId: 1

},
{
    unique: true
});

module.exports = mongoose.model(
    "JobConversation",
    jobConversationSchema
);
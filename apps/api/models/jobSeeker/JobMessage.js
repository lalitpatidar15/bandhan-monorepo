

const mongoose = require("mongoose");

const jobMessageSchema = new mongoose.Schema({

    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "JobConversation",
        required: true
    },

    sender: {
        type: String,
        enum: [
            "Recruiter",
            "JobSeeker"
        ],
        required: true
    },

    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    message: {
        type: String,
        default: ""
    },

    messageType: {
        type: String,
        enum: [
            "text",
            "image",
            "file"
        ],
        default: "text"
    },

    fileUrl: {
        type: String,
        default: ""
    },

    isRead: {
        type: Boolean,
        default: false
    },

    readAt: {
        type: Date,
        default: null
    },

    deliveredAt: {
        type: Date,
        default: null
    },

    deletedForEveryone: {
        type: Boolean,
        default: false
    },

    deletedFor: [{
        type: mongoose.Schema.Types.ObjectId
    }]

},
{
    timestamps: true
});

jobMessageSchema.index({
    conversationId: 1,
    createdAt: 1
});

module.exports = mongoose.model(
    "JobMessage",
    jobMessageSchema
);
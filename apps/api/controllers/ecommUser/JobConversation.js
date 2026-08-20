const mongoose = require("mongoose");

const jobConversationSchema = new mongoose.Schema({
    applicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Application",
        required: true,
        unique: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: true,
    },
    recruiterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recruiter",
        required: true,
    },
    seekerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "JobSeeker",
        required: true,
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "JobMessage",
    },
    recruiterUnreadCount: { type: Number, default: 0 },
    seekerUnreadCount: { type: Number, default: 0 },
}, { timestamps: true });

jobConversationSchema.index({ recruiterId: 1, updatedAt: -1 });
jobConversationSchema.index({ seekerId: 1, updatedAt: -1 });

module.exports = mongoose.model("JobConversation", jobConversationSchema);

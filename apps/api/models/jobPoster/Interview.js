const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema({

    applicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Application",
        required: true
    },

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

    interviewDate: {
        type: Date,
        required: true
    },

    meetingLink: {
        type: String,
        default: ""
    },

    interviewer: {
        type: String,
        default: ""
    },

    notes: {
        type: String,
        default: ""
    },

    status: {
        type: String,
        enum: [
            "Scheduled",
            "Completed",
            "Cancelled"
        ],
        default: "Scheduled"
    }

}, {
    timestamps: true
});

module.exports =
mongoose.model(
    "Interview",
    interviewSchema
);
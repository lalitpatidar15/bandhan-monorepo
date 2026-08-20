const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({

    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
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

    coverLetter: {
        type: String,
        default: ""
    },

    expectedSalary: {
        type: Number,
        default: 0
    },

    salaryType: {
        type: String,
        enum: ["Fixed", "Negotiable"],
        default: "Fixed"
    },

    resume: {
        type: String,
        default: ""
    },

    additionalAnswer: {
        type: String,
        default: ""
    },

    status: {
        type: String,
        enum: [
            "Draft",
            "Submitted",
            "Reviewed",
            "Offer",
            "Shortlisted",
            "Rejected",
            "Hired"
        ],
        default: "Draft"
    },

    isDraft: {
        type: Boolean,
        default: true
    },
    internalNote: {
    type: String,
    default: ""
    },

    submittedAt: {
        type: Date,
        default: null
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Application", applicationSchema);
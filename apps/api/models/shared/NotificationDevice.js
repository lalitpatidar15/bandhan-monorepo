const mongoose = require("mongoose");

const notificationDeviceSchema = new mongoose.Schema({

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

    fcmToken: {

        type: String,

        required: true

    },

    platform: {

        type: String,

        enum: [

            "android",

            "ios",

            "web"

        ],

        default: "android"

    },

    isActive: {

        type: Boolean,

        default: true

    }

}, {

    timestamps: true

});

notificationDeviceSchema.index(

    {

        userId: 1,

        fcmToken: 1

    },

    {

        unique: true

    }

);

module.exports = mongoose.model(

    "NotificationDevice",

    notificationDeviceSchema

);
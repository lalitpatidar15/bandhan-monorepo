const mongoose = require("mongoose");

const enrollmentTrendSchema =
new mongoose.Schema({
    day:String,
    students:Number
});

const engagementSchema =
new mongoose.Schema({
    videoMinutes:Number,
    assignmentMinutes:Number,
    averageWatchTime:Number
});

const recentActivitySchema =
new mongoose.Schema({
    type:String,
    message:String,
    time:String
});

const studentSnapshotSchema =
new mongoose.Schema({
    studentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Student"
    },

    name:String,

    profileImage:String,

    progress:Number,

    status:{
        type:String,
        enum:[
            "active",
            "stalled",
            "completed"
        ]
    }
});

const coursePerformanceSchema =
new mongoose.Schema({

    courseId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course"
    },

    totalStudents:Number,

    totalStudentsChange:{
        type:String,
        default:"0%"
    },

    completionRate:Number,

    completionRateChange:{
        type:String,
        default:"0%"
    },

    totalRevenue:Number,

    totalRevenueChange:{
        type:String,
        default:"0%"
    },

    averageRating:Number,

    averageRatingChange:{
        type:String,
        default:"Stable"
    },

    enrollmentTrends:[
        enrollmentTrendSchema
    ],

    engagement:
    engagementSchema,

    recentActivities:[
        recentActivitySchema
    ],

    studentSnapshots:[
        studentSnapshotSchema
    ]

},{
    timestamps:true
});

module.exports =
mongoose.model(
    "CoursePerformance",
    coursePerformanceSchema
);
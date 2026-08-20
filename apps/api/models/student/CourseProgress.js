
const mongoose = require("mongoose");

const completedLessonSchema =
new mongoose.Schema({

    lessonId:{
        type:
        mongoose.Schema.Types.ObjectId
    },

    completedAt:{
        type:Date,
        default:Date.now
    }

},{
    _id:false
});

const courseProgressSchema =
new mongoose.Schema({

    studentId:{
        type:
        mongoose.Schema.Types.ObjectId,
        ref:"Student",
        required:true
    },

    courseId:{
        type:
        mongoose.Schema.Types.ObjectId,
        ref:"Course",
        required:true
    },

    completedLessons:[
        completedLessonSchema
    ],

    currentModule:{
        type:
        mongoose.Schema.Types.ObjectId,
        default:null
    },

    currentLesson:{
        type:
        mongoose.Schema.Types.ObjectId,
        default:null
    },

    progressPercentage:{
        type:Number,
        default:0
    },

    completed:{
        type:Boolean,
        default:false
    },

    certificates:[
        {
            title:{
                type:String
            },
            pdfUrl:{
                type:String,
                default:""
            },
            issuedAt:{
                type:Date,
                default:Date.now
            }
        }
    ]

},{
    timestamps:true
});

module.exports=
mongoose.model(
    "CourseProgress",
    courseProgressSchema
);
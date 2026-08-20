const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({

    fullName:{
        type:String,
        required:true,
        trim:true
    },

    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },

    password:{
        type:String,
        required:true,
        select:false
    },

    profilePhoto:{
        type:String,
        default:""
    },

    phone:{
        type:String,
        default:""
    },

    bio:{
        type:String,
        default:""
    },

    learningInterests:[
        String
    ],

    enrolledCourses:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Course"
        }
    ],

    wishlist:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Course"
        }
    ],

    accountStatus:{
        type:String,
        enum:[
            "active",
            "blocked"
        ],
        default:"active"
    }

},
{
    timestamps:true
});

module.exports=
mongoose.model(
    "Student",
    studentSchema
);
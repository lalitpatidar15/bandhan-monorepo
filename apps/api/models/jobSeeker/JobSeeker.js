const mongoose = require("mongoose");

const jobseekerSchema = new mongoose.Schema(
{
    fullName:{
        type:String,
        required:true
    },

    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },

    password:{
        type:String,
        required:true
    },

    role:{
        type:String,
        default:"jobseeker"
    },

    isVerified:{
        type:Boolean,
        default:true
    },

    // Personal Foundation
    location:{
        type:String,
        default:""
    },

    phone:{
        type:String,
        default:""
    },

    // Professional Profile
    currentRole:{
        type:String,
        default:""
    },

    experienceLevel:{
        type:String,
        enum:[
            "Fresher",
            "0-1 Years",
            "1-3 Years",
            "3-5 Years",
            "5+ Years"
        ],
        default:"Fresher"
    },

    skills:[
        {
            type:String
        }
    ],

    // Education
    college:{
        type:String,
        default:""
    },

    degree:{
        type:String,
        default:""
    },

    graduationYear:{
        type:Number
    },

    // Career Aspirations

    preferredRoles:[
        {
            type:String
        }
    ],

    jobType:[
        {
            type:String
        }
    ],

    salaryExpectation:{
        type:String,
        default:""
    },

    // Resume
    profilePhoto:{

    type:String,

    default:""

},
    resume:{
        type:String,
        default:""
    }

},
{
    timestamps:true
});

module.exports=mongoose.model("JobSeeker",jobseekerSchema);
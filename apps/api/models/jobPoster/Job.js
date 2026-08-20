const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({

    recruiterId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Recruiter",
        required:true
    },

    // ================= BASIC INFO =================

    jobTitle:{
        type:String,
        required:true,
        trim:true
    },

    jobCategory:{
        type:String,
        enum:[
            "Software Development",
            "Design & Creative",
            "Marketing",
            "Sales",
            "Finance",
            "Human Resources",
            "Customer Support",
            "Education",
            "Healthcare",
            "Engineering",
            "Other"
        ],
        default:"Other"
    },

    jobType:{
        type:String,
        enum:[
            "Full-time",
            "Part-time",
            "Contract",
            "Internship",
            "Freelance"
        ],
        default:"Full-time"
    },

    experienceLevel:{
        type:String,
        enum:[
            "Junior",
            "Mid-Level",
            "Senior",
            "Lead/Executive"
        ],
        default:"Junior"
    },

    salaryMin:{
        type:Number,
        default:0
    },

    salaryMax:{
        type:Number,
        default:0
    },

    salaryCurrency:{
        type:String,
        default:"INR"
    },

    location:{
        type:String,
        default:""
    },

    remoteAvailable:{
        type:Boolean,
        default:false
    },

    aboutRole:{
        type:String,
        default:""
    },

    responsibilities:[
        {
            type:String
        }
    ],

    skills:[
        {
            type:String
        }
    ],

    applicationDeadline:{
        type:Date
    },

    openings:{
        type:Number,
        default:1
    },

    // ================= Dashboard =================

    totalApplicants:{
        type:Number,
        default:0
    },

    views:{
        type:Number,
        default:0
    },

    status:{
        type:String,
        enum:[
            "draft",
            "active",
            "closed"
        ],
        default:"draft"
    },
     
    // ================= Featured Job =================

isFeatured:{
    type:Boolean,
    default:false
},

featuredPlan:{
    type:String,
    enum:[
        "",
        "Featured",
        "Premium"
    ],
    default:""
},

featuredPrice:{
    type:Number,
    default:0
},

featuredStartedAt:{
    type:Date,
    default:null
},

featuredTill:{
    type:Date,
    default:null
},

promotionStatus:{
    type:String,
    enum:[
        "none",
        "active",
        "expired"
    ],
    default:"none"
},

    // ================= Wizard =================
    requirements: [
   {
      type:String
   }
   ],

   benefits:[
   {
      type:String
   }
   ],
    currentStep:{
        type:Number,
        default:1
    },

    completedSteps:{
        type:[Number],
        default:[1]
    },

    isDraft:{
        type:Boolean,
        default:true
    },

    isPublished:{
        type:Boolean,
        default:false
    }

},{
    timestamps:true
});

module.exports = mongoose.model(
    "Job",
    jobSchema
);
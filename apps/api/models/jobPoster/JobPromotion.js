const mongoose = require("mongoose");

const jobPromotionSchema = new mongoose.Schema({

    recruiterId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Recruiter",
        required:true
    },

    jobId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Job",
        required:true
    },

    paymentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Payment",
        default:null
    },

    planName:{
        type:String,
        enum:[
            "Free",
            "Featured",
            "Premium"
        ],
        default:"Free"
    },

    amount:{
        type:Number,
        default:0
    },

    duration:{
        type:Number,
        default:30
    },

    features:[
        {
            type:String
        }
    ],

    status:{
        type:String,
        enum:[
            "Pending",
            "Active",
            "Expired"
        ],
        default:"Pending"
    },

    startDate:{
        type:Date,
        default:null
    },

    expiryDate:{
        type:Date,
        default:null
    }

},
{
    timestamps:true
});

module.exports = mongoose.model(
    "JobPromotion",
    jobPromotionSchema
);
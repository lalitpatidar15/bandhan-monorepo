const mongoose = require("mongoose");
 
const billingSchema = new mongoose.Schema(
{
    recruiterId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Recruiter",
        required:true,
        unique:true
    },
 
    billingName:{
        type:String,
        default:""
    },
 
    billingCompany:{
        type:String,
        default:""
    },
 
    billingAddress:{
        type:String,
        default:""
    },
 
    gstNumber:{
        type:String,
        default:""
    }
},
{
    timestamps:true
});
 
module.exports = mongoose.model("Billing", billingSchema);
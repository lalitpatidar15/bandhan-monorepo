
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const recruiterSchema = new mongoose.Schema({

    companyName:{
        type:String,
        required:true,
        trim:true
    },

    companyEmail:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },

    password:{
        type:String,
        required:true
    },

   industry:{
    type:String,
    enum:[
        "Information Technology",
        "Software Development",
        "Artificial Intelligence",
        "Healthcare",
        "Education",
        "Finance & Banking",
        "Accounting",
        "E-commerce",
        "Retail",
        "Manufacturing",
        "Telecommunications",
        "Media & Entertainment",
        "Marketing & Advertising",
        "Human Resources",
        "Real Estate",
        "Construction",
        "Transportation & Logistics",
        "Hospitality",
        "Travel & Tourism",
        "Food & Beverage",
        "Automobile",
        "Pharmaceutical",
        "Legal Services",
        "Consulting",
        "Government",
        "Non-Profit",
        "Agriculture",
        "Energy & Utilities",
        "Fashion & Apparel",
        "Other"
    ]
},

companySize:{
    type:String,
    enum:[
        "1-10 Employees",
        "11-50 Employees",
        "51-200 Employees",
        "201-500 Employees",
        "501-1000 Employees",
        "1001-5001 Employees",
        "5001-10000 Employees",
        "10000+ Employees"
    ]
},

    websiteUrl:{
        type:String,
        default:""
    },

    companyLogo:{
        type:String,
        default:""
    },

    companyTagline:{
        type:String,
        default:""
    },

    description:{
        type:String,
        default:""
    },

    headquartersAddress:{
        type:String,
        default:""
    },

    additionalLocations:{
        type:[String],
        default:[]
    },

    profileCompleted:{
        type:Boolean,
        default:false
    },

    role:{
        type:String,
        default:"recruiter"
    }

},{
    timestamps:true
});

recruiterSchema.pre("save",async function(next){

    if(!this.isModified("password")){
        return next();
    }

    this.password = await bcrypt.hash(this.password,10);

    next();
});

module.exports = mongoose.model("Recruiter",recruiterSchema);
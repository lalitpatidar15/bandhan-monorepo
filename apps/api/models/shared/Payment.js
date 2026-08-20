

// const mongoose = require("mongoose");
 
// const paymentSchema = new mongoose.Schema(
// {
//     // ================= Student =================
 
//     studentId:{
//         type:mongoose.Schema.Types.ObjectId,
//         ref:"Student",
//         default:null
//     },
 
//     courseId:{
//         type:mongoose.Schema.Types.ObjectId,
//         ref:"Course",
//         default:null
//     },
 
//     // ================= Recruiter =================
 
//     recruiterId:{
//         type:mongoose.Schema.Types.ObjectId,
//         ref:"Recruiter",
//         default:null
//     },
 
//     paymentFor:{
//         type:String,
//         enum:[
//             "course",
//             "plan",
//             "featured_job",
//             "bulk_unlock",
//             "invoice"
//         ],
//         default:"course"
//     },
 
//     planName:{
//         type:String,
//         default:""
//     },
 
//     planDuration:{
//         type:Number,
//         default:30
//     },
 
//     planExpiry:{
//         type:Date,
//         default:null
//     },
 
//     // ================= Invoice =================
 
//     isInvoice:{
//         type:Boolean,
//         default:false
//     },
 
//     invoiceNumber:{
//         type:String,
//         default:""
//     },
 
//     clientName:{
//         type:String,
//         default:""
//     },
 
//     notes:{
//         type:String,
//         default:""
//     },
 
//     dueDate:{
//         type:Date,
//         default:null
//     },
 
//     invoiceStatus:{
//         type:String,
//         enum:[
//             "draft",
//             "pending",
//             "paid",
//             "overdue",
//             "cancelled"
//         ],
//         default:"pending"
//     },
 
//     invoiceUrl:{
//         type:String,
//         default:""
//     },
 
//     // ================= Amount =================
 
//     subtotal:{
//         type:Number,
//         required:true
//     },
 
//     platformFee:{
//         type:Number,
//         default:50
//     },
 
//     gst:{
//         type:Number,
//         default:0
//     },
 
//     totalAmount:{
//         type:Number,
//         required:true
//     },
 
//     currency:{
//         type:String,
//         default:"INR"
//     },
 
//     // ================= Payment =================
 
//     paymentMethod:{
//         type:String,
//         enum:[
//             "card",
//             "upi",
//             "netbanking",
//             "wallet",
//             "emi",
//             "pending"
//         ],
//         default:"pending"
//     },
 
//     paymentGateway:{
//         type:String,
//         enum:[
//             "razorpay",
//             "stripe",
//             "offline"
//         ],
//         default:"razorpay"
//     },
 
//     cardType:{
//         type:String,
//         default:""
//     },
 
//     cardLast4:{
//         type:String,
//         default:""
//     },
 
//     emi:{
//         enabled:{
//             type:Boolean,
//             default:false
//         },
 
//         months:{
//             type:Number,
//             default:0
//         },
 
//         monthlyAmount:{
//             type:Number,
//             default:0
//         }
//     },
 
//     orderId:{
//         type:String,
//         unique:true,
//         sparse:true
//     },
 
//     transactionId:{
//         type:String,
//         default:""
//     },
 
//     receipt:{
//         type:String,
//         default:""
//     },
 
//     paidAt:{
//         type:Date,
//         default:null
//     },
 
//     // ================= Billing =================
 
//     billingName:{
//         type:String,
//         default:""
//     },
 
//     billingCompany:{
//         type:String,
//         default:""
//     },
 
//     billingAddress:{
//         type:String,
//         default:""
//     },
 
//     gstNumber:{
//         type:String,
//         default:""
//     },
 
//     // ================= Payment Status =================
 
//     status:{
//         type:String,
//         enum:[
//             "created",
//             "pending",
//             "completed",
//             "failed",
//             "cancelled"
//         ],
//         default:"created"
//     }
 
// },
// {
//     timestamps:true
// });
 
// module.exports = mongoose.model(
//     "Payment",
//     paymentSchema
// );

const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:null,
        index:true
    },

    studentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Student",
        default:null
    },

    courseId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
        default:null
    },

    recruiterId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Recruiter",
        default:null
    },

    jobId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Job",
        default:null
    },

    paymentFor:{
        type:String,
        enum:[
            "course",
            "plan",
            "featured_job",
            "bulk_unlock",
            "invoice",
            "product_order"
        ],
        required:true
    },

    planName:{
        type:String,
        default:""
    },

    planDuration:{
        type:Number,
        default:30
    },

    planExpiry:{
        type:Date,
        default:null
    },

    subtotal:{
        type:Number,
        required:true
    },

    platformFee:{
        type:Number,
        default:0
    },

    gst:{
        type:Number,
        default:0
    },

    discount:{
        type:Number,
        default:0
    },

    totalAmount:{
        type:Number,
        required:true
    },

    currency:{
        type:String,
        default:"INR"
    },

    paymentGateway:{
        type:String,
        default:"razorpay"
    },

    paymentMethod:{
        type:String,
        enum:[
            "card",
            "upi",
            "wallet",
            "netbanking",
            "emi",
            "pending"
        ],
        default:"pending"
    },

    bank:{
        type:String,
        default:""
    },

    wallet:{
        type:String,
        default:""
    },

    vpa:{
        type:String,
        default:""
    },

    cardType:{
        type:String,
        default:""
    },

    cardLast4:{
        type:String,
        default:""
    },

    fee:{
        type:Number,
        default:0
    },

    tax:{
        type:Number,
        default:0
    },

    orderId:{
        type:String,
        unique:true,
        sparse:true
    },

    transactionId:{
        type:String,
        default:""
    },

    receipt:{
        type:String,
        default:""
    },

    signature:{
        type:String,
        default:""
    },

    paidAt:{
        type:Date,
        default:null
    },

    billingName:{
        type:String,
        default:""
    },

    billingEmail:{
        type:String,
        default:""
    },

    billingContact:{
        type:String,
        default:""
    },

    billingAddress:{
        type:String,
        default:""
    },

    isInvoice:{
        type:Boolean,
        default:false
    },

    invoiceNumber:{
        type:String,
        default:""
    },

    clientName:{
        type:String,
        default:""
    },

    notes:{
        type:String,
        default:""
    },

    dueDate:{
        type:Date,
        default:null
    },

    invoiceStatus:{
        type:String,
        enum:[
            "draft",
            "pending",
            "paid",
            "overdue",
            "cancelled"
        ],
        default:"pending"
    },

    invoiceUrl:{
        type:String,
        default:""
    },

    status:{
        type:String,
        enum:[
            "created",
            "pending",
            "completed",
            "failed",
            "cancelled"
        ],
        default:"created"
    },

    metadata:{
        type:mongoose.Schema.Types.Mixed,
        default:{}
    },

    fulfilledOrderIds:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Order"
    }],

    fulfilledAt:{
        type:Date,
        default:null
    }

},{
    timestamps:true
});

paymentSchema.index({ userId: 1, orderId: 1 });

module.exports = mongoose.model("Payment",paymentSchema);

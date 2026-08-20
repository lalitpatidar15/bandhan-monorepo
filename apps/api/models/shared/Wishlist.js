const mongoose =
require("mongoose");

const wishlistSchema =
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
    }

},{
    timestamps:true
});

wishlistSchema.index({
    studentId:1,
    courseId:1
},{
    unique:true
});

module.exports=
mongoose.model(
    "Wishlist",
    wishlistSchema
);
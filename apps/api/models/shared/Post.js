const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  content: String,
  image: String,
  video: String,
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  shareCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);
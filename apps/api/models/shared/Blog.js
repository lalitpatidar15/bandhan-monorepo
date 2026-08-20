const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  content: {
    type: String,
    required: true,
  },
  excerpt: {
    type: String,
    maxlength: 300,
  },
  coverImage: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  authorName: String,
  category: {
    type: String,
    default: "general",
  },
  tags: [String],
  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "draft",
  },
  published: {
    type: Boolean,
    default: false,
  },
  publishedAt: Date,
  viewCount: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  likeCount: { type: Number, default: 0 },
  comments: [commentSchema],
  commentCount: { type: Number, default: 0 },
  seoTitle: String,
  seoDescription: String,
  seoTags: [String],
}, {
  timestamps: true,
});

blogSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  if (this.status === "published" && !this.publishedAt) {
    this.publishedAt = new Date();
    this.published = true;
  }
  this.likeCount = this.likes ? this.likes.length : 0;
  this.commentCount = this.comments ? this.comments.length : 0;
  next();
});

module.exports = mongoose.model("Blog", blogSchema);

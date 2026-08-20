const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  image: String,
  buttonText: String,
  link: { type: String, default: "" },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true });

module.exports = mongoose.model("Banner", bannerSchema);

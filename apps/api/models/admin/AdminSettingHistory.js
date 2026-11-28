const mongoose = require("mongoose");

const adminSettingHistorySchema = new mongoose.Schema(
  {
    key: { type: String, required: true, default: "platform", index: true },
    settings: { type: mongoose.Schema.Types.Mixed, required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    changedByEmail: { type: String, default: "" },
    action: { type: String, enum: ["created", "updated"], default: "updated" },
  },
  { timestamps: true }
);

adminSettingHistorySchema.index({ key: 1, createdAt: -1 });

module.exports = mongoose.model("AdminSettingHistory", adminSettingHistorySchema);

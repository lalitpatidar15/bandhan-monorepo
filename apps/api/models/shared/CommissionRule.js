const mongoose = require("mongoose");

const commissionRuleSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, trim: true },
    type: { type: String, enum: ["fixed", "percentage"], default: "percentage" },
    value: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CommissionRule", commissionRuleSchema);

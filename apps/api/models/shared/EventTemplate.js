const mongoose = require("mongoose");

const eventTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, default: "", trim: true },
    description: { type: String, default: "", trim: true },
    phases: [
      {
        name: { type: String, default: "", trim: true },
        status: { type: String, default: "Not started" },
        progress: { type: Number, min: 0, max: 100, default: 0 },
      },
    ],
    tasks: [
      {
        title: { type: String, default: "", trim: true },
        priority: { type: String, default: "Medium" },
        status: { type: String, default: "pending" },
        vendor: { type: String, default: "" },
        phase: { type: String, default: "" },
      },
    ],
    budgetCategories: { type: [String], default: [] },
    checklist: { type: [String], default: [] },
    invitationMessage: { type: String, default: "", trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EventTemplate", eventTemplateSchema);

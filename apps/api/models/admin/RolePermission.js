const mongoose = require("mongoose");

const rolePermissionSchema = new mongoose.Schema(
  {
    role: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
    permissions: { type: [String], default: [] },
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RolePermission", rolePermissionSchema);

const RolePermission = require("../models/admin/RolePermission.js");

const STAFF_ROLES = new Set(["sub_admin", "moderator"]);

function requirePermission(permission) {
  return async (req, res, next) => {
    try {
      const role = req.user?.role;
      if (role === "admin") return next();

      if (!STAFF_ROLES.has(role) || !permission) {
        return res.status(403).json({ success: false, message: "You do not have permission to perform this action" });
      }

      const record = await RolePermission.findOne({ role }).lean();
      const granted = Array.isArray(record?.permissions) && record.permissions.includes(permission);
      if (!granted) {
        return res.status(403).json({ success: false, message: "You do not have permission to perform this action" });
      }

      return next();
    } catch (error) {
      console.error("Error in middlewares/permissions.js:", error);
      return res.status(403).json({ success: false, message: "You do not have permission to perform this action" });
    }
  };
}

module.exports = { requirePermission };

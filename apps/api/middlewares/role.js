const requireRole = (...roles) => (req, res, next) => {
  const allowedRoles = roles.flat().map((role) => String(role).trim().toLowerCase());
  const currentRole = String(req.user?.role || "").trim().toLowerCase();

  if (!req.user || !allowedRoles.includes(currentRole)) {
    console.error(`[403] Role mismatch: user role="${req.user?.role}", required=${JSON.stringify(allowedRoles)}, path=${req.originalUrl}`);
    return res.status(403).json({ success: false, message: "Forbidden: insufficient permissions" });
  }
  next();
};

const verifyRole = (roles) => requireRole(...roles);

module.exports = { requireRole, verifyRole };

const jwt = require("jsonwebtoken");

module.exports = (req, _res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return next();

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    console.error("Error in middlewares/optionalAuth.js:", err);

    req.user = undefined;
  }

  next();
};

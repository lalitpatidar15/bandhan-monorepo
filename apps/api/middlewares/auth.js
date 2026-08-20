const jwt = require("jsonwebtoken");
const User = require("../models/shared/User.js");
const Instructor = require("../models/instructor/Instructor.js");
const Student = require("../models/student/Student.js");
const Recruiter = require("../models/jobPoster/Recruiter.js");
const JobSeeker = require("../models/jobSeeker/JobSeeker.js");

const MODEL_MAP = {
  instructor: Instructor,
  student: Student,
  recruiter: Recruiter,
  jobseeker: JobSeeker,
};

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded._id;
    const role = decoded.role;
    const Model = MODEL_MAP[role];

    if (Model) {
      const doc = await Model.findById(userId);
      if (!doc) {
        return res.status(401).json({ success: false, message: "Account no longer exists" });
      }
      req.user = { id: userId, _id: userId, role };
      return next();
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ success: false, message: "User no longer exists" });
    }

    if (user.status === "inactive") {
      return res.status(403).json({ success: false, message: "Account is deactivated" });
    }

    req.user = {
      id: userId,
      _id: user._id,
      role: role || user.role,
      email: user.email,
    };
    next();

  } catch (error) {
    console.error("Error in middlewares/auth.js:", error);

    const message = error.name === "JsonWebTokenError" || error.name === "TokenExpiredError"
      ? "Invalid or expired token"
      : "Authentication failed";
    res.status(401).json({ success: false, message });
  }
};

const protectSeller = async (req, res, next) => {
  try {
    await authenticate(req, res, async () => {
      const role = req.user?.role;
      if (role !== "seller" && role !== "admin") {
        return res.status(403).json({ success: false, message: "Only sellers can access this route" });
      }
      next();
    });
  } catch (error) {
    console.error("Error in middlewares/auth.js protectSeller:", error);
    res.status(500).json({ success: false, message: "Authentication failed" });
  }
};

module.exports = authenticate;
module.exports.protectSeller = protectSeller;   
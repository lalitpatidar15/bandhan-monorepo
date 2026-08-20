const express = require("express");

const router = express.Router();
const auth = require("../../middlewares/auth.js");
const { requireRole } = require("../../middlewares/role.js");

const instructordashboardController =
require("../../controllers/Instructor/instructordashboardController.js");


router.get("/:courseId/dashboard",auth, requireRole("instructor"),instructordashboardController.getInstructorDashboard);


router.get("/:courseId/students",auth, requireRole("instructor"),instructordashboardController.getStudentProgress);

router.put("/:courseId/student/:studentId/progress",auth, requireRole("instructor"),instructordashboardController.updateStudentProgress);

router.get("/:courseId/student/:studentId",auth, requireRole("instructor"),instructordashboardController.getStudentDetails);

router.get("/:courseId/reviews",instructordashboardController.getReviews);

router.get("/:courseId/reviews/stats",instructordashboardController.getReviewStats);

router.put("/reply/:reviewId",instructordashboardController.replyReview);

module.exports = router;
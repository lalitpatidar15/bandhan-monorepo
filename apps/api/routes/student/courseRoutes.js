const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth.js");
const { requireRole } = require("../../middlewares/role.js");
const optionalAuth = require("../../middlewares/optionalAuth.js");
const upload = require("../../middlewares/upload.js");
const courseController = require("../../controllers/Student/courseController.js");


router.post("/register",courseController.registerStudent);

router.post( "/login",courseController.loginStudent);

// ======== Marketplace Courses ==========
router.get("/courses", courseController.getMarketplaceCourses);

// =========course details page============
router.get("/course/:courseId", optionalAuth, courseController.getCourseDetails);

// ====== checkout & payment====
router.get("/:courseId/checkout",auth, requireRole("student"),courseController.getCheckout);

router.post("/:courseId/create-order",auth, requireRole("student"),courseController.createOrder);

router.post("/:courseId/verify-payment",auth, requireRole("student"),courseController.verifyPayment);

router.get("/payment/:paymentId",auth, requireRole("student"),courseController.getPayment);

// ========= wishlist=====
router.post("/:courseId",auth, requireRole("student"),courseController.addToWishlist);

router.delete("/:courseId",auth, requireRole("student"),courseController.removeFromWishlist);

router.get("/wishlist",auth, requireRole("student"),courseController.getWishlist);

// =========== enroll =========
router.post("/:courseId/enroll",auth, requireRole("student"),courseController.enrollCourse);

router.get("/enrollments",auth, requireRole("student"),courseController.getEnrollments);

router.get("/enrollment/:courseId",auth, requireRole("student"),courseController.getEnrollment);

router.delete("/enrollment/:courseId",auth, requireRole("student"), courseController.removeEnrollment);

// ======== student dashboard ========
router.get("/dashboard",auth, requireRole("student"),courseController.getStudentDashboard);

// ========== my courses ========
router.get("/my-courses",auth, requireRole("student"), courseController.getMyCourses);

router.post("/:courseId/review",auth, requireRole("student"),courseController.reviewCourse);

// ========== page resources ======
router.get("/page-resources", courseController.getStudentPageResources);

// ==========course player ======
router.get("/course-player/:courseId",auth, requireRole("student"),courseController.getCoursePlayer);

router.put("/course-player/:courseId/lesson/:lessonId/complete",auth, requireRole("student"),courseController.completeLesson);

router.get("/course-player/:courseId/lesson/:lessonId",auth, requireRole("student"),courseController.changeLesson);

router.get("/course-player/:courseId/lesson/:lessonId/resources",auth, requireRole("student"),courseController.getLessonResources);



router.post("/create",courseController.createQuiz);

router.get("/lesson/:lessonId",courseController.getQuizForStudent);

router.post("/:quizId/submit", auth, requireRole("student"), courseController.submitQuiz);


router.get("/result/:studentId/:quizId", courseController.getQuizResult);

router.post("/create-progress", courseController.createProgress);


router.get("/progress/:studentId", courseController.getProgress);


router.get("/progress/:studentId/certificate/:certificateId", courseController.downloadCertificate);

router.post("/create-profile", auth, requireRole("student"), courseController.createProfile);


router.get("/get-profile", auth, requireRole("student"), courseController.getProfile);

router.put("/update-profile", auth, requireRole("student"), courseController.updateProfile);



/**
 * @swagger
 * /api/student/delete-profile:
 *   delete:
 *     summary: Delete student profile
 *     tags: [Student Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile deleted successfully
 *       404:
 *         description: Profile not found
 */
router.delete("/delete-profile", auth, requireRole("student"), courseController.deleteProfile);


router.post(
  "/notifications",
  auth, requireRole("student"),
  courseController.createNotification
);

router.get(
"/notifications",
auth, requireRole("student"),
courseController.getNotifications
);

router.patch(
"/notifications/:id/read",
auth, requireRole("student"),
courseController.markAsRead
);

router.patch(
"/notifications/read-all",
auth, requireRole("student"),
courseController.markAllAsRead
);

router.delete(
"/notifications/:id",
auth, requireRole("student"),
courseController.deleteNotification
);

module.exports = router;

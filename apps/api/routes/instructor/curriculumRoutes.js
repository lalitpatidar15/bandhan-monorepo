const express = require("express");
const router = express.Router();
const upload = require("../../middlewares/upload.js");
const auth = require("../../middlewares/auth.js");
const { requireRole } = require("../../middlewares/role.js");
const curriculumController = require("../../controllers/Instructor/curriculumController.js");


router.get("/basic-info/init", auth, requireRole("instructor"), curriculumController.getBasicInfoInit);

router.post("/create", auth, requireRole("instructor"), upload.single("thumbnail"), curriculumController.createCourse);



router.get("/my-courses", auth, requireRole("instructor"), curriculumController.getMyCourses);

router.get("/:courseId", auth, requireRole("instructor"), curriculumController.getCourseDetails);

router.put("/:courseId", auth, requireRole("instructor"), upload.single("thumbnail"), curriculumController.updateCourse);



// ==== curriculum builder 
router.get("/:courseId/curriculum-page", auth, requireRole("instructor"), curriculumController.getCurriculumBuilder);

router.post("/:courseId/module", auth, requireRole("instructor"), curriculumController.addModule);

router.put("/:courseId/module/reorder", auth, requireRole("instructor"), curriculumController.reorderModules);

router.put("/:courseId/module/:moduleId", auth, requireRole("instructor"), curriculumController.editModule);

router.delete("/:courseId/module/:moduleId", auth, requireRole("instructor"), curriculumController.deleteModule);

router.post("/:courseId/module/:moduleId/lesson", auth, requireRole("instructor"), curriculumController.addLesson);

router.put("/:courseId/module/:moduleId/lesson/:lessonId", auth, requireRole("instructor"), curriculumController.editLesson);

router.delete("/:courseId/module/:moduleId/lesson/:lessonId", auth, requireRole("instructor"), curriculumController.deleteLesson);

router.post("/:courseId/module/:moduleId/lesson/:lessonId/quiz", auth, requireRole("instructor"), curriculumController.addQuiz);

router.put("/:courseId/module/:moduleId/lesson/:lessonId/quiz/:quizId", auth, requireRole("instructor"), curriculumController.editQuiz);

router.delete("/:courseId/module/:moduleId/quiz/:quizId", auth, requireRole("instructor"), curriculumController.deleteQuiz);

router.put("/course/:courseId/curriculum/save-continue", auth, requireRole("instructor"), curriculumController.saveCurriculumAndContinue);

router.get("/:courseId/curriculum", auth, requireRole("instructor"), curriculumController.getCurriculum);

router.get("/:courseId/module/:moduleId/lesson/:lessonId/content-page", auth, requireRole("instructor"), curriculumController.getContentPage);

router.post("/:courseId/module/:moduleId/lesson/:lessonId/video", auth, requireRole("instructor"), upload.single("video"), curriculumController.uploadVideo);

router.post("/:courseId/module/:moduleId/lesson/:lessonId/resource",auth, requireRole("instructor"),upload.single("resource"),curriculumController.uploadResource);

router.put("/:courseId/module/:moduleId/lesson/:lessonId",auth, requireRole("instructor"),curriculumController.updateLesson);

router.delete("/:courseId/module/:moduleId/lesson/:lessonId/resource/:resourceId",auth, requireRole("instructor"),curriculumController.deleteResource);


router.get("/:courseId/module/:moduleId/lesson/:lessonId/status",auth, requireRole("instructor"),curriculumController.getUploadStatus);

router.put("/course/:courseId/module/:moduleId/lesson/:lessonId/save-draft",auth, requireRole("instructor"),curriculumController.saveLessonDraft);


router.put("/course/:courseId/module/:moduleId/lesson/:lessonId/save-continue",auth, requireRole("instructor"),curriculumController.saveLessonAndContinue);

router.put("/:courseId/pricing", auth, requireRole("instructor"), curriculumController.updatePricing);

router.put("/:courseId/emi", auth, requireRole("instructor"), curriculumController.updateEMI);

router.put("/:courseId/visibility", auth, requireRole("instructor"), curriculumController.updateVisibility);

router.get("/:courseId/pricing-page", auth, requireRole("instructor"), curriculumController.getPricingPage);

router.get("/:courseId/publish-status", auth, requireRole("instructor"), curriculumController.getPublishStatus);

router.put("/:courseId/publish", auth, requireRole("instructor"), curriculumController.publishCourse);

module.exports = router;
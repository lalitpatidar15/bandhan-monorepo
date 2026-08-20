const express = require("express");
const router = express.Router();
const upload = require("../../middlewares/upload.js");
const auth = require("../../middlewares/auth.js");
const { requireRole } = require("../../middlewares/role.js");
const instructorController = require("../../controllers/Instructor/instructorController.js");
const instructordashboardController = require("../../controllers/Instructor/instructordashboardController.js");


router.post("/register",instructorController.registerInstructor);

router.post("/login", instructorController.loginInstructor );

router.put("/profile", auth, requireRole("instructor"), upload.single("profilePhoto"), instructorController.updateProfile );

router.get("/profile",auth, requireRole("instructor"),instructorController.getProfile);


router.put("/verification",auth, requireRole("instructor"),upload.fields([
    {
      name:
        "aadhaar",
      maxCount: 1
    },

    {
      name:
        "pan",
      maxCount: 1
    },

    {
      name:
        "academicDegree",
      maxCount: 1
    },

    {
      name:
        "professionalCertificate",
      maxCount: 1
    }
  ]),

  instructorController
    .uploadDocuments
);

router.get("/verification",auth, requireRole("instructor"),instructorController.getDocuments);

router.get("/verification/status",auth, requireRole("instructor"),instructorController.getVerificationStatus);

router.get("/dashboard",auth, requireRole("instructor"),instructordashboardController.getInstructorOverview);

router.get("/page-resources", instructorController.getInstructorPageResources);

router.get("/earnings",auth, requireRole("instructor"),instructorController.getEarnings);

router.put("/course/:courseId/featured",auth, requireRole("instructor"),instructorController.toggleFeatured);

router.post("/course/:courseId/student/:studentId/certificate",auth, requireRole("instructor"),instructorController.issueCertificate);

module.exports = router;

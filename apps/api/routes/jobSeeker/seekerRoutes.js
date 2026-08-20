const express=require("express");

const router=express.Router();
const auth=require("../../middlewares/auth.js");
const { requireRole } = require("../../middlewares/role.js");
const upload=require("../../middlewares/upload.js");
const seekerController = require("../../controllers/JobSeeker/seekerController.js");


/**
 * @swagger
 * /api/job-seeker/register:
 *   post:
 *     tags:
 *       - Job Seeker Authentication
 *     summary: Register Job Seeker
 *     description: Register a new job seeker account.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: Registration successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: All fields are required or email already exists.
 *       500:
 *         description: Internal server error.
 */
router.post("/register", seekerController.register);

/**
 * @swagger
 * /api/job-seeker/login:
 *   post:
 *     tags:
 *       - Job Seeker Authentication
 *     summary: Login Job Seeker
 *     description: Authenticate a job seeker and return JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: Email and password required.
 *       401:
 *         description: Invalid credentials.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
router.post("/login", seekerController.login);


// ======= profile setup =========
/**
 * @swagger
 * /api/job-seeker/profile:
 *   put:
 *     tags:
 *       - Job Seeker Profile
 *     summary: Update Job Seeker Profile
 *     description: Update job seeker profile details including profile photo.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               location:
 *                 type: string
 *               phone:
 *                 type: string
 *               currentRole:
 *                 type: string
 *               experienceLevel:
 *                 type: string
 *               college:
 *                 type: string
 *               degree:
 *                 type: string
 *               graduationYear:
 *                 type: integer
 *               salaryExpectation:
 *                 type: number
 *               skills:
 *                 type: string
 *                 description: JSON array of skills.
 *               preferredRoles:
 *                 type: string
 *                 description: JSON array of preferred roles.
 *               jobType:
 *                 type: string
 *                 description: JSON array of job types.
 *               profilePhoto:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
router.put("/profile",auth, requireRole("jobseeker"),upload.single("profilePhoto"),seekerController.updateProfile);

/**
 * @swagger
 * /api/job-seeker/profile:
 *   get:
 *     tags:
 *       - Job Seeker Profile
 *     summary: Get Job Seeker Profile
 *     description: Fetch logged-in job seeker profile details.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
router.get("/profile",auth, requireRole("jobseeker"),seekerController.getProfile);

// ========== upload resume =========
/**
 * @swagger
 * /api/job-seeker/resume:
 *   post:
 *     tags:
 *       - Job Seeker Resume
 *     summary: Upload Resume
 *     description: Upload resume for the logged-in job seeker.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - resume
 *             properties:
 *               resume:
 *                 type: string
 *                 format: binary
 *                 description: Resume file (PDF, DOC, DOCX)
 *     responses:
 *       200:
 *         description: Resume uploaded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 resume:
 *                   type: string
 *                 file:
 *                   type: object
 *       400:
 *         description: Resume required.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
router.post("/resume",auth, requireRole("jobseeker"),upload.single("resume"),seekerController.uploadResume);

/**
 * @swagger
 * /api/seeker/resume:
 *   get:
 *     tags:
 *       - Job Seeker
 *     summary: Get Uploaded Resume
 *     description: Fetch logged-in job seeker's uploaded resume details.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resume fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Resume fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     resumeUrl:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/raw/upload/v1721000000/resume.pdf
 *                     downloadUrl:
 *                       type: string
 *                       example: /api/seeker/resume/download
 *                     fileName:
 *                       type: string
 *                       example: John_Doe_Resume.pdf
 *       404:
 *         description: Resume not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Resume not found
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
router.get("/resume", auth, requireRole("jobseeker"), seekerController.getResume);

/**
 * @swagger
 * /api/seeker/resume/download:
 *   get:
 *     tags:
 *       - Job Seeker
 *     summary: Download Resume
 *     description: Download or view the logged-in job seeker's uploaded resume.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resume downloaded successfully.
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Resume access denied.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Resume access denied. Try uploading again.
 *       404:
 *         description: Resume not found.
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: false
 *                     message:
 *                       type: string
 *                       example: Resume not found
 *                 - type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: false
 *                     message:
 *                       type: string
 *                       example: Resume not uploaded yet. Please upload your resume first.
 *                 - type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: false
 *                     message:
 *                       type: string
 *                       example: Resume file not found on server
 *                 - type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: false
 *                     message:
 *                       type: string
 *                       example: Resume not accessible (404)
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Failed to download resume
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */
router.get("/resume/download", auth, requireRole("jobseeker"), seekerController.downloadResume);

/**
 * @swagger
 * /api/seeker/resume:
 *   delete:
 *     tags:
 *       - Job Seeker
 *     summary: Delete Resume
 *     description: Delete the uploaded resume of the logged-in job seeker.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resume deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Resume deleted
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
router.delete("/resume", auth, requireRole("jobseeker"), seekerController.deleteResume);

// ========= job listings =======
/**
 * @swagger
 * /api/seeker/jobs:
 *   get:
 *     tags:
 *       - Job Seeker
 *     summary: Get All Jobs
 *     description: Fetch all active and published jobs available for the logged-in job seeker.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Jobs fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
router.get("/jobs", auth, requireRole("jobseeker"), seekerController.getAllJobs);

/**
 * @swagger
 * /api/seeker/{jobId}/save:
 *   post:
 *     tags:
 *       - Job Seeker
 *     summary: Save Job
 *     description: Save a job for the logged-in job seeker.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       201:
 *         description: Job saved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Job saved successfully
 *                 savedJob:
 *                   type: object
 *       400:
 *         description: Job already saved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Job already saved
 *       404:
 *         description: Job not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Job not found
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
router.post("/:jobId/save", auth, requireRole("jobseeker"), seekerController.saveJob);

/**
 * @swagger
 * /api/seeker/{jobId}/save:
 *   delete:
 *     tags:
 *       - Job Seeker
 *     summary: Remove Saved Job
 *     description: Remove a saved job from the logged-in job seeker's saved jobs list.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job removed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Job removed from saved jobs
 *       404:
 *         description: Saved job not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Saved job not found
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
router.delete("/:jobId/save", auth, requireRole("jobseeker"), seekerController.removeSavedJob);

/**
 * @swagger
 * /api/seeker/saved-jobs:
 *   get:
 *     tags:
 *       - Job Seeker
 *     summary: Get Saved Jobs
 *     description: Fetch all jobs saved by the logged-in job seeker.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Saved jobs fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 totalSavedJobs:
 *                   type: integer
 *                   example: 5
 *                 savedJobs:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
router.get("/saved-jobs", auth, requireRole("jobseeker"), seekerController.getSavedJobs);

/**
 * @swagger
 * /api/seeker/{jobId}/share:
 *   get:
 *     tags:
 *       - Job Seeker
 *     summary: Get Job Share Link
 *     description: Generate a shareable link for a job.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Share link generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     jobId:
 *                       type: string
 *                       example: 688c8f7dcb4a7d1b2f123456
 *                     jobTitle:
 *                       type: string
 *                       example: Node.js Developer
 *                     shareUrl:
 *                       type: string
 *                       example: https://yourdomain.com/jobs/688c8f7dcb4a7d1b2f123456
 *       404:
 *         description: Job not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Job not found
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
router.get("/:jobId/share", auth, requireRole("jobseeker"), seekerController.getJobShareLink);

/**
 * @swagger
 * /api/seeker/jobs/{jobId}:
 *   get:
 *     tags:
 *       - Job Seeker
 *     summary: Get Job Details
 *     description: Fetch complete details of a specific active job along with company information, similar jobs, saved status, and share link.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job details fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     jobId:
 *                       type: string
 *                     jobTitle:
 *                       type: string
 *                     company:
 *                       type: object
 *                       properties:
 *                         recruiterId:
 *                           type: string
 *                         companyName:
 *                           type: string
 *                         companyLogo:
 *                           type: string
 *                         companyEmail:
 *                           type: string
 *                         industry:
 *                           type: string
 *                         companySize:
 *                           type: string
 *                         websiteUrl:
 *                           type: string
 *                         description:
 *                           type: string
 *                         headquartersAddress:
 *                           type: string
 *                     jobCategory:
 *                       type: string
 *                     jobType:
 *                       type: string
 *                     experienceLevel:
 *                       type: string
 *                     salaryMin:
 *                       type: number
 *                     salaryMax:
 *                       type: number
 *                     salaryCurrency:
 *                       type: string
 *                     location:
 *                       type: string
 *                     remoteAvailable:
 *                       type: boolean
 *                     aboutRole:
 *                       type: string
 *                     responsibilities:
 *                       type: array
 *                       items:
 *                         type: string
 *                     skills:
 *                       type: array
 *                       items:
 *                         type: string
 *                     applicationDeadline:
 *                       type: string
 *                       format: date-time
 *                     openings:
 *                       type: integer
 *                     totalApplicants:
 *                       type: integer
 *                     totalViews:
 *                       type: integer
 *                     postedOn:
 *                       type: string
 *                       format: date-time
 *                     isSaved:
 *                       type: boolean
 *                     shareUrl:
 *                       type: string
 *                     similarJobs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           jobId:
 *                             type: string
 *                           jobTitle:
 *                             type: string
 *                           companyName:
 *                             type: string
 *                           companyLogo:
 *                             type: string
 *                           location:
 *                             type: string
 *                           salaryMin:
 *                             type: number
 *                           salaryMax:
 *                             type: number
 *                           jobType:
 *                             type: string
 *                           isSaved:
 *                             type: boolean
 *       404:
 *         description: Job not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Job not found
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
router.get("/jobs/:jobId", auth, requireRole("jobseeker"), seekerController.getJobDetails);

// ======= job application =======
/**
 * @swagger
 * /api/seeker/{jobId}/apply:
 *   get:
 *     tags:
 *       - Job Seeker
 *     summary: Get Apply Job Page
 *     description: Fetch job details along with the logged-in job seeker's resume information required before applying for a job.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Apply page fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     jobId:
 *                       type: string
 *                     jobTitle:
 *                       type: string
 *                     company:
 *                       type: object
 *                     jobCategory:
 *                       type: string
 *                     location:
 *                       type: string
 *                     salaryMin:
 *                       type: number
 *                     salaryMax:
 *                       type: number
 *                     salaryCurrency:
 *                       type: string
 *                     experienceLevel:
 *                       type: string
 *                     jobType:
 *                       type: string
 *                     remoteAvailable:
 *                       type: boolean
 *                     aboutRole:
 *                       type: string
 *                     responsibilities:
 *                       type: array
 *                       items:
 *                         type: string
 *                     skills:
 *                       type: array
 *                       items:
 *                         type: string
 *                     applicationDeadline:
 *                       type: string
 *                       format: date-time
 *                     openings:
 *                       type: integer
 *                     totalApplicants:
 *                       type: integer
 *                     totalViews:
 *                       type: integer
 *                     postedOn:
 *                       type: string
 *                       format: date-time
 *                     resume:
 *                       type: object
 *                       properties:
 *                         resumeUrl:
 *                           type: string
 *                     form:
 *                       type: object
 *                       properties:
 *                         coverLetter:
 *                           type: string
 *                         expectedSalary:
 *                           type: number
 *                         salaryType:
 *                           type: string
 *                         additionalAnswer:
 *                           type: string
 *       404:
 *         description: Job or Job Seeker not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Job not found
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
router.get("/:jobId/apply", auth, requireRole("jobseeker"), seekerController.getApplyPage);

/**
 * @swagger
 * /api/seeker/resume:
 *   put:
 *     tags:
 *       - Job Seeker
 *     summary: Replace Resume
 *     description: Replace the logged-in job seeker's existing resume.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - resume
 *             properties:
 *               resume:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Resume replaced successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Resume replaced successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     seekerId:
 *                       type: string
 *                     resume:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Resume file is required.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Resume file is required
 *       404:
 *         description: Job seeker not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Job seeker not found
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
router.put("/resume", auth, requireRole("jobseeker"), upload.single("resume"), seekerController.replaceResume);

/**
 * @swagger
 * /api/seeker/{jobId}/application/draft:
 *   post:
 *     summary: Save application as draft
 *     tags: [Job Seeker]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               coverLetter:
 *                 type: string
 *               expectedSalary:
 *                 type: number
 *               salaryType:
 *                 type: string
 *                 enum:
 *                   - Fixed
 *                   - Monthly
 *                   - Hourly
 *               additionalAnswer:
 *                 type: string
 *     responses:
 *       200:
 *         description: Draft saved successfully
 *       400:
 *         description: Application already submitted
 *       404:
 *         description: Job or Job seeker not found
 *       500:
 *         description: Internal server error
 */
router.post("/:jobId/application/draft",auth, requireRole("jobseeker"),seekerController.saveDraft);

/**
 * @swagger
 * /api/seeker/{jobId}/draft:
 *   get:
 *     summary: Get application draft
 *     tags: [Job Seeker]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Draft fetched successfully
 *       404:
 *         description: Job or Job seeker not found
 *       500:
 *         description: Internal server error
 */
router.get("/:jobId/draft",auth, requireRole("jobseeker"),seekerController.getDraft);

/**
 * @swagger
 * /api/seeker/{jobId}/submit:
 *   post:
 *     summary: Submit job application
 *     tags: [Job Seeker]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - coverLetter
 *               - expectedSalary
 *               - salaryType
 *             properties:
 *               coverLetter:
 *                 type: string
 *               expectedSalary:
 *                 type: number
 *               salaryType:
 *                 type: string
 *                 enum:
 *                   - Fixed
 *                   - Monthly
 *                   - Hourly
 *               additionalAnswer:
 *                 type: string
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *       400:
 *         description: Resume missing or already applied
 *       404:
 *         description: Job or Job seeker not found
 *       500:
 *         description: Internal server error
 */
router.post("/:jobId/submit",auth, requireRole("jobseeker"),seekerController.submitApplication);


module.exports=router;
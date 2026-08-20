const express =require("express");

const router =express.Router();
const auth =require("../../middlewares/auth.js");
const { requireRole } = require("../../middlewares/role.js");
const upload =require("../../middlewares/upload.js");
const jobController =require("../../controllers/JobPoster/jobController.js");


/**
 * @swagger
 * /api/recruiter/register:
 *   post:
 *     tags:
 *       - Recruiter Authentication
 *     summary: Register Recruiter
 *     description: Create a new recruiter account.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyName
 *               - companyEmail
 *               - password
 *             properties:
 *               companyName:
 *                 type: string
 *               companyEmail:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: Account created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 redirectTo:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     recruiterId:
 *                       type: string
 *                     companyName:
 *                       type: string
 *                     companyEmail:
 *                       type: string
 *                     profileCompleted:
 *                       type: boolean
 *       400:
 *         description: Validation error or recruiter already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post("/register", jobController.register);

/**
 * @swagger
 * /api/recruiter/login:
 *   post:
 *     tags:
 *       - Recruiter Authentication
 *     summary: Recruiter Login
 *     description: Login recruiter using company email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyEmail
 *               - password
 *             properties:
 *               companyEmail:
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
 *                 redirectTo:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     recruiterId:
 *                       type: string
 *                     companyName:
 *                       type: string
 *                     companyEmail:
 *                       type: string
 *                     profileCompleted:
 *                       type: boolean
 *                     role:
 *                       type: string
 *       400:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Invalid password.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Recruiter not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post("/login", jobController.login);

// ======== profile setup =========
/**
 * @swagger
 * /api/recruiter/get-profile:
 *   get:
 *     tags:
 *       - Company Profile
 *     summary: Get Company Profile
 *     description: Fetch the logged-in recruiter's company profile.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Company profile fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     recruiterId:
 *                       type: string
 *                     companyEmail:
 *                       type: string
 *                     companyName:
 *                       type: string
 *                     industry:
 *                       type: string
 *                     companySize:
 *                       type: string
 *                     websiteUrl:
 *                       type: string
 *                     companyLogo:
 *                       type: string
 *                     companyTagline:
 *                       type: string
 *                     description:
 *                       type: string
 *                     headquartersAddress:
 *                       type: string
 *                     additionalLocations:
 *                       type: array
 *                       items:
 *                         type: string
 *                     profileCompleted:
 *                       type: boolean
 *                     role:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Recruiter not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.get("/get-profile", auth, requireRole("recruiter"), jobController.getCompanyProfile);

/**
 * @swagger
 * /api/recruiter/company-profile:
 *   post:
 *     tags:
 *       - Company Profile
 *     summary: Save Company Profile
 *     description: Create or update the logged-in recruiter's company profile.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - companyName
 *               - industry
 *               - companySize
 *               - websiteUrl
 *               - companyTagline
 *               - description
 *               - headquartersAddress
 *             properties:
 *               companyName:
 *                 type: string
 *               industry:
 *                 type: string
 *               companySize:
 *                 type: string
 *               websiteUrl:
 *                 type: string
 *               companyLogo:
 *                 type: string
 *                 format: binary
 *               companyTagline:
 *                 type: string
 *               description:
 *                 type: string
 *               headquartersAddress:
 *                 type: string
 *               additionalLocations:
 *                 type: string
 *                 description: Comma separated locations.
 *     responses:
 *       200:
 *         description: Company profile saved successfully.
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
 *                     recruiterId:
 *                       type: string
 *                     companyEmail:
 *                       type: string
 *                     companyName:
 *                       type: string
 *                     industry:
 *                       type: string
 *                     companySize:
 *                       type: string
 *                     websiteUrl:
 *                       type: string
 *                     companyLogo:
 *                       type: string
 *                     companyTagline:
 *                       type: string
 *                     description:
 *                       type: string
 *                     headquartersAddress:
 *                       type: string
 *                     additionalLocations:
 *                       type: array
 *                       items:
 *                         type: string
 *                     profileCompleted:
 *                       type: boolean
 *                     role:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Recruiter not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post("/company-profile",auth, requireRole("recruiter"),upload.single("companyLogo"),jobController.saveCompanyProfile);

// ============ dashboard ==========
/**
 * @swagger
 * /api/recruiter/dashboard:
 *   get:
 *     tags:
 *       - Recruiter Dashboard
 *     summary: Get Recruiter Dashboard
 *     description: Fetch dashboard statistics and all jobs of the logged-in recruiter.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search jobs by title.
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter jobs by status.
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum:
 *             - newest
 *             - oldest
 *         required: false
 *         description: Sort jobs.
 *     responses:
 *       200:
 *         description: Dashboard fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       properties:
 *                         activeJobs:
 *                           type: integer
 *                         draftJobs:
 *                           type: integer
 *                         closedJobs:
 *                           type: integer
 *                         totalApplicants:
 *                           type: integer
 *                     jobs:
 *                       type: array
 *                       items:
 *                         type: object
 *       500:
 *         description: Internal server error.
 */
router.get("/dashboard", auth, requireRole("recruiter"), jobController.getRecruiterDashboard);

// ========== create job posting =============
/**
 * @swagger
 * /api/recruiter/{jobId}:
 *   get:
 *     tags:
 *       - Job Posting
 *     summary: Get Basic Job Information
 *     description: Fetch basic information of a job created by the logged-in recruiter.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID.
 *     responses:
 *       200:
 *         description: Job information fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     jobId:
 *                       type: string
 *                     recruiterId:
 *                       type: string
 *                     jobTitle:
 *                       type: string
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
 *                       format: date
 *                     openings:
 *                       type: integer
 *                     currentStep:
 *                       type: integer
 *                     completedSteps:
 *                       type: array
 *                       items:
 *                         type: integer
 *                     status:
 *                       type: string
 *                     isPublished:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Job not found.
 *       500:
 *         description: Internal server error.
 */
router.get("/:jobId", auth, requireRole("recruiter"), jobController.getBasicInfo);

/**
 * @swagger
 * /api/recruiter/create-job:
 *   post:
 *     tags:
 *       - Job Posting
 *     summary: Create Job Posting
 *     description: Create a new job or update an existing draft job.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobTitle
 *             properties:
 *               jobId:
 *                 type: string
 *               jobTitle:
 *                 type: string
 *               jobCategory:
 *                 type: string
 *               jobType:
 *                 type: string
 *               experienceLevel:
 *                 type: string
 *               salaryMin:
 *                 type: number
 *               salaryMax:
 *                 type: number
 *               location:
 *                 type: string
 *               remoteAvailable:
 *                 type: boolean
 *               aboutRole:
 *                 type: string
 *               responsibilities:
 *                 type: array
 *                 items:
 *                   type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               applicationDeadline:
 *                 type: string
 *                 format: date
 *               openings:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Basic information saved successfully.
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
 *                     jobId:
 *                       type: string
 *                     recruiterId:
 *                       type: string
 *                     jobTitle:
 *                       type: string
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
 *                       format: date
 *                     openings:
 *                       type: integer
 *                     currentStep:
 *                       type: integer
 *                     status:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Job title is required.
 *       404:
 *         description: Job not found.
 *       500:
 *         description: Internal server error.
 */
router.post("/create-job", auth, requireRole("recruiter"), jobController.createJob);

/**
 * @swagger
 * /api/recruiter/save-draft/{jobId}:
 *   put:
 *     tags:
 *       - Job Posting
 *     summary: Save Job as Draft
 *     description: Save an existing job as draft.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID.
 *     responses:
 *       200:
 *         description: Job saved as draft successfully.
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
 *                     jobId:
 *                       type: string
 *                     recruiterId:
 *                       type: string
 *                     jobTitle:
 *                       type: string
 *                     status:
 *                       type: string
 *                     isDraft:
 *                       type: boolean
 *                     isPublished:
 *                       type: boolean
 *                     currentStep:
 *                       type: integer
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Job not found.
 *       500:
 *         description: Internal server error.
 */
router.put("/save-draft/:jobId", auth, requireRole("recruiter"), jobController.saveDraft);

/**
 * @swagger
 * /api/recruiter/view/{jobId}:
 *   get:
 *     tags:
 *       - Job Posting
 *     summary: View Job Details
 *     description: Fetch complete job details of the logged-in recruiter.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID.
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     jobId:
 *                       type: string
 *                     recruiter:
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
 *                     jobTitle:
 *                       type: string
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
 *                       format: date
 *                     openings:
 *                       type: integer
 *                     status:
 *                       type: string
 *                     currentStep:
 *                       type: integer
 *                     completedSteps:
 *                       type: array
 *                       items:
 *                         type: integer
 *                     isDraft:
 *                       type: boolean
 *                     isPublished:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Job not found.
 *       500:
 *         description: Internal server error.
 */
router.get("/view/:jobId", auth, requireRole("recruiter"), jobController.getJobById);

/**
 * @swagger
 * /api/recruiter/update/{jobId}:
 *   put:
 *     tags:
 *       - Job Posting
 *     summary: Update Job
 *     description: Update an existing job.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               jobTitle:
 *                 type: string
 *               jobCategory:
 *                 type: string
 *               jobType:
 *                 type: string
 *               experienceLevel:
 *                 type: string
 *               salaryMin:
 *                 type: number
 *               salaryMax:
 *                 type: number
 *               location:
 *                 type: string
 *               remoteAvailable:
 *                 type: boolean
 *               aboutRole:
 *                 type: string
 *               responsibilities:
 *                 type: array
 *                 items:
 *                   type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               applicationDeadline:
 *                 type: string
 *                 format: date
 *               openings:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Job updated successfully.
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
 *         description: Job not found.
 *       500:
 *         description: Internal server error.
 */
router.put("/update/:jobId", auth, requireRole("recruiter"), jobController.updateJob);

/**
 * @swagger
 * /api/recruiter/delete/{jobId}:
 *   delete:
 *     tags:
 *       - Job Posting
 *     summary: Delete Job
 *     description: Delete a job created by the logged-in recruiter.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID.
 *     responses:
 *       200:
 *         description: Job deleted successfully.
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
 *                     jobId:
 *                       type: string
 *                     jobTitle:
 *                       type: string
 *       404:
 *         description: Job not found.
 *       500:
 *         description: Internal server error.
 */
router.delete("/delete/:jobId", auth, requireRole("recruiter"), jobController.deleteJob);


/**
 * @swagger
 * /api/recruiter/{jobId}/publish:
 *   patch:
 *     tags:
 *       - Job Posting
 *     summary: Publish Job
 *     description: Publish a draft job and make it active.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID.
 *     responses:
 *       200:
 *         description: Job published successfully.
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
 *                     jobId:
 *                       type: string
 *                     recruiterId:
 *                       type: string
 *                     jobTitle:
 *                       type: string
 *                     status:
 *                       type: string
 *                     isDraft:
 *                       type: boolean
 *                     isPublished:
 *                       type: boolean
 *                     publishedAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Job not found.
 *       500:
 *         description: Internal server error.
 */
router.patch("/:jobId/publish", auth, requireRole("recruiter"), jobController.publishJob);

// ===  ====== job details management =========
/**
 * @swagger
 * /api/recruiter/{jobId}/details:
 *   get:
 *     tags:
 *       - Job Details
 *     summary: Get Job Details
 *     description: Fetch complete job details along with applicant statistics and applicant list for the logged-in recruiter.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID.
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     job:
 *                       type: object
 *                       properties:
 *                         jobId:
 *                           type: string
 *                         title:
 *                           type: string
 *                         company:
 *                           type: string
 *                         companyLogo:
 *                           type: string
 *                         location:
 *                           type: string
 *                         status:
 *                           type: string
 *                         postedDate:
 *                           type: string
 *                           format: date-time
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalApplicants:
 *                           type: integer
 *                         shortlisted:
 *                           type: integer
 *                         interviewed:
 *                           type: integer
 *                         rejected:
 *                           type: integer
 *                     applicants:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           applicationId:
 *                             type: string
 *                           candidateId:
 *                             type: string
 *                           fullName:
 *                             type: string
 *                           email:
 *                             type: string
 *                           profileImage:
 *                             type: string
 *                           experienceLevel:
 *                             type: string
 *                           appliedDate:
 *                             type: string
 *                             format: date-time
 *                           status:
 *                             type: string
 *       404:
 *         description: Job not found.
 *       500:
 *         description: Internal server error.
 */
router.get("/:jobId/details", auth, requireRole("recruiter"), jobController.getJobDetails);

/**
 * @swagger
 * /api/recruiter/{jobId}/close:
 *   patch:
 *     tags:
 *       - Job Details
 *     summary: Close Job
 *     description: Close an active job and stop accepting applications.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID.
 *     responses:
 *       200:
 *         description: Job closed successfully.
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
 *                     jobId:
 *                       type: string
 *                     jobTitle:
 *                       type: string
 *                     status:
 *                       type: string
 *                     isPublished:
 *                       type: boolean
 *                     closedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Job is already closed.
 *       404:
 *         description: Job not found.
 *       500:
 *         description: Internal server error.
 */
router.patch("/:jobId/close", auth, requireRole("recruiter"), jobController.closeJob);

// ============ applicants list ========
/**
 * @swagger
 * /api/recruiter/{jobId}/applicants:
 *   get:
 *     tags:
 *       - Applicants Management
 *     summary: Get Applicants
 *     description: Fetch all applicants of a job with search, filter, sorting and pagination.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum:
 *             - newest
 *             - oldest
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Applicants fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     job:
 *                       type: object
 *                       properties:
 *                         jobId:
 *                           type: string
 *                         jobTitle:
 *                           type: string
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalApplicants:
 *                           type: integer
 *                         shortlisted:
 *                           type: integer
 *                         interviewed:
 *                           type: integer
 *                         rejected:
 *                           type: integer
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalRecords:
 *                           type: integer
 *                     applicants:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           applicationId:
 *                             type: string
 *                           candidateId:
 *                             type: string
 *                           profilePhoto:
 *                             type: string
 *                           fullName:
 *                             type: string
 *                           email:
 *                             type: string
 *                           location:
 *                             type: string
 *                           currentRole:
 *                             type: string
 *                           experience:
 *                             type: string
 *                           skills:
 *                             type: array
 *                             items:
 *                               type: string
 *                           resume:
 *                             type: string
 *                           coverLetter:
 *                             type: string
 *                           expectedSalary:
 *                             type: number
 *                           salaryType:
 *                             type: string
 *                           additionalAnswer:
 *                             type: string
 *                           appliedDate:
 *                             type: string
 *                             format: date-time
 *                           submittedAt:
 *                             type: string
 *                             format: date-time
 *                           status:
 *                             type: string
 *       404:
 *         description: Job not found.
 *       500:
 *         description: Internal server error.
 */
router.get("/:jobId/applicants", auth, requireRole("recruiter"), jobController.getApplicants);

/**
 * @swagger
 * /api/recruiter/{applicationId}/status:
 *   patch:
 *     tags:
 *       - Applicants Management
 *     summary: Update Application Status
 *     description: Update applicant status and send notification to the job seeker.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - Submitted
 *                   - Reviewed
 *                   - Shortlisted
 *                   - Rejected
 *                   - Hired
 *     responses:
 *       200:
 *         description: Application status updated successfully.
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
 *                     applicationId:
 *                       type: string
 *                     jobTitle:
 *                       type: string
 *                     candidate:
 *                       type: string
 *                     status:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Status is required or invalid status.
 *       404:
 *         description: Application not found.
 *       500:
 *         description: Internal server error.
 */
router.patch("/:applicationId/status", auth, requireRole("recruiter"), jobController.updateApplicationStatus);

/**
 * @swagger
 * /api/recruiter/{applicationId}/resume/download:
 *   get:
 *     tags:
 *       - Applicant Management
 *     summary: Download Applicant Resume
 *     description: Get resume URL of a job applicant.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID.
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     candidateId:
 *                       type: string
 *                     candidateName:
 *                       type: string
 *                     resumeUrl:
 *                       type: string
 *       404:
 *         description: Application not found or Resume not uploaded.
 *       500:
 *         description: Internal server error.
 */
router.get("/:applicationId/resume/download",auth, requireRole("recruiter"),jobController.downloadResume);

/**
 * @swagger
 * /api/recruiter/bulk-status:
 *   put:
 *     tags:
 *       - Applicant Management
 *     summary: Bulk Update Application Status
 *     description: Update status of multiple job applications.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - applicationIds
 *               - status
 *             properties:
 *               applicationIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum:
 *                   - Submitted
 *                   - Reviewed
 *                   - Shortlisted
 *                   - Rejected
 *                   - Hired
 *     responses:
 *       200:
 *         description: Applications updated successfully.
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
 *                     modifiedCount:
 *                       type: integer
 *                     status:
 *                       type: string
 *       400:
 *         description: Invalid request.
 *       500:
 *         description: Internal server error.
 */
router.put("/bulk-status",auth, requireRole("recruiter"),jobController.bulkUpdateStatus);

/**
 * @swagger
 * /api/recruiter/{applicationId}/interview:
 *   post:
 *     tags:
 *       - Applicant Management
 *     summary: Schedule Interview
 *     description: Schedule an interview for a selected applicant.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - interviewDate
 *               - meetingLink
 *               - interviewer
 *             properties:
 *               interviewDate:
 *                 type: string
 *                 format: date-time
 *               meetingLink:
 *                 type: string
 *               interviewer:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Interview scheduled successfully.
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
 *         description: Application not found.
 *       500:
 *         description: Internal server error.
 */
router.post("/:applicationId/interview",auth, requireRole("recruiter"),jobController.scheduleInterview);

module.exports = router;
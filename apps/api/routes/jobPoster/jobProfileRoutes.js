const express =require("express");

const router =express.Router();
const auth =require("../../middlewares/auth.js");
const { requireRole } = require("../../middlewares/role.js");
const upload =require("../../middlewares/upload.js");
const jobProfileController =require("../../controllers/JobPoster/jobProfileController.js");


/**
 * @swagger
 * /api/recruiter/applications/{applicationId}:
 *   get:
 *     tags:
 *       - Candidate Profile
 *     summary: Get Candidate Profile
 *     description: Fetch complete candidate profile for a specific application.
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
 *         description: Candidate profile fetched successfully.
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
 *                     applicationId:
 *                       type: string
 *                     status:
 *                       type: string
 *                     appliedDate:
 *                       type: string
 *                       format: date-time
 *                     submittedAt:
 *                       type: string
 *                       format: date-time
 *                     coverLetter:
 *                       type: string
 *                     expectedSalary:
 *                       type: number
 *                     salaryType:
 *                       type: string
 *                     additionalAnswer:
 *                       type: string
 *                     matchScore:
 *                       type: number
 *                     candidate:
 *                       type: object
 *                       properties:
 *                         candidateId:
 *                           type: string
 *                         fullName:
 *                           type: string
 *                         email:
 *                           type: string
 *                         phone:
 *                           type: string
 *                         profileImage:
 *                           type: string
 *                         experienceLevel:
 *                           type: string
 *                         city:
 *                           type: string
 *                         state:
 *                           type: string
 *                         about:
 *                           type: string
 *                         skills:
 *                           type: array
 *                           items:
 *                             type: string
 *                         education:
 *                           type: array
 *                           items:
 *                             type: object
 *                         workHistory:
 *                           type: array
 *                           items:
 *                             type: object
 *                         resume:
 *                           type: string
 *                         lastActive:
 *                           type: string
 *                           format: date-time
 *                     job:
 *                       type: object
 *                       properties:
 *                         jobId:
 *                           type: string
 *                         jobTitle:
 *                           type: string
 *                         location:
 *                           type: string
 *                         jobType:
 *                           type: string
 *                         experienceLevel:
 *                           type: string
 *                         salaryMin:
 *                           type: number
 *                         salaryMax:
 *                           type: number
 *       404:
 *         description: Application not found.
 *       500:
 *         description: Internal server error.
 */
router.get("/applications/:applicationId", auth, requireRole("recruiter"), jobProfileController.getCandidateProfile);

/**
 * @swagger
 * /api/recruiter/{applicationId}/note:
 *   post:
 *     tags:
 *       - Candidate Profile
 *     summary: Save Internal Note
 *     description: Save an internal note for a candidate application.
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
 *               - internalNote
 *             properties:
 *               internalNote:
 *                 type: string
 *     responses:
 *       200:
 *         description: Internal note saved successfully.
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
 *                     candidateName:
 *                       type: string
 *                     jobTitle:
 *                       type: string
 *                     internalNote:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Internal note is required.
 *       404:
 *         description: Application not found.
 *       500:
 *         description: Internal server error.
 */
router.post("/:applicationId/note", auth, requireRole("recruiter"), jobProfileController.saveInternalNote);

/**
 * @swagger
 * /api/recruiter/{jobId}/pipeline:
 *   get:
 *     tags:
 *       - Hiring Pipeline
 *     summary: Get Hiring Pipeline
 *     description: Fetch hiring pipeline for a job with search, filters and stage-wise candidates.
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
 *         name: experience
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
 *     responses:
 *       200:
 *         description: Hiring pipeline fetched successfully.
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
 *                     counts:
 *                       type: object
 *                       properties:
 *                         applied:
 *                           type: integer
 *                         shortlisted:
 *                           type: integer
 *                         interview:
 *                           type: integer
 *                         offer:
 *                           type: integer
 *                         hired:
 *                           type: integer
 *                         rejected:
 *                           type: integer
 *                     pipeline:
 *                       type: object
 *                       properties:
 *                         applied:
 *                           type: array
 *                           items:
 *                             type: object
 *                         shortlisted:
 *                           type: array
 *                           items:
 *                             type: object
 *                         interview:
 *                           type: array
 *                           items:
 *                             type: object
 *                         offer:
 *                           type: array
 *                           items:
 *                             type: object
 *                         hired:
 *                           type: array
 *                           items:
 *                             type: object
 *                         rejected:
 *                           type: array
 *                           items:
 *                             type: object
 *       404:
 *         description: Job not found.
 *       500:
 *         description: Internal server error.
 */
router.get("/:jobId/pipeline", auth, requireRole("recruiter"), jobProfileController.getHiringPipeline);

// ============ payment and invoice ==============
/**
 * @swagger
 * /api/recruiter/payments/dashboard:
 *   get:
 *     tags:
 *       - Financial Dashboard
 *     summary: Get Financial Dashboard
 *     description: Fetch recruiter payment dashboard including total spend, current month spend, pending payments, current subscription plan and monthly spending graph.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Financial dashboard fetched successfully.
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
 *                     totalSpend:
 *                       type: number
 *                     monthSpend:
 *                       type: number
 *                     pendingPayment:
 *                       type: number
 *                     currentPlan:
 *                       type: string
 *                     planExpiry:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     monthlyGraph:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: object
 *                             properties:
 *                               month:
 *                                 type: integer
 *                           amount:
 *                             type: number
 *       500:
 *         description: Internal server error.
 */
router.get("/payments/dashboard",auth, requireRole("recruiter"),jobProfileController.getFinancialDashboard);
  
// ================= Invoice =================
 /**
 * @swagger
 * /api/recruiter/invoice:
 *   post:
 *     tags:
 *       - Invoice Management
 *     summary: Create Invoice
 *     description: Create a new invoice.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientName
 *               - invoiceNumber
 *               - amount
 *               - dueDate
 *             properties:
 *               clientName:
 *                 type: string
 *               invoiceNumber:
 *                 type: string
 *               amount:
 *                 type: number
 *               dueDate:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Invoice created successfully.
 *       400:
 *         description: Validation error or invoice number already exists.
 *       500:
 *         description: Internal server error.
 */
router.post("/invoice", auth, requireRole("recruiter"), jobProfileController.createInvoice);

/**
 * @swagger
 * /api/recruiter/invoices:
 *   get:
 *     tags:
 *       - Invoice Management
 *     summary: Get All Invoices
 *     description: Fetch all recruiter invoices.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Invoice list fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 totalInvoices:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       invoiceNumber:
 *                         type: string
 *                       clientName:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       dueDate:
 *                         type: string
 *                         format: date
 *                       invoiceStatus:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Internal server error.
 */
router.get("/invoices", auth, requireRole("recruiter"), jobProfileController.getInvoices);

/**
 * @swagger
 * /api/recruiter/invoice/{id}:
 *   get:
 *     tags:
 *       - Invoice Management
 *     summary: Get Invoice By Id
 *     description: Fetch invoice details by invoice id.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice fetched successfully.
 *       400:
 *         description: Invalid invoice id.
 *       404:
 *         description: Invoice not found.
 *       500:
 *         description: Internal server error.
 */
router.get("/invoice/:id", auth, requireRole("recruiter"), jobProfileController.getInvoiceById);

/**
 * @swagger
 * /api/recruiter/invoice/{id}:
 *   put:
 *     tags:
 *       - Invoice Management
 *     summary: Update Invoice
 *     description: Update an existing invoice.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clientName:
 *                 type: string
 *               invoiceNumber:
 *                 type: string
 *               amount:
 *                 type: number
 *               dueDate:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *               invoiceStatus:
 *                 type: string
 *     responses:
 *       200:
 *         description: Invoice updated successfully.
 *       400:
 *         description: Invalid invoice id or paid invoice cannot be updated.
 *       404:
 *         description: Invoice not found.
 *       500:
 *         description: Internal server error.
 */
router.put("/invoice/:id", auth, requireRole("recruiter"), jobProfileController.updateInvoice);

/**
 * @swagger
 * /api/recruiter/invoice/{id}:
 *   delete:
 *     tags:
 *       - Invoice Management
 *     summary: Delete Invoice
 *     description: Delete an unpaid invoice.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice deleted successfully.
 *       400:
 *         description: Invalid invoice id or paid invoice cannot be deleted.
 *       404:
 *         description: Invoice not found.
 *       500:
 *         description: Internal server error.
 */
router.delete("/invoice/:id", auth, requireRole("recruiter"), jobProfileController.deleteInvoice);
 
 
// ================= Billing =================
/**
 * @swagger
 * /api/recruiter/billing:
 *   get:
 *     tags:
 *       - Billing Management
 *     summary: Get Billing Information
 *     description: Fetch recruiter billing information.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Billing information fetched successfully.
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
 *                     billingName:
 *                       type: string
 *                     billingCompany:
 *                       type: string
 *                     billingAddress:
 *                       type: string
 *                     gstNumber:
 *                       type: string
 *       500:
 *         description: Internal server error.
 */
router.get("/billing", auth, requireRole("recruiter"),jobProfileController.getBilling);

/**
 * @swagger
 * /api/recruiter/billing:
 *   put:
 *     tags:
 *       - Billing Management
 *     summary: Update Billing Information
 *     description: Create or update recruiter billing information.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - billingName
 *               - billingCompany
 *               - billingAddress
 *             properties:
 *               billingName:
 *                 type: string
 *               billingCompany:
 *                 type: string
 *               billingAddress:
 *                 type: string
 *               gstNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Billing information updated successfully.
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
 *                     billingName:
 *                       type: string
 *                     billingCompany:
 *                       type: string
 *                     billingAddress:
 *                       type: string
 *                     gstNumber:
 *                       type: string
 *       400:
 *         description: Billing Name, Company and Address are required.
 *       500:
 *         description: Internal server error.
 */
router.put("/billing",auth, requireRole("recruiter"),jobProfileController.updateBilling);
 
 
// ================= Recruiter =================
/**
 * @swagger
 * /api/recruiter/recruiters:
 *   get:
 *     tags:
 *       - Recruiter & Plans
 *     summary: Get Recruiter Overview
 *     description: Fetch recruiter profile summary, current plan and outstanding balance.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recruiter information fetched successfully.
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
 *                     companyName:
 *                       type: string
 *                     companyEmail:
 *                       type: string
 *                     currentPlan:
 *                       type: string
 *                     outstandingBalance:
 *                       type: number
 *                     profileStatus:
 *                       type: string
 *       404:
 *         description: Recruiter not found.
 *       500:
 *         description: Internal server error.
 */
router.get("/recruiters",auth, requireRole("recruiter"),jobProfileController.getRecruiters);
 
// ============ upgrade plans =============
/**
 * @swagger
 * /api/job-profile/plans:
 *   get:
 *     summary: Get Subscription Plans
 *     tags: [Recruiter Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription plans fetched successfully
 *       500:
 *         description: Internal server error
 */
router.get("/plans", auth, requireRole("recruiter"),jobProfileController.getPlans);

/**
 * @swagger
 * /api/job-profile/current-plan:
 *   get:
 *     summary: Get Current Subscription Plan
 *     tags: [Recruiter Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current subscription plan fetched successfully
 *       500:
 *         description: Internal server error
 */
router.get("/current-plan",auth, requireRole("recruiter"),jobProfileController.getCurrentPlan);
 
// ================= Razorpay =================
/**
 * @swagger
 * /api/job-profile/create-order:
 *   post:
 *     summary: Create Razorpay Order
 *     tags: [Recruiter Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentFor
 *               - planName
 *             properties:
 *               paymentFor:
 *                 type: string
 *                 enum:
 *                   - plan
 *                   - featured_job
 *               planName:
 *                 type: string
 *                 enum:
 *                   - Featured
 *                   - Premium
 *               jobId:
 *                 type: string
 *                 description: Required only when paymentFor is featured_job
 *     responses:
 *       201:
 *         description: Razorpay order created successfully
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Job not found
 *       500:
 *         description: Internal server error
 */
router.post("/create-order",auth, requireRole("recruiter"),jobProfileController.createOrder);

/**
 * @swagger
 * /api/job-profile/verify-payment:
 *   post:
 *     summary: Verify Razorpay Payment
 *     tags: [Recruiter Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - paymentId
 *               - signature
 *             properties:
 *               orderId:
 *                 type: string
 *               paymentId:
 *                 type: string
 *               signature:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *       400:
 *         description: Invalid request or payment already verified
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Internal server error
 */
router.post("/verify-payment",auth, requireRole("recruiter"), jobProfileController.verifyPayment);
 
module.exports = router;

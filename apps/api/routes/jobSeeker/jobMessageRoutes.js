const express=require("express");

const router=express.Router();
const auth=require("../../middlewares/auth.js");
const { requireRole } = require("../../middlewares/role.js");
const upload=require("../../middlewares/upload.js");
const jobMessageController = require("../../controllers/JobSeeker/jobMessageController.js");

// ======== job seeker  dashboard ===========
/**
 * @swagger
 * /api/seeker/dashboard:
 *   get:
 *     summary: Get Job Seeker Dashboard
 *     tags: [Job Seeker]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard fetched successfully
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
 *                     welcome:
 *                       type: object
 *                       properties:
 *                         fullName:
 *                           type: string
 *                         profilePhoto:
 *                           type: string
 *                         resume:
 *                           type: string
 *                     summary:
 *                       type: object
 *                       properties:
 *                         applications:
 *                           type: number
 *                         messages:
 *                           type: number
 *                         notifications:
 *                           type: number
 *                         savedJobs:
 *                           type: number
 *                     recentApplications:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           applicationId:
 *                             type: string
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
 *                           jobType:
 *                             type: string
 *                           salaryMin:
 *                             type: number
 *                           salaryMax:
 *                             type: number
 *                           salaryCurrency:
 *                             type: string
 *                           remoteAvailable:
 *                             type: boolean
 *                           applicationDeadline:
 *                             type: string
 *                             format: date-time
 *                           status:
 *                             type: string
 *                           appliedAt:
 *                             type: string
 *                             format: date-time
 *                     recommendedJobs:
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
 *                           salaryCurrency:
 *                             type: string
 *                           experienceLevel:
 *                             type: string
 *                           jobType:
 *                             type: string
 *                           remoteAvailable:
 *                             type: boolean
 *                           applicationDeadline:
 *                             type: string
 *                             format: date-time
 *                           openings:
 *                             type: number
 *                           views:
 *                             type: number
 *                           totalApplicants:
 *                             type: number
 *                           skills:
 *                             type: array
 *                             items:
 *                               type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           isSaved:
 *                             type: boolean
 *                     profileCompletion:
 *                       type: object
 *                       properties:
 *                         overall:
 *                           type: number
 *                         resume:
 *                           type: number
 *                         skills:
 *                           type: number
 *                         experience:
 *                           type: number
 *                     quickActions:
 *                       type: object
 *                       properties:
 *                         searchJobs:
 *                           type: string
 *                         uploadResume:
 *                           type: string
 *                         editProfile:
 *                           type: string
 *                         messages:
 *                           type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Job Seeker not found
 *       500:
 *         description: Internal server error
 */
router.get("/dashboard",auth,requireRole("jobseeker"),jobMessageController.getJobSeekerDashboard);

// ============ application tracking =========
/**
 * @swagger
 * /api/seeker/applications:
 *   get:
 *     summary: Get all job applications
 *     tags: [Job Seeker]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by job title or company name
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum:
 *             - All
 *             - Applied
 *             - Review
 *             - Interview
 *             - Rejected
 *             - Offer
 *             - Hired
 *             - Draft
 *           default: All
 *         description: Filter applications by status
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum:
 *             - recent
 *             - oldest
 *           default: recent
 *         description: Sort applications
 *     responses:
 *       200:
 *         description: Applications fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalApplications:
 *                       type: integer
 *                     applied:
 *                       type: integer
 *                     reviewed:
 *                       type: integer
 *                     interview:
 *                       type: integer
 *                     rejected:
 *                       type: integer
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalRecords:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                 applications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       applicationId:
 *                         type: string
 *                       jobId:
 *                         type: string
 *                       recruiterId:
 *                         type: string
 *                       jobTitle:
 *                         type: string
 *                       companyName:
 *                         type: string
 *                       companyLogo:
 *                         type: string
 *                       location:
 *                         type: string
 *                       status:
 *                         type: string
 *                       appliedDate:
 *                         type: string
 *                         format: date-time
 *                       lastUpdated:
 *                         type: string
 *                         format: date-time
 *                       timeline:
 *                         type: object
 *                         properties:
 *                           applied:
 *                             type: boolean
 *                           reviewed:
 *                             type: boolean
 *                           interview:
 *                             type: boolean
 *                           offer:
 *                             type: boolean
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/applications",auth,requireRole("jobseeker"),jobMessageController.getApplications);

router.get("/unread-count",auth,requireRole("jobseeker","recruiter"),jobMessageController.getUnreadCount);

router.get("/notification",auth,requireRole("jobseeker","recruiter"),jobMessageController.getNotifications);

router.get("/dashboard",auth,requireRole("recruiter"),jobMessageController.getPaymentDashboard);

/**
 * @swagger
 * /api/payment/history:
 *   get:
 *     summary: Get payment history
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Records per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Payment status
 *       - in: query
 *         name: paymentFor
 *         schema:
 *           type: string
 *         description: Payment type
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by plan name, payment type or transaction id
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date
 *     responses:
 *       200:
 *         description: Payment history fetched successfully
 *       500:
 *         description: Internal server error
 */
router.get("/history",auth,requireRole("recruiter"),jobMessageController.getPaymentHistory);

/**
 * @swagger
 * /api/payment/{paymentId}:
 *   get:
 *     summary: Get Payment Details
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment details fetched successfully
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Internal server error
 */
router.get("/:paymentId",auth,requireRole("recruiter"),jobMessageController.getPaymentDetails);



/**
 * @swagger
 * /api/job-message/{applicationId}:
 *   post:
 *     summary: Start conversation with candidate
 *     tags: [Job Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Conversation ready
 *       404:
 *         description: Application not found
 *       500:
 *         description: Internal server error
 */
router.post("/:applicationId",auth,requireRole("jobseeker","recruiter"),jobMessageController.startConversation);

// ================= notification ==============
/**
 * @swagger
 * /api/job-message/notification:
 *   get:
 *     summary: Get Notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Records per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title or message
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum:
 *             - all
 *             - application
 *             - message
 *             - payment
 *             - job
 *         description: Notification type
 *     responses:
 *       200:
 *         description: Notifications fetched successfully
 *       500:
 *         description: Internal server error
 */
// ================= messages ==============
/**
 * @swagger
 * /api/job-message:
 *   get:
 *     summary: Get all conversations
 *     tags: [Job Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Search by candidate or company name
 *     responses:
 *       200:
 *         description: Conversations fetched successfully
 *       500:
 *         description: Internal server error
 */
router.get("/",auth,requireRole("jobseeker","recruiter"),jobMessageController.getConversations);

/**
 * @swagger
 * /api/job-message/{conversationId}:
 *   get:
 *     summary: Get conversation messages
 *     tags: [Job Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *     responses:
 *       200:
 *         description: Messages fetched successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: Internal server error
 */
router.get("/:conversationId",auth,requireRole("jobseeker","recruiter"),jobMessageController.getMessages);

/**
 * @swagger
 * /api/job-message/{conversationId}/send:
 *   post:
 *     summary: Send message
 *     tags: [Job Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               messageType:
 *                 type: string
 *                 enum: [text, image, file]
 *               fileUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Message is required
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: Internal server error
 */
router.post("/:conversationId/send",auth,requireRole("jobseeker","recruiter"),jobMessageController.sendMessage);

/**
 * @swagger
 * /api/job-message/read/{conversationId}:
 *   put:
 *     summary: Mark messages as read
 *     tags: [Job Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *     responses:
 *       200:
 *         description: Messages marked as read
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: Internal server error
 */
router.put("/read-all",auth,requireRole("jobseeker","recruiter"),jobMessageController.markAllRead);

router.put("/read/:conversationId",auth,requireRole("jobseeker","recruiter"),jobMessageController.markAsRead);

// ================= notification ==============
/**
 * @swagger
 * /api/job-message/{id}/read:
 *   put:
 *     summary: Mark Notification As Read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read successfully
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id/read",auth,requireRole("jobseeker","recruiter"),jobMessageController.markNotificationsAsRead);

/**
 * @swagger
 * /api/job-message/{id}:
 *   delete:
 *     summary: Delete Notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id",auth,requireRole("jobseeker","recruiter"),jobMessageController.deleteNotification);

router.post(

    "/save-token",
    auth,requireRole("jobseeker","recruiter"),
    jobMessageController.saveFcmToken

);


module.exports=router;
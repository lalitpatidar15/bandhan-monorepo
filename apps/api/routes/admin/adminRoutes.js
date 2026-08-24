const express = require("express");
const router = express.Router();
const adminController = require("../../controllers/admin/adminController.js");
const auth = require("../../middlewares/auth.js");

const checkAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ success: false, message: "Access denied" });
  }
  next();
};

router.use(auth, checkAdmin);

// Dashboard
router.get("/dashboard/stats", adminController.getDashboardStats);

// Users
router.post("/users", adminController.createUser);
router.get("/users", adminController.getUsers);
router.get("/users/:id", adminController.getUserById);
router.put("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);

// Products
router.post("/products", adminController.createProduct);
router.get("/products", adminController.getProducts);
router.get("/products/:id", adminController.getProductById);
router.put("/products/:id", adminController.updateProduct);
router.delete("/products/:id", adminController.deleteProduct);

// Orders
router.get("/orders", adminController.getOrders);
router.get("/orders/:id", adminController.getOrderById);
router.put("/orders/:id", adminController.updateOrder);
router.post("/orders/:id/refund", adminController.refundOrder);

// Venues
router.get("/venues", adminController.getVenues);
router.get("/venues/:id", adminController.getVenueDetails);
router.put("/venues/:id", adminController.updateVenue);
router.delete("/venues/:id", adminController.deleteVenue);

// Enhanced seller views
router.get("/sellers", adminController.getSellersWithReviews);
router.get("/sellers/:sellerId/reviews", adminController.getSellerReviews);
router.put("/sellers/:id/status", adminController.suspendSeller);

// Enhanced instructor views
router.get("/instructors-detailed", adminController.getInstructorsWithReviews);
router.get("/instructors/:instructorId/reviews", adminController.getInstructorReviews);
router.put("/instructors/:id/status", adminController.updateInstructorStatus);

// Enhanced job poster views
router.get("/job-posters-detailed", adminController.getJobPostersWithJobs);
router.get("/job-posters/:posterId/jobs", adminController.getJobPosterJobs);
router.put("/job-posters/:id/status", adminController.updateJobPosterStatus);

// Analytics
router.get("/analytics", adminController.getAnalytics);

// Settings
router.get("/settings", adminController.getSettings);
router.put("/settings", adminController.updateSettings);

// Learning/admin visibility modules
router.post("/students", adminController.createStudent);
router.get("/students", adminController.getStudents);
router.put("/students/:id", adminController.updateStudent);
router.delete("/students/:id", adminController.deleteStudent);
router.post("/instructors", adminController.createInstructor);
router.get("/instructors", adminController.getInstructors);
router.put("/instructors/:id", adminController.updateInstructor);
router.delete("/instructors/:id", adminController.deleteInstructor);
router.post("/courses", adminController.createCourse);
router.get("/courses", adminController.getCourses);
router.put("/courses/:id", adminController.updateCourse);
router.delete("/courses/:id", adminController.deleteCourse);
router.get("/enrollments", adminController.getEnrollments);
router.put("/enrollments/:id", adminController.updateEnrollment);
router.delete("/enrollments/:id", adminController.deleteEnrollment);

// Governance and moderation modules
router.post("/job-seekers", adminController.createJobSeeker);
router.get("/job-seekers", adminController.getJobSeekers);
router.put("/job-seekers/:id", adminController.updateJobSeeker);
router.delete("/job-seekers/:id", adminController.deleteJobSeeker);
router.post("/job-posters", adminController.createJobPoster);
router.get("/job-posters", adminController.getJobPosters);
router.put("/job-posters/:id", adminController.updateJobPoster);
router.delete("/job-posters/:id", adminController.deleteJobPoster);
router.get("/jobs/moderation", adminController.getJobModerationQueue);
router.put("/jobs/moderation/:id", adminController.updateJobModeration);
router.get("/applications", adminController.getApplications);
router.get("/moderation/products", adminController.getProductModerationQueue);
router.put("/moderation/products/:id", adminController.updateProductModeration);
router.get("/moderation/content", adminController.getContentModerationQueue);
router.delete("/moderation/content/:id", adminController.removeContentPost);

router.get("/roles-permissions", adminController.getRolePermissions);
router.post("/roles-permissions", adminController.createRolePermission);
router.put("/roles-permissions/:id", adminController.updateRolePermission);
router.delete("/roles-permissions/:id", adminController.deleteRolePermission);

router.get("/categories", adminController.getCategories);
router.post("/categories", adminController.createCategory);
router.put("/categories/:id", adminController.updateCategory);
router.delete("/categories/:id", adminController.deleteCategory);

router.get("/commissions", adminController.getCommissionRules);
router.post("/commissions", adminController.createCommissionRule);
router.put("/commissions/:id", adminController.updateCommissionRule);
router.delete("/commissions/:id", adminController.deleteCommissionRule);

router.get("/featured-listings", adminController.getFeaturedListings);

router.get("/job-posting-fee", adminController.getJobPostingFee);
router.put("/job-posting-fee", adminController.updateJobPostingFee);

router.get("/disputes", adminController.getDisputes);
router.put("/disputes/:id", adminController.updateDispute);

router.get("/support-tickets", adminController.getSupportTickets);
router.put("/support-tickets/:id", adminController.updateSupportTicket);

// Blogs
router.get("/blogs", adminController.getBlogs);
router.post("/blogs", adminController.createBlog);
router.get("/blogs/:id", adminController.getBlogById);
router.put("/blogs/:id", adminController.updateBlog);
router.delete("/blogs/:id", adminController.deleteBlog);

// Banners
router.get("/banners", adminController.getBanners);
router.post("/banners", adminController.createBanner);
router.put("/banners/:id", adminController.updateBanner);
router.delete("/banners/:id", adminController.deleteBanner);

// Rental Orders
router.get("/rental-orders", adminController.getRentalOrders);
router.get("/rental-orders/:id", adminController.getRentalOrderById);
router.put("/rental-orders/:id", adminController.updateRentalOrder);

// Plans
router.get("/plans", adminController.getPlans);
router.post("/plans", adminController.createPlan);
router.put("/plans/:id", adminController.updatePlan);
router.delete("/plans/:id", adminController.deletePlan);

module.exports = router;

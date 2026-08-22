const express = require("express");

const dotenv = require("dotenv");

const cors = require("cors");

const helmet = require("helmet");

const { rateLimit } = require("express-rate-limit");

const morgan = require("morgan");

const swaggerUi = require("swagger-ui-express");

const swaggerJsdoc = require("swagger-jsdoc");

dotenv.config();

const { isOriginAllowed } = require("./utils/corsOrigins");

require("./config/firebase");

const options = {

  definition: {

    openapi: "3.0.0",

    info: {

      title: "Bandhan Platform API",

      version: "1.0.0",

      description: "Backend APIs for Bandhan commerce, student, instructor, and jobs applications.",

    },

    components: {

      securitySchemes: {

        bearerAuth: {

          type: "http",

          scheme: "bearer",

          bearerFormat: "JWT",

        },

      },

    },

    security: [

      {

        bearerAuth: [],

      },

    ],

  },

  apis: ["./routes/**/*.js", "./app.js"],

};

const specs = swaggerJsdoc(options);

const authRoutes = require("./routes/ecommUser/authRoutes");

const userRoutes = require("./routes/ecommUser/userRoutes");

const cartRoutes = require("./routes/ecommUser/cartRoutes");

const packageRoutes = require("./routes/ecommUser/packageRoutes");

const quoteRoutes = require("./routes/ecommUser/quoteRoutes");

const venueRoutes = require("./routes/ecommUser/venueRoutes");

const productRoutes = require("./routes/ecommUser/productRoutes");

const eventRoutes = require("./routes/ecommUser/eventRoutes");

const dashboardRoutes = require("./routes/ecommUser/dashboardRoutes");

const activityRoutes = require("./routes/ecommUser/activityRoutes");

const bannerRoutes = require("./routes/ecommUser/bannerRoutes");

const postRoutes = require("./routes/ecommUser/postRoutes");

const profileRoutes = require("./routes/ecommUser/profileRoutes");

const identityVerificationRoutes = require("./routes/shared/identityVerificationRoutes");

const inventoryRoutes = require("./routes/ecommUser/inventoryRoutes");
const sellerRoutes = require("./routes/ecommUser/sellerRoutes");

const orderRoutes = require("./routes/ecommUser/orderRoutes");

const returnRoutes = require("./routes/ecommUser/returnRoutes");

const chatRoutes = require("./routes/ecommUser/chatRoutes");

const earningRoutes = require("./routes/ecommUser/earningRoutes");

const reviewRoutes = require("./routes/ecommUser/reviewRoutes");

const merchantRoutes = require("./routes/merchant/merchantRoutes");
const adminRoutes = require("./routes/admin/adminRoutes");

const ecommUserRoutes = require("./routes/ecommUser/userRoutes");

const bookingRoutes = require("./routes/ecommUser/bookingRoutes");

const notificationRoutes = require("./routes/ecommUser/notificationRoutes");

const vendorRoutes = require("./routes/ecommUser/vendorRoutes");
const catalogRoutes = require("./routes/ecommUser/catalogRoutes");
const customerRoutes = require("./routes/ecommUser/customerRoutes");

// ============= student panel =========
const courseRoutes = require("./routes/student/courseRoutes");

// ============ instructor panel =========
const instructorRoutes = require("./routes/instructor/instructorRoutes");

const curriculumRoutes = require("./routes/instructor/curriculumRoutes");

const instructordashboardRoutes = require("./routes/instructor/instructordashboardRoutes");

// ================= job poster panel =================
const jobRoutes = require("./routes/jobPoster/jobRoutes");
const jobProfileRoutes = require("./routes/jobPoster/jobProfileRoutes");

// ================= job seeker panel =================
const seekerRoutes = require("./routes/jobSeeker/seekerRoutes");
const jobMessageRoutes = require("./routes/jobSeeker/jobMessageRoutes");

const app = express();
const connectDB = require("./config/db");

let dbPromise;
function ensureDB() {
  if (!dbPromise) {
    dbPromise = connectDB().catch((error) => {
      // A failed cold-start connection must be retryable on the next request.
      dbPromise = null;
      throw error;
    });
  }
  return dbPromise;
}

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(helmet({ contentSecurityPolicy: false }));

app.use(
  cors({
    origin: function (origin, callback) {
      if (isOriginAllowed(origin)) return callback(null, true);

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
morgan.token("timestamp", () => new Date().toISOString());
morgan.format("timestamped-combined", ':timestamp :remote-addr - :remote-user ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"');
morgan.format("timestamped-dev", ":timestamp :method :url :status :response-time ms");
app.use(morgan(process.env.NODE_ENV === "production" ? "timestamped-combined" : "timestamped-dev"));

app.use(async (req, res, next) => {
  if (req.path === "/health") return next();

  try {
    await ensureDB();
    return next();
  } catch (_error) {
    return res.status(503).json({
      success: false,
      message: "Database connection is temporarily unavailable. Please try again shortly.",
    });
  }
});

// ============= public / landing page =========
app.use("/api/public", require("./routes/public/publicRoutes"));

app.use(express.json({ limit: "1mb" }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again shortly." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { success: false, message: "Too many login attempts. Please try again later." },
});

app.use((req, res, next) => {
  req.io = global.io;
  next();
});

app.use("/uploads", express.static(require("path").join(__dirname, "uploads")));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api", apiLimiter);
app.use(["/api/auth/login", "/api/student/login", "/api/instructor/login"], authLimiter);

app.use("/api/auth", authRoutes);

app.use("/api/user", userRoutes);

app.use("/api/users", ecommUserRoutes);

app.use("/api/bookings", bookingRoutes);

app.use("/api/events", eventRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/vendors", vendorRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/customer", customerRoutes);

app.use("/api/cart", cartRoutes);

app.use("/api/packages", packageRoutes);

app.use("/api/quote", quoteRoutes);

app.use("/api/services", require("./routes/ecommUser/serviceRoutes"));
app.use("/api/venues", venueRoutes);

app.use("/api/products", productRoutes);

app.use("/api/activity", activityRoutes);

app.use("/api/banner", bannerRoutes);

app.use("/api/posts", postRoutes);

app.use("/api/profile", profileRoutes);

app.use("/api/identity-verification", identityVerificationRoutes);

app.use("/api/inventory", inventoryRoutes);
app.use("/api/seller", sellerRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/returns", returnRoutes);

app.use("/api/chat", chatRoutes);

app.use("/api/earnings", earningRoutes);

app.use("/api/reviews", reviewRoutes);

app.use("/api/merchant", merchantRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api/payment", require("./routes/ecommUser/paymentRoutes"));
app.use("/api/shipping", require("./routes/ecommUser/shippingRoutes"));
app.use("/api/shiprocket", require("./routes/ecommUser/shippingRoutes"));

app.use("/api/wishlist", require("./routes/ecommUser/ecomWishlistRoutes"));
app.use("/api/blogs", require("./routes/ecommUser/blogRoutes"));
app.use("/api/invoices", require("./routes/ecommUser/invoiceRoutes"));
app.use("/api/rental-orders", require("./routes/ecommUser/rentalOrderRoutes"));
app.use("/api/coupons", require("./routes/ecommUser/couponRoutes"));
app.use("/api/audit-logs", require("./routes/ecommUser/auditLogRoutes"));
app.use("/api/settlements", require("./routes/ecommUser/settlementRoutes"));

// ============= student panel =========
app.use("/api/student", courseRoutes);

// =========== instructor panel =========
app.use("/api/instructor", instructorRoutes);

app.use("/api/curriculum", curriculumRoutes);

app.use("/api/dashboard", instructordashboardRoutes);

app.use("/api/dashboard", dashboardRoutes);

// ================= job poster panel =================
app.use("/api/job", jobRoutes);
app.use("/api/job-profile", jobProfileRoutes);

// ================= job seeker panel =================
app.use("/api/seeker", seekerRoutes);
app.use("/api/job-message", jobMessageRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((error, _req, res, _next) => {
  const isCorsError = error?.message === "Not allowed by CORS";
  const status = isCorsError ? 403 : error?.status || 500;

  if (status >= 500) console.error("Unhandled request error:", error);

  const defaultMessage = isCorsError ? "Origin is not allowed" : "Internal server error";
  const message = process.env.NODE_ENV !== "production" ? error?.message || defaultMessage : defaultMessage;

  res.status(status).json({
    success: false,
    message,
  });
});

ensureDB().catch((err) => {
  console.error("Mongo init failed:", err.message);
});

if (require.main === module) {
  const http = require("http");
  const validateEnv = require("./utils/validateEnv");

  const PORT = process.env.PORT || 5000;

  const server = http.createServer(app);

  validateEnv();
  connectDB()
    .then(() => {
      server.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("Failed to start server:", err.message);
      process.exit(1);
    });
} else {
  module.exports = app;
}

// ===== EVENT TIMELINE ========== HOME DASHBOARD ===

const Dashboard = require("../../models/shared/Dashboard.js");
const Product = require("../../models/shared/Product.js");
const Activity = require("../../models/shared/Activity.js");
const Banner = require("../../models/shared/Banner.js");
const Order = require("../../models/shared/Order.js");
const Quote = require("../../models/shared/Quote.js");
const Booking = require("../../models/shared/Booking.js");
const User = require("../../models/shared/User.js");
const Event = require("../../models/shared/Event.js");
const RentalOrder = require("../../models/shared/RentalOrder.js");
const { getAuthenticatedOwnerId } = require("../../utils/ownership.js");


exports.createDashboard = async (req, res) => {
  try {
    const data = await Dashboard.create({ ...req.body, userId: req.user.id });
    res.status(201).json(data);
  } catch (err) {
    console.error("Error in controllers/ecommUser/dashboardController.js:", err);

    res.status(500).json({ error: "Failed to load dashboard" });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    if (req.params.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You cannot access another user's dashboard"
      });
    }

    const data = await Dashboard.findOne({ userId: req.user.id });
    res.json(data);
  } catch (err) {
    console.error("Error in controllers/ecommUser/dashboardController.js:", err);

    res.status(500).json({ error: "Failed to load dashboard" });
  }
};


// =========== getMarketPlaceDashboard ==========
exports.getMarketplaceDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const featured = await Product.find({ isFeatured: true }).limit(6);

    const recent = await Activity.find({ userId })
      .populate("productId")
      .sort({ createdAt: -1 })
      .limit(5);

    const banner = await Banner.findOne().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        welcome: "Welcome back",
        featured: featured.length ? featured : [],
        recent: recent.length ? recent : [],
        banner: banner || {}
      }
    });

  } catch (err) {
    console.error("Error in controllers/ecommUser/dashboardController.js:", err);

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard"
    });
  }
};

const toRelativeTime = (date) => {
  const timestamp = new Date(date).getTime();
  if (!Number.isFinite(timestamp)) return "";
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "Yesterday" : `${days}d ago`;
};

const isUpcomingDate = (value, now = new Date()) => {
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) && timestamp >= now.getTime();
};

const buildPlanningProgress = (event) => {
  if (!event) {
    return {
      completed: 0,
      total: 5,
      budgetUsedPercent: 0,
      completedTasks: 0,
      openTasks: 0,
      venuesAdded: 0,
      vendorsAdded: 0,
    };
  }

  const tasks = Array.isArray(event.tasks) ? event.tasks : [];
  const vendors = Array.isArray(event.vendors) ? event.vendors : [];
  const venues = Array.isArray(event.venues) ? event.venues : [];
  const completedTasks = tasks.filter((task) => ["done", "completed"].includes(String(task.status || "").toLowerCase())).length;
  const budgetTotal = Number(event.budget?.total || 0);
  const budgetSpent = Number(event.budget?.spent || 0);
  const hasDetails = Boolean(event.title && event.date && event.location && event.eventType);
  const checklist = [
    hasDetails,
    budgetTotal > 0,
    venues.length > 0,
    vendors.length > 0,
    tasks.length > 0 && completedTasks === tasks.length,
  ];

  return {
    completed: checklist.filter(Boolean).length,
    total: checklist.length,
    budgetUsedPercent: budgetTotal > 0 ? Math.min(100, Math.round((budgetSpent / budgetTotal) * 100)) : 0,
    completedTasks,
    openTasks: Math.max(0, tasks.length - completedTasks),
    venuesAdded: venues.length,
    vendorsAdded: vendors.length,
  };
};

// Buyer-facing dashboard derives every count and activity from persisted
// event plans, orders, rentals, quotes, bookings and activities.
exports.getBuyerDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const [user, orders, quotes, bookings, activities, events, activeRentals] = await Promise.all([
      User.findById(userId).select("fullName profilePic profileImage role"),
      Order.find({ buyerId: userId }).sort({ createdAt: -1 }).limit(10),
      Quote.find({ userId }).sort({ createdAt: -1 }).limit(10),
      Booking.find({ userId })
        .populate("venueId", "name images location")
        .populate("items.serviceId", "title image location")
        .sort({ eventDate: 1, createdAt: -1 })
        .limit(10),
      Activity.find({ userId }).sort({ createdAt: -1 }).limit(10),
      Event.find({ owner: userId, status: { $ne: "cancelled" } }).sort({ date: 1, createdAt: -1 }).limit(10),
      RentalOrder.countDocuments({
        userId,
        rentalStatus: { $nin: ["completed", "cancelled"] },
      }),
    ]);

    const now = new Date();
    const activeQuotes = quotes.filter((quote) => ["pending", "replied"].includes(quote.status)).length;
    const upcomingBookings = bookings
      .filter((booking) => booking.status !== "cancelled" && booking.eventDate && new Date(booking.eventDate) >= now)
      .slice(0, 3);
    const upcomingEvents = events.filter((event) => isUpcomingDate(event.date, now));
    const featuredEvent = upcomingEvents[0] || events[0] || null;
    const planningProgress = buildPlanningProgress(featuredEvent);

    const bookingActivities = bookings.map((booking) => ({
      id: `booking-${booking._id}`,
      title: `${booking.bookingType === "venue" ? "Venue" : "Service"} booking ${booking.status}`,
      description: booking.venueId?.name || booking.items?.[0]?.title || "Booking updated",
      time: toRelativeTime(booking.updatedAt || booking.createdAt),
      type: "vendor",
      createdAt: booking.updatedAt || booking.createdAt,
    }));
    const quoteActivities = quotes.map((quote) => ({
      id: `quote-${quote._id}`,
      title: `Quote ${quote.status}`,
      description: quote.title || quote.eventType || "Quote request updated",
      time: toRelativeTime(quote.updatedAt || quote.createdAt),
      type: "vendor",
      createdAt: quote.updatedAt || quote.createdAt,
    }));
    const orderActivities = orders.map((order) => ({
      id: `order-${order._id}`,
      title: `Order ${order.status}`,
      description: order.productName || order.items?.[0]?.title || order.orderId || "Order updated",
      time: toRelativeTime(order.updatedAt || order.createdAt),
      type: "payment",
      createdAt: order.updatedAt || order.createdAt,
    }));
    const storedActivities = activities.map((activity) => ({
      id: `activity-${activity._id}`,
      title: "Activity updated",
      description: activity.message || "Your marketplace activity was updated",
      time: toRelativeTime(activity.createdAt),
      type: "guest",
      createdAt: activity.createdAt,
    }));
    const recentActivities = [...bookingActivities, ...quoteActivities, ...orderActivities, ...storedActivities]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(({ createdAt, ...activity }) => activity);

    res.json({
      success: true,
      data: {
        user: user ? {
          name: user.fullName || "",
          role: user.role || "buyer",
          avatar: user.profilePic || user.profileImage || "",
        } : null,
        featuredEvent: featuredEvent ? {
          id: String(featuredEvent._id),
          title: featuredEvent.title,
          tag: featuredEvent.eventType || "Event plan",
          date: featuredEvent.date
            ? new Date(featuredEvent.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
            : "Date not set",
          description: featuredEvent.description || `Planning in ${featuredEvent.location}`,
          plannedGuests: Number(featuredEvent.guestCount || 0),
          vendorsAdded: Array.isArray(featuredEvent.vendors) ? featuredEvent.vendors.length : 0,
          venuesAdded: Array.isArray(featuredEvent.venues) ? featuredEvent.venues.length : 0,
          budgetTotal: Number(featuredEvent.budget?.total || 0),
          image: "",
        } : null,
        planningProgress,
        eventsSummary: {
          total: events.length,
          upcoming: upcomingEvents.length,
        },
        ordersSummary: { activeRentals, newQuotes: activeQuotes },
        recentActivities,
        upcomingMilestones: upcomingBookings.map((booking) => ({
          id: String(booking._id),
          daysLeft: Math.max(0, Math.ceil((new Date(booking.eventDate) - now) / 86400000)) === 0
            ? "TODAY"
            : `IN ${Math.max(0, Math.ceil((new Date(booking.eventDate) - now) / 86400000))} DAYS`,
          title: booking.venueId?.name || booking.items?.[0]?.title || "Upcoming booking",
          subtitle: booking.bookingType === "venue" ? "Venue booking" : "Service booking",
          time: booking.startTime || "Time to be confirmed",
        })),
      },
    });
  } catch (error) {
    console.error("Error in controllers/ecommUser/dashboardController.js:", error);
    res.status(500).json({ success: false, message: "Failed to load buyer dashboard" });
  }
};

exports.buildPlanningProgress = buildPlanningProgress;



// ===== product seller panel - seller dashboard 
exports.getDashboardOverview = async (req, res) => {
  try {
    const userId = getAuthenticatedOwnerId(req) || req.user?.id;
    const role = String(req.user?.role || "").toLowerCase();

    let orderFilter = {};
    let productFilter = {};
    let activityFilter = {};

    if (role !== "admin") {
      orderFilter = {
        $or: [
          { sellerId: userId },
          { "items.sellerId": userId }
        ]
      };
      productFilter = { sellerId: userId };
      activityFilter = { sellerId: userId };
    }

    const orders = await Order.find(orderFilter);

    // For seller: only count revenue from their own items
    let totalRevenue = 0;
    let totalOrders = 0;
    let pendingOrders = 0;

    if (role === "admin") {
      totalRevenue = orders.reduce((sum, item) => sum + (item.amount || 0), 0);
      totalOrders = orders.length;
      pendingOrders = orders.filter(item => item.status === "pending").length;
    } else {
      for (const order of orders) {
        const sellerItems = (order.items || []).filter(
          (item) => String(item.sellerId) === String(userId)
        );
        const sellerAmount = sellerItems.reduce(
          (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
          0
        );
        totalRevenue += sellerAmount;
        totalOrders += sellerItems.length > 0 ? 1 : 0;
        if (order.status === "pending" && sellerItems.length > 0) {
          pendingOrders++;
        }
      }
    }

    const recentOrders = await Order.find(orderFilter)
      .sort({ createdAt: -1 })
      .limit(5);

    const topProducts = await Product.find(productFilter)
      .sort({ orders: -1 })
      .limit(3);

    const recentActivity = await Activity.find(activityFilter)
      .sort({ createdAt: -1 })
      .limit(5);

    // For seller dashboard: filter order items to only show seller's items
    const sanitizedRecentOrders = recentOrders.map((order) => {
      const orderObj = order.toObject ? order.toObject() : { ...order };
      if (role !== "admin" && Array.isArray(orderObj.items)) {
        orderObj.items = orderObj.items.filter(
          (item) => String(item.sellerId) === String(userId)
        );
      }
      return orderObj;
    });

    const revenueAnalytics = [
      { day: "Mon", amount: 12000 },
      { day: "Tue", amount: 18000 },
      { day: "Wed", amount: 9000 },
      { day: "Thu", amount: 22000 },
      { day: "Fri", amount: 15000 },
      { day: "Sat", amount: 25000 },
      { day: "Sun", amount: 19000 }
    ];

    res.json({
      success: true,
      summary: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        rating: 4.8
      },
      revenueAnalytics,
      recentOrders: sanitizedRecentOrders,
      topServices: topProducts,
      recentActivity
    });
  } catch (error) {
    console.error("Error in controllers/ecommUser/dashboardController.js:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard"
    });
  }
};

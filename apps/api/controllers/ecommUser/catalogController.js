const Category = require("../../models/shared/Category.js");
const AdminSetting = require("../../models/admin/AdminSetting.js");
const Product = require("../../models/shared/Product.js");
const Service = require("../../models/shared/Service.js");
const Venue = require("../../models/shared/Venue.js");
const Package = require("../../models/shared/Package.js");
const Job = require("../../models/jobPoster/Job.js");

const DEFAULT_FILTERS = {
  sortOptions: [
    { value: "recommended", label: "Recommended" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "rating", label: "Rating" },
    { value: "newest", label: "Newest" },
  ],
  productModes: ["buy", "rent"],
  venueTypes: [],
  serviceTypes: ["Decor", "Catering", "Photography", "Entertainment"],
  ratingSteps: [3, 4, 4.5],
};

exports.getCatalogConfig = async (_req, res) => {
  try {
    const [settings, categories, products, services, venues, packages, jobs] = await Promise.all([
      AdminSetting.findOne({ key: "platform" }).lean(),
      Category.find({ isActive: true }).sort({ name: 1 }).lean(),
      Product.find({ status: "active" }).select("category subCategory location stockStatus").lean(),
      Service.find({ isActive: true }).select("category").lean(),
      Venue.find().select("location guests").lean(),
      Package.find().select("eventType serviceTier").lean(),
      Job.find({ status: "active", isPublished: true }).select("jobCategory jobType experienceLevel location remoteAvailable").lean(),
    ]);

    const productCategories = categories.map((item) => item.name).filter(Boolean);

    const productSubcategories = Array.from(
      new Set(
        categories
          .flatMap((item) => (Array.isArray(item.subcategories) ? item.subcategories : []))
          .map((item) => String(item || "").trim())
          .filter(Boolean)
      )
    );

    const productLocations = Array.from(
      new Set(products.map((item) => String(item.location || "").trim()).filter(Boolean))
    );

    const configuredFilters = settings?.catalogFilters || DEFAULT_FILTERS;
    const serviceCategories = Array.from(
      new Set([
        ...(configuredFilters.serviceTypes || []),
        ...services.map((item) => String(item.category || "").trim()),
      ].filter(Boolean))
    );

    const venueLocations = Array.from(
      new Set(venues.map((item) => String(item.location || "").trim()).filter(Boolean))
    );

    const maxVenueGuests = venues.reduce((max, item) => Math.max(max, Number(item.guests || 0)), 0);

    const eventTypes = Array.from(
      new Set([
        ...(configuredFilters.eventTypes || []),
        ...packages.map((item) => String(item.eventType || "").trim()),
      ].filter(Boolean))
    );

    const jobCategories = Array.from(
      new Set([
        ...(configuredFilters.jobCategories || []),
        ...jobs.map((item) => String(item.jobCategory || "").trim()),
      ].filter(Boolean))
    );

    const jobTypes = Array.from(
      new Set([
        ...(configuredFilters.jobTypes || []),
        ...jobs.map((item) => String(item.jobType || "").trim()),
      ].filter(Boolean))
    );

    const experienceLevels = Array.from(
      new Set([
        ...(configuredFilters.experienceLevels || []),
        ...jobs.map((item) => String(item.experienceLevel || "").trim()),
      ].filter(Boolean))
    );

    const jobLocations = Array.from(
      new Set(jobs.map((item) => String(item.location || "").trim()).filter(Boolean))
    );

    res.json({
      success: true,
      data: {
        categories: categories.map((item) => ({
          id: item._id,
          name: item.name,
          subcategories: Array.isArray(item.subcategories) ? item.subcategories : [],
        })),
        filters: {
          ...configuredFilters,
          productCategories,
          productSubcategories,
          productLocations,
          serviceCategories,
          venueLocations,
          venueGuestRange: {
            min: 0,
            max: maxVenueGuests,
          },
          eventTypes,
          jobCategories,
          jobTypes,
          experienceLevels,
          jobLocations,
        },
      },
    });
  } catch (error) {
    console.error("Error in controllers/ecommUser/catalogController.js:", error);

    res.status(500).json({ success: false, message: "Failed to load catalog configuration" });
  }
};

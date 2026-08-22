const Job = require("../../models/jobPoster/Job.js");
const Course = require("../../models/student/Course.js");
const Product = require("../../models/shared/Product.js");
const Service = require("../../models/shared/Service.js");
const Venue = require("../../models/shared/Venue.js");
const NewsletterSubscriber = require("../../models/shared/NewsletterSubscriber.js");
const AdminSetting = require("../../models/admin/AdminSetting.js");

const catalogueTypes = new Set(["jobs", "courses", "products", "services", "venues"]);

const DEFAULT_CATALOG_OPTIONS = {
  jobIndustries: [],
  companySizes: [],
  jobCategories: ["Software Development", "Design & Creative", "Marketing", "Sales", "Finance", "Human Resources", "Customer Support", "Education", "Healthcare", "Engineering", "Other"],
  jobTypes: ["Full-time", "Part-time", "Contract", "Internship", "Freelance"],
  experienceLevels: ["Junior", "Mid-Level", "Senior", "Lead/Executive"],
};

exports.getCatalogOptions = async (_req, res) => {
  try {
    const settings = await AdminSetting.findOne({ key: "platform" }).lean();
    const configured = settings?.catalogFilters || {};
    const data = Object.fromEntries(Object.entries(DEFAULT_CATALOG_OPTIONS).map(([key, fallback]) => [
      key,
      Array.isArray(configured[key]) && configured[key].length ? configured[key] : fallback,
    ]));
    return res.json({ success: true, data });
  } catch (error) {
    console.error("getCatalogOptions error:", error);
    return res.status(500).json({ success: false, message: "Unable to load catalogue options." });
  }
};

const imageFrom = (...values) => values.flat().find((value) => typeof value === "string" && value.trim()) || "";

const normaliseJob = (job) => ({
  id: String(job._id),
  title: job.jobTitle,
  category: job.jobCategory,
  type: job.jobType,
  level: job.experienceLevel,
  location: job.location,
  salaryMin: job.salaryMin,
  salaryMax: job.salaryMax,
  currency: job.salaryCurrency === "INR" ? "₹" : job.salaryCurrency,
  skills: job.skills || [],
  company: job.recruiterId?.companyName || "Bandhan partner",
  image: job.recruiterId?.companyLogo || "",
  description: job.aboutRole || "Explore this opportunity through Bandhan Careers.",
});

const normaliseCourse = (course) => ({
  id: String(course._id),
  title: course.title,
  category: course.category,
  level: course.level,
  image: imageFrom(course.thumbnail, course.image),
  price: Number(course.pricing?.finalPrice ?? course.pricing?.basePrice ?? 0),
  rating: Number(course.rating || 0),
  instructor: course.instructorId?.fullName || "Bandhan instructor",
  description: course.description || course.subtitle || "Learn with an expert-led Bandhan course.",
  skills: course.skills || [],
});

const normaliseProduct = (product) => ({
  id: String(product._id),
  title: product.title,
  category: product.category,
  subCategory: product.subCategory,
  productType: product.productType,
  image: imageFrom(product.images),
  images: Array.isArray(product.images) ? product.images : [],
  price: Number(product.discountPrice || product.price || 0),
  salePrice: Number(product.discountPrice || product.price || 0),
  rentalPrice: Number(product.rentalPrice || product.rentPrice || 0),
  rentalDuration: product.rentalDuration,
  rating: Number(product.rating || 0),
  reviewCount: Number(product.reviewCount || 0),
  location: product.location || "",
  company: product.sellerName || "Bandhan seller",
  sellerName: product.sellerName || "Bandhan seller",
  description: product.description || "Available through the Bandhan marketplace.",
  stockStatus: product.stockStatus,
  soldCount: Number(product.orders || product.soldCount || 0),
  shippingRequired: product.shippingRequired,
  shippingCost: Number(product.shippingCost || 0),
  freeShipping: product.freeShipping,
  returnPolicy: product.returnPolicy,
  warranty: product.warranty,
  brand: product.brand,
  sku: product.sku,
  specifications: Array.isArray(product.specifications) ? product.specifications : [],
});

const normaliseService = (service) => ({
  id: String(service._id),
  title: service.title,
  category: service.category,
  image: imageFrom(service.image, service.images),
  price: Number(service.price || 0),
  rating: Number(service.rating || 0),
  location: service.location || "",
  guests: Number(service.maxGuests || service.guests || 0),
  company: service.sellerName || "Bandhan service partner",
  description: service.description || "Request a tailored quote from this Bandhan partner.",
});

const normaliseVenue = (venue) => ({
  id: String(venue._id),
  title: venue.name,
  category: "Venue",
  image: imageFrom(venue.images),
  price: Number(venue.pricePerDay || 0),
  rating: Number(venue.rating || 0),
  location: venue.location || "",
  guests: Number(venue.guests || 0),
  description: venue.description || "Book this venue through Bandhan.",
});

const definitions = {
  jobs: {
    model: Job,
    filter: { status: "active", isPublished: true },
    populate: { path: "recruiterId", select: "companyName companyLogo" },
    sort: { createdAt: -1 },
    map: normaliseJob,
  },
  courses: {
    model: Course,
    filter: { status: "published", visibility: "public" },
    populate: { path: "instructorId", select: "fullName profilePhoto" },
    sort: { createdAt: -1 },
    map: normaliseCourse,
  },
  products: {
    model: Product,
    filter: { status: "active", isPublished: true, isApproved: true },
    sort: { isFeatured: -1, createdAt: -1 },
    map: normaliseProduct,
  },
  services: {
    model: Service,
    filter: { isActive: true, status: "active" },
    sort: { isFeatured: -1, createdAt: -1 },
    map: normaliseService,
  },
  venues: {
    model: Venue,
    // Legacy seeded venues predate moderation fields. Allow missing values,
    // but never expose a venue explicitly saved as draft/inactive/unapproved.
    filter: { status: { $in: ["active", null] }, isApproved: { $ne: false } },
    sort: { createdAt: -1 },
    map: normaliseVenue,
  },
};

function catalogueDefinition(type) {
  return catalogueTypes.has(type) ? definitions[type] : null;
}

const escapedPattern = (value) => new RegExp(String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

function productAvailabilityFilter(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "rent" || normalized === "rental") return ["rent", "rental", "both"];
  if (normalized === "sale") return ["sale", "both"];
  if (normalized === "both") return ["both"];
  return undefined;
}

function catalogueFilter(type, definition, params) {
  const filter = { ...definition.filter };
  const q = String(params.q || "").trim();
  const category = String(params.category || "").trim();
  const location = String(params.location || "").trim();
  const level = String(params.level || "").trim();

  const searchableFields = {
    jobs: ["jobTitle", "jobCategory", "location", "skills", "aboutRole"],
    courses: ["title", "subtitle", "description", "category", "skills"],
    products: ["title", "description", "category", "subCategory", "brand", "tags"],
    services: ["title", "description", "category", "location", "eventType"],
    venues: ["name", "description", "venueType", "location", "facilities"],
  };
  if (q) {
    const pattern = escapedPattern(q);
    filter.$or = searchableFields[type].map((field) => ({ [field]: pattern }));
  }

  if (category) {
    const categoryField = type === "jobs" ? "jobCategory" : type === "venues" ? "venueType" : "category";
    filter[categoryField] = category;
  }
  if (location && ["jobs", "products", "services", "venues"].includes(type)) {
    filter.location = escapedPattern(location);
  }
  if (level && type === "jobs") filter.experienceLevel = level;
  if (level && type === "courses") filter.level = level;
  if (params.jobType && type === "jobs") filter.jobType = String(params.jobType);
  if (params.productType && type === "products") {
    const allowedProductTypes = productAvailabilityFilter(params.productType);
    if (allowedProductTypes) {
      filter.$expr = {
        $in: [
          { $toLower: { $ifNull: ["$productType", ""] } },
          allowedProductTypes,
        ],
      };
    }
  }
  if (params.exclude && type === "products") {
    filter._id = { $ne: params.exclude };
  }

  const minPrice = Number(params.minPrice);
  const maxPrice = Number(params.maxPrice);
  const priceField = type === "venues" ? "pricePerDay" : "price";
  if (["products", "services", "venues"].includes(type) && (Number.isFinite(minPrice) || Number.isFinite(maxPrice))) {
    filter[priceField] = {};
    if (Number.isFinite(minPrice)) filter[priceField].$gte = minPrice;
    if (Number.isFinite(maxPrice)) filter[priceField].$lte = maxPrice;
  }

  return filter;
}

exports.getLandingCatalogue = async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 6, 1), 24);
    const data = {};

    await Promise.all(Object.entries(definitions).map(async ([type, definition]) => {
      let query = definition.model.find(definition.filter).sort(definition.sort).limit(limit);
      if (definition.populate) query = query.populate(definition.populate);
      const records = await query.lean();
      data[type] = records.map(definition.map);
    }));

    return res.json({ success: true, data });
  } catch (error) {
    console.error("getLandingCatalogue error:", error);
    return res.status(500).json({ success: false, message: "Unable to load the landing catalogue." });
  }
};

exports.getPublicCatalogue = async (req, res) => {
  try {
    const definition = catalogueDefinition(req.params.type);
    if (!definition) return res.status(404).json({ success: false, message: "Unknown catalogue type." });

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 48);
    const filter = catalogueFilter(req.params.type, definition, req.query);
    const [total, records] = await Promise.all([
      definition.model.countDocuments(filter),
      (() => {
        let query = definition.model.find(filter).sort(definition.sort).skip((page - 1) * limit).limit(limit);
        if (definition.populate) query = query.populate(definition.populate);
        return query.lean();
      })(),
    ]);

    return res.json({
      success: true,
      data: records.map(definition.map),
      pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
    });
  } catch (error) {
    console.error("getPublicCatalogue error:", error);
    return res.status(500).json({ success: false, message: "Unable to load catalogue listings." });
  }
};

exports.getPublicCatalogueDetail = async (req, res) => {
  try {
    const definition = catalogueDefinition(req.params.type);
    if (!definition) return res.status(404).json({ success: false, message: "Unknown catalogue type." });

    const filter = catalogueFilter(req.params.type, definition, req.query);
    let query = definition.model.findOne({ ...filter, _id: req.params.id });
    if (definition.populate) query = query.populate(definition.populate);
    const record = await query.lean();
    if (!record) return res.status(404).json({ success: false, message: "Listing not found." });

    return res.json({ success: true, data: definition.map(record) });
  } catch (error) {
    return res.status(404).json({ success: false, message: "Listing not found." });
  }
};

exports.searchMarketplace = async (req, res) => {
  try {
    const query = String(req.query.q || "").trim();
    const type = String(req.query.type || "all").toLowerCase();
    const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 24);
    const matcher = query ? { $regex: query, $options: "i" } : null;
    const match = (fields) => matcher ? { $or: fields.map((field) => ({ [field]: matcher })) } : {};
    const result = {};
    if (type === "all" || type === "products") result.products = (await Product.find({ status: "active", isPublished: true, isApproved: true, ...match(["title", "category", "description", "tags"]) }).limit(limit).lean()).map(normaliseProduct);
    if (type === "all" || type === "services") result.services = (await Service.find({ isActive: true, status: "active", ...match(["title", "category", "description", "location"]) }).limit(limit).lean()).map(normaliseService);
    if (type === "all" || type === "venues") result.venues = (await Venue.find({ status: { $in: ["active", null] }, isApproved: { $ne: false }, ...match(["name", "venueType", "description", "location"]) }).limit(limit).lean()).map(normaliseVenue);
    return res.json({ success: true, query, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to search marketplace." });
  }
};

exports.subscribeNewsletter = async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!validEmail || email.length > 254) {
      return res.status(400).json({ success: false, message: "Enter a valid email address." });
    }

    const subscriber = await NewsletterSubscriber.findOneAndUpdate(
      { email },
      {
        $set: {
          status: "active",
          source: "customer-home",
          consentAt: new Date(),
          unsubscribedAt: null,
        },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "You are subscribed to Bandhan updates.",
      data: { email: subscriber.email, status: subscriber.status },
    });
  } catch (error) {
    console.error("subscribeNewsletter error:", error);
    return res.status(500).json({ success: false, message: "Unable to subscribe right now." });
  }
};

exports.getPublicJobs = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;

    const filter = { status: "active", isPublished: true };

    const total = await Job.countDocuments(filter);
    const jobs = await Job.find(filter)
      .populate("recruiterId", "companyName companyLogo industry")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const formatted = jobs.map((job) => {
      const o = job.toObject();
      return {
        _id: o._id,
        jobTitle: o.jobTitle,
        jobCategory: o.jobCategory,
        jobType: o.jobType,
        experienceLevel: o.experienceLevel,
        salaryMin: o.salaryMin,
        salaryMax: o.salaryMax,
        salaryCurrency: o.salaryCurrency,
        location: o.location,
        remoteAvailable: o.remoteAvailable,
        skills: o.skills?.slice(0, 5),
        openings: o.openings,
        totalApplicants: o.totalApplicants,
        company: o.recruiterId,
        createdAt: o.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      totalJobs: total,
      jobs: formatted,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("getPublicJobs error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

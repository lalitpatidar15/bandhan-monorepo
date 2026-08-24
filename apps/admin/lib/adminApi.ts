import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

function logout() {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  if (typeof window !== 'undefined') {
    const returnTo = `${window.location.pathname}${window.location.search}`;
    window.location.href = `/admin/login?next=${encodeURIComponent(returnTo)}`;
  }
}

const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://bandhan-backend-gykw.onrender.com';
const baseUrl = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl.replace(/\/$/, '')}/api`;

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('adminToken');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

const baseQueryWithLogout: typeof rawBaseQuery = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error && 'status' in result.error && result.error.status === 401) {
    logout();
  }
  return result;
};

export type AdminSettings = {
  version?: number;
  platformName: string;
  supportEmail: string;
  supportPhone: string;
  maxUploadSize: number;
  maintenanceMode: boolean;
  emailNotifications: boolean;
  twoFactorAuth: boolean;
  apiRateLimit: number;
  jobPostingFee?: number;
  serviceFee?: number;
  taxRate?: number;
  platformFee?: number;
  gstRate?: number;
  defaultCurrency?: string;
  jwtExpiry?: string;
  otpExpiryMinutes?: number;
  paginationLimit?: number;
  rentalReturnWindowHours?: number;
  defaultReturnPolicy?: string;
  catalogFilters?: {
    productModes?: string[];
    venueTypes?: string[];
    serviceTypes?: string[];
    jobIndustries?: string[];
    companySizes?: string[];
    courseLevels?: string[];
    eventTypes?: string[];
    jobCategories?: string[];
    jobTypes?: string[];
    experienceLevels?: string[];
    courseCategories?: string[];
    ratingSteps?: number[];
    sortOptions?: { value: string; label: string }[];
  };
};

export type AdminSettingsHistoryEntry = { version: number; changedAt: string; changes: Record<string, { from: unknown; to: unknown }> };

export type AdminLoginResponse = {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: string;
    username: string;
    role: string;
    email: string;
  };
};

export type DashboardStats = {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalVenues?: number;
  revenue: number;
  activeUsers: number;
  monthlyChange?: {
    users?: number;
    orders?: number;
    revenue?: number;
  };
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
};

export type AdminProduct = {
  id: string;
  title: string;
  images?: string[];
  description?: string;
  category: string;
  price: number;
  status: 'active' | 'inactive';
  isApproved: boolean;
  isPublished: boolean;
  vendor: string;
  vendorId?: string;
  rating: number;
  reviewCount: number;
  totalOrders: number;
  shippingRequired: boolean;
  shippingWeight?: number;
  shippingCost: number;
  freeShipping: boolean;
  dimensions?: { length?: number; width?: number; height?: number };
};

export type AdminShipment = {
  status: string;
  awbCode?: string;
  courierName?: string;
  labelUrl?: string;
  trackingUrl?: string;
  shipmentId?: number;
};

export type AdminOrder = {
  id: string;
  orderNumber: string;
  customer: string;
  items: string;
  type: 'product' | 'service' | 'rental' | 'other';
  amount: number;
  paymentStatus: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  date: string;
  shipping?: AdminShipment | null;
};

export type AnalyticsStats = {
  totalBookings?: number;
  averageOrderValue?: number;
  ratingAverage?: number;
  usersByPanel?: Array<{ name: string; value: number }>;
};

export type AdminStudent = {
  id: string;
  name: string;
  email: string;
  phone: string;
  experienceLevel: string;
  accountStatus: string;
  enrolledCount: number;
  createdAt: string;
};

export type AdminInstructor = {
  id: string;
  name: string;
  email: string;
  headline: string;
  accountStatus: string;
  isVerified: boolean;
  profileCompletion: number;
  createdAt: string;
};

export type AdminCourse = {
  id: string;
  title: string;
  category: string;
  level: string;
  status: string;
  visibility: string;
  price: number;
  totalStudents: number;
  rating: number;
  instructor: string;
};

export type AdminEnrollment = {
  id: string;
  student: string;
  studentEmail: string;
  course: string;
  category: string;
  progressPercentage: number;
  status: string;
  lastAccessedAt: string;
};

export type AdminJobSeeker = {
  id: string;
  name: string;
  email: string;
  phone: string;
  currentRole: string;
  experienceLevel: string;
  location: string;
};

export type AdminJobPoster = {
  id: string;
  companyName: string;
  companyEmail: string;
  industry: string;
  companySize: string;
  profileCompleted: boolean;
  websiteUrl: string;
};

export type AdminModerationJob = {
  id: string;
  title: string;
  category: string;
  status: string;
  isFeatured: boolean;
  promotionStatus: string;
  featuredPlan: string;
  recruiterName: string;
  recruiterEmail: string;
  createdAt: string;
};

export type AdminModerationProduct = {
  id: string;
  title: string;
  category: string;
  status: string;
  isFeatured: boolean;
  sellerName: string;
  sellerEmail: string;
  createdAt: string;
};

export type AdminModerationPost = {
  id: string;
  content: string;
  image: string;
  video: string;
  authorName: string;
  authorEmail: string;
  createdAt: string;
};

export type AdminRolePermission = {
  id: string;
  role: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
};

export type AdminCategory = {
  id: string;
  name: string;
  subcategories: string[];
  scopes?: string[];
  isActive: boolean;
};

export type AdminCommissionRule = {
  id: string;
  category: string;
  type: 'fixed' | 'percentage';
  value: number;
  isActive: boolean;
};

export type AdminDispute = {
  id: string;
  title: string;
  type: string;
  status: string;
  raisedBy: string;
  referenceId: string;
  createdAt: string;
  resolution?: string;
};

export type AdminSupportTicket = {
  id: string;
  subject: string;
  status: string;
  priority: string;
  requester: string;
  assignedTo?: string;
  createdAt: string;
};

export type AdminFeaturedListings = {
  products: Array<{ _id: string; title: string; category: string; createdAt: string }>;
  jobs: Array<{ _id: string; jobTitle: string; jobCategory: string; createdAt: string }>;
  courses: Array<{ _id: string; title: string; category: string; createdAt: string }>;
};

export type AdminBlog = {
  id: string;
  title: string;
  content: string;
  category: string;
  status: string;
  featured: boolean;
  createdAt: string;
  seoTitle: string;
  seoDescription: string;
  seoTags: string[];
};

export type AdminBanner = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  buttonText: string;
  createdAt: string;
};

export type AdminRentalOrder = {
  id: string;
  rentalId: string;
  customerName: string;
  sellerName: string;
  productTitle: string;
  rentalStart: string;
  rentalEnd: string;
  rentalDurationDays: number;
  dailyRate: number;
  subtotal: number;
  securityDeposit: number;
  totalAmount: number;
  rentalStatus: string;
  paymentStatus: string;
  createdAt: string;
};

export type AdminCoupon = {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
};

export type AdminAuditLog = {
  id: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  status: string;
  details: string;
  ipAddress: string;
  createdAt: string;
};

export type AdminSettlement = {
  id: string;
  sellerName: string;
  period: string;
  totalSales: number;
  commissionDeducted: number;
  netPayable: number;
  orderCount: number;
  status: string;
  paidAt: string;
  createdAt: string;
};

export type AdminMerchant = {
  id: string;
  companyName: string;
  email: string;
  phone: string;
  totalProducts: number;
  totalOrders: number;
  revenue: number;
  status: string;
  createdAt: string;
};

export type AdminSellerDetailed = {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  accountStatus: string;
  totalProducts: number;
  totalSales: number;
  totalOrders: number;
  revenue: number;
  avgRating: number;
  reviewCount: number;
  createdAt: string;
};

export type AdminSellerReview = {
  _id: string;
  rating: number;
  title: string;
  comment: string;
  customerName: string;
  productName: string;
  sellerReply: string;
  source: string;
  createdAt: string;
};

export type AdminInstructorDetailed = {
  _id: string;
  fullName: string;
  email: string;
  headline: string;
  profilePhoto: string;
  bio: string;
  expertiseTags: string[];
  languages: string[];
  linkedin: string;
  portfolio: string;
  website: string;
  experience: Array<{ title: string; company: string; years: string }>;
  accountStatus: string;
  isVerified: boolean;
  isEmailVerified: boolean;
  profileCompletion: number;
  documentCompletion: number;
  isDocumentSubmitted: boolean;
  verificationStatus: { aadhaar?: string; pan?: string; academicDegree?: string; professionalCertificate?: string; overall?: string };
  verificationDate: string;
  rejectionReason: string;
  lastLogin: string;
  totalCourses: number;
  totalStudents: number;
  avgRating: number;
  reviewCount: number;
  createdAt: string;
};

export type AdminInstructorReview = {
  _id: string;
  rating: number;
  review: string;
  courseName: string;
  studentName: string;
  instructorResponse: string;
  createdAt: string;
};

export type AdminJobPosterDetailed = {
  _id: string;
  companyName: string;
  companyEmail: string;
  industry: string;
  companySize: string;
  profileCompleted: boolean;
  websiteUrl: string;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  createdAt: string;
};

export type AdminJobPosterJob = {
  _id: string;
  jobTitle: string;
  jobCategory: string;
  location: string;
  salary: string;
  status: string;
  isFeatured: boolean;
  applicantCount: number;
  createdAt: string;
};

export type AdminVenue = {
  _id: string;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  guests: number;
  images: string[];
  description: string;
  pricePerDay: number;
  serviceFee: number;
  createdAt: string;
};

export type AdminService = {
  _id: string;
  sellerId: string;
  sellerEmail: string;
  title: string;
  category: 'venue' | 'catering' | 'decor';
  price: number;
  description: string;
  location: string;
  eventType: string;
  images: string[];
  status: 'active' | 'draft';
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
};

export type AdminJob = {
  id: string;
  jobTitle: string;
  jobCategory: string;
  companyName: string;
  location: string;
  salary: string;
  status: string;
  applicantCount: number;
  createdAt: string;
};

export type AdminApplication = {
  id: string;
  jobTitle: string;
  applicantName: string;
  applicantEmail: string;
  status: string;
  appliedAt: string;
  resumeUrl: string;
};

const normalizeUsers = (payload: unknown): AdminUser[] => {
  const records = Array.isArray((payload as { data?: unknown[] })?.data)
    ? (payload as { data: Array<Record<string, unknown>> }).data
    : Array.isArray(payload)
      ? (payload as Array<Record<string, unknown>>)
      : [];

  return records.map((user) => ({
    id: String(user._id || user.id || ''),
    name: String(user.fullName || user.name || 'Unknown User'),
    email: String(user.email || ''),
    role: String(user.role || 'user'),
    status: user.status === 'inactive' ? 'inactive' : 'active',
    createdAt: String(user.createdAt || ''),
  }));
};

const normalizeProducts = (payload: unknown): AdminProduct[] => {
  const records = Array.isArray((payload as { data?: unknown[] })?.data)
    ? (payload as { data: Array<Record<string, unknown>> }).data
    : Array.isArray(payload)
      ? (payload as Array<Record<string, unknown>>)
      : [];

  return records.map((product) => {
    const vendorObject = (product.sellerId || product.userId) as { _id?: string; fullName?: string } | undefined;

    return {
      id: String(product._id || product.id || ''),
      title: String(product.title || product.name || 'Untitled Product'),
      images: Array.isArray(product.images) ? product.images.filter((image): image is string => typeof image === 'string') : [],
      description: String(product.description || ''),
      category: String(product.category || 'Uncategorized'),
      price: Number(product.price || 0),
      status: product.status === 'draft' || product.status === 'inactive' ? 'inactive' : 'active',
      isApproved: Boolean(product.isApproved),
      isPublished: Boolean(product.isPublished),
      vendor: String(vendorObject?.fullName || product.vendor || 'Unknown Vendor'),
      vendorId: String(vendorObject?._id || product.sellerId || product.userId || ''),
      rating: Number(product.rating || 0),
      reviewCount: Number(product.reviewCount || 0),
      totalOrders: Number(product.orders || 0),
      shippingRequired: product.shippingRequired !== false,
      shippingWeight: Number(product.shippingWeight || product.weight || 0) || undefined,
      shippingCost: Number(product.shippingCost || 0),
      freeShipping: Boolean(product.freeShipping),
      dimensions: typeof product.dimensions === 'object' && product.dimensions ? product.dimensions as AdminProduct['dimensions'] : undefined,
    };
  });
};

const itemLabel = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (!Array.isArray(value)) return '';
  return value.map((item) => {
    if (typeof item === 'string') return item;
    if (!item || typeof item !== 'object') return '';
    const record = item as Record<string, unknown>;
    return String(record.title || record.productName || record.name || record.service || 'Unnamed item');
  }).filter(Boolean).join(', ');
};

const normalizeOrders = (payload: unknown): AdminOrder[] => {
  const records = Array.isArray((payload as { data?: unknown[] })?.data)
    ? (payload as { data: Array<Record<string, unknown>> }).data
    : Array.isArray(payload)
      ? (payload as Array<Record<string, unknown>>)
      : [];

  return records.map((order) => ({
    id: String(order._id || order.id || ''),
    orderNumber: String(order.orderId || order.orderNumber || order._id || ''),
    customer: String(order.customerName || order.customer || 'Unknown Customer'),
    items: String(order.productName || order.service || itemLabel(order.items) || 'No items listed'),
    type: String(Array.isArray(order.items) && order.items[0] && typeof order.items[0] === 'object' ? (order.items[0] as Record<string, unknown>).itemType || 'product' : 'other') as AdminOrder['type'],
    amount: Number(order.amount || 0),
    paymentStatus: String(order.paymentStatus || 'pending'),
    status: (order.status || order.orderStatus || 'pending') as AdminOrder['status'],
    date: typeof order.createdAt === 'string' ? new Date(order.createdAt).toLocaleDateString() : '',
    shipping: (order.shipping || null) as AdminShipment | null,
  }));
};

const normalizeStudents = (payload: unknown): AdminStudent[] => {
  const records = Array.isArray((payload as { data?: unknown[] })?.data)
    ? (payload as { data: Array<Record<string, unknown>> }).data
    : [];

  return records.map((student) => ({
    id: String(student._id || ''),
    name: String(student.fullName || 'Unknown Student'),
    email: String(student.email || ''),
    phone: String(student.phone || ''),
    experienceLevel: String(student.experienceLevel || 'Fresher'),
    accountStatus: String(student.accountStatus || 'active'),
    enrolledCount: Array.isArray(student.enrolledCourses) ? student.enrolledCourses.length : 0,
    createdAt: String(student.createdAt || ''),
  }));
};

const normalizeInstructors = (payload: unknown): AdminInstructor[] => {
  const records = Array.isArray((payload as { data?: unknown[] })?.data)
    ? (payload as { data: Array<Record<string, unknown>> }).data
    : [];

  return records.map((instructor) => ({
    id: String(instructor._id || ''),
    name: String(instructor.fullName || 'Unknown Instructor'),
    email: String(instructor.email || ''),
    headline: String(instructor.headline || ''),
    accountStatus: String(instructor.accountStatus || 'pending'),
    isVerified: Boolean(instructor.isVerified),
    profileCompletion: Number(instructor.profileCompletion || 0),
    createdAt: String(instructor.createdAt || ''),
  }));
};

const normalizeCourses = (payload: unknown): AdminCourse[] => {
  const records = Array.isArray((payload as { data?: unknown[] })?.data)
    ? (payload as { data: Array<Record<string, unknown>> }).data
    : [];

  return records.map((course) => {
    const instructor = course.instructorId as { fullName?: string } | undefined;
    return {
      id: String(course._id || ''),
      title: String(course.title || 'Untitled Course'),
      category: String(course.category || 'Uncategorized'),
      level: String(course.level || 'Unknown'),
      status: String(course.status || 'draft'),
      visibility: String(course.visibility || 'draft'),
      price: Number(course.price || 0),
      totalStudents: Number(course.totalStudents || 0),
      rating: Number(course.rating || 0),
      instructor: String(instructor?.fullName || 'Unknown Instructor'),
    };
  });
};

const normalizeEnrollments = (payload: unknown): AdminEnrollment[] => {
  const records = Array.isArray((payload as { data?: unknown[] })?.data)
    ? (payload as { data: Array<Record<string, unknown>> }).data
    : [];

  return records.map((enrollment) => {
    const student = enrollment.studentId as { fullName?: string; email?: string } | undefined;
    const course = enrollment.courseId as { title?: string; category?: string } | undefined;
    return {
      id: String(enrollment._id || ''),
      student: String(student?.fullName || 'Unknown Student'),
      studentEmail: String(student?.email || ''),
      course: String(course?.title || 'Untitled Course'),
      category: String(course?.category || 'Uncategorized'),
      progressPercentage: Number(enrollment.progressPercentage || 0),
      status: String(enrollment.status || 'active'),
      lastAccessedAt: String(enrollment.lastAccessedAt || enrollment.createdAt || ''),
    };
  });
};

const normalizeJobSeekers = (payload: unknown): AdminJobSeeker[] => {
  const records = Array.isArray((payload as { data?: unknown[] })?.data)
    ? (payload as { data: Array<Record<string, unknown>> }).data
    : [];

  return records.map((seeker) => ({
    id: String(seeker._id || ''),
    name: String(seeker.fullName || 'Unknown Job Seeker'),
    email: String(seeker.email || ''),
    phone: String(seeker.phone || ''),
    currentRole: String(seeker.currentRole || 'Not set'),
    experienceLevel: String(seeker.experienceLevel || 'Not set'),
    location: String(seeker.location || 'Unknown'),
  }));
};

const normalizeJobPosters = (payload: unknown): AdminJobPoster[] => {
  const records = Array.isArray((payload as { data?: unknown[] })?.data)
    ? (payload as { data: Array<Record<string, unknown>> }).data
    : [];

  return records.map((poster) => ({
    id: String(poster._id || ''),
    companyName: String(poster.companyName || 'Unknown Company'),
    companyEmail: String(poster.companyEmail || ''),
    industry: String(poster.industry || 'Unknown'),
    companySize: String(poster.companySize || 'Unknown'),
    profileCompleted: Boolean(poster.profileCompleted),
    websiteUrl: String(poster.websiteUrl || ''),
  }));
};

const normalizeModerationJobs = (payload: unknown): AdminModerationJob[] => {
  const records = Array.isArray((payload as { data?: unknown[] })?.data)
    ? (payload as { data: Array<Record<string, unknown>> }).data
    : [];

  return records.map((job) => {
    const recruiter = (job.recruiterId || {}) as { companyName?: string; companyEmail?: string };
    return {
      id: String(job._id || ''),
      title: String(job.jobTitle || 'Untitled Job'),
      category: String(job.jobCategory || 'Uncategorized'),
      status: String(job.status || 'draft'),
      isFeatured: Boolean(job.isFeatured),
      promotionStatus: String(job.promotionStatus || 'none'),
      featuredPlan: String(job.featuredPlan || ''),
      recruiterName: String(recruiter.companyName || 'Unknown Recruiter'),
      recruiterEmail: String(recruiter.companyEmail || ''),
      createdAt: String(job.createdAt || ''),
    };
  });
};

const normalizeModerationProducts = (payload: unknown): AdminModerationProduct[] => {
  const records = Array.isArray((payload as { data?: unknown[] })?.data)
    ? (payload as { data: Array<Record<string, unknown>> }).data
    : [];

  return records.map((product) => {
    const seller = (product.userId || {}) as { fullName?: string; email?: string };
    return {
      id: String(product._id || ''),
      title: String(product.title || product.name || 'Untitled Product'),
      category: String(product.category || 'Uncategorized'),
      status: String(product.status || 'draft'),
      isFeatured: Boolean(product.isFeatured),
      sellerName: String(seller.fullName || 'Unknown Seller'),
      sellerEmail: String(seller.email || ''),
      createdAt: String(product.createdAt || ''),
    };
  });
};

const normalizeModerationPosts = (payload: unknown): AdminModerationPost[] => {
  const records = Array.isArray((payload as { data?: unknown[] })?.data)
    ? (payload as { data: Array<Record<string, unknown>> }).data
    : [];

  return records.map((post) => {
    const author = (post.userId || {}) as { fullName?: string; email?: string };
    return {
      id: String(post._id || ''),
      content: String(post.content || ''),
      image: String(post.image || ''),
      video: String(post.video || ''),
      authorName: String(author.fullName || 'Unknown Author'),
      authorEmail: String(author.email || ''),
      createdAt: String(post.createdAt || ''),
    };
  });
};

const normalizeRolePermissions = (payload: unknown): AdminRolePermission[] => {
  const records = Array.isArray((payload as { data?: unknown[] })?.data)
    ? (payload as { data: Array<Record<string, unknown>> }).data
    : [];

  return records.map((role) => ({
    id: String(role._id || ''),
    role: String(role.role || ''),
    description: String(role.description || ''),
    permissions: Array.isArray(role.permissions) ? role.permissions.map((item) => String(item)) : [],
    isSystem: Boolean(role.isSystem),
  }));
};

const normalizeCategories = (payload: unknown): AdminCategory[] => {
  const records = Array.isArray((payload as { data?: unknown[] })?.data)
    ? (payload as { data: Array<Record<string, unknown>> }).data
    : [];

  return records.map((category) => ({
    id: String(category.id || category._id || ''),
    name: String(category.name || 'Unnamed Category'),
    subcategories: Array.isArray(category.subcategories)
      ? category.subcategories.map((item) => String(item))
      : [],
    isActive: category.isActive !== false,
  }));
};

const normalizeCommissionRules = (payload: unknown): AdminCommissionRule[] => {
  const records = Array.isArray((payload as { data?: unknown[] })?.data)
    ? (payload as { data: Array<Record<string, unknown>> }).data
    : [];

  return records.map((rule) => ({
    id: String(rule.id || rule._id || ''),
    category: String(rule.category || 'Unknown'),
    type: rule.type === 'fixed' ? 'fixed' : 'percentage',
    value: Number(rule.value || 0),
    isActive: rule.isActive !== false,
  }));
};

const normalizeDisputes = (payload: unknown): AdminDispute[] => {
  const records = Array.isArray((payload as { data?: unknown[] })?.data)
    ? (payload as { data: Array<Record<string, unknown>> }).data
    : [];

  return records.map((dispute) => ({
    id: String(dispute.id || dispute._id || ''),
    title: String(dispute.title || 'Untitled Dispute'),
    type: String(dispute.type || 'general'),
    status: String(dispute.status || 'open'),
    raisedBy: String(dispute.raisedBy || 'unknown'),
    referenceId: String(dispute.referenceId || ''),
    createdAt: String(dispute.createdAt || ''),
    resolution: dispute.resolution ? String(dispute.resolution) : undefined,
  }));
};

const normalizeSupportTickets = (payload: unknown): AdminSupportTicket[] => {
  const records = Array.isArray((payload as { data?: unknown[] })?.data)
    ? (payload as { data: Array<Record<string, unknown>> }).data
    : [];

  return records.map((ticket) => ({
    id: String(ticket.id || ticket._id || ''),
    subject: String(ticket.subject || 'Untitled Ticket'),
    status: String(ticket.status || 'open'),
    priority: String(ticket.priority || 'medium'),
    requester: String(ticket.requester || ''),
    assignedTo: ticket.assignedTo ? String(ticket.assignedTo) : undefined,
    createdAt: String(ticket.createdAt || ''),
  }));
};

const normalizeBlogs = (payload: unknown): AdminBlog[] => {
  const records = Array.isArray((payload as { data?: unknown[] })?.data)
    ? (payload as { data: Array<Record<string, unknown>> }).data
    : [];

  return records.map((blog) => ({
    id: String(blog._id || ''),
    title: String(blog.title || ''),
    content: String(blog.content || ''),
    category: String(blog.category || ''),
    status: String(blog.status || 'draft'),
    featured: Boolean(blog.featured),
    createdAt: String(blog.createdAt || ''),
    seoTitle: String(blog.seoTitle || ''),
    seoDescription: String(blog.seoDescription || ''),
    seoTags: Array.isArray(blog.seoTags) ? blog.seoTags.map(String) : [],
  }));
};

const normalizeBanners = (payload: unknown): AdminBanner[] => {
  const records = Array.isArray((payload as { data?: unknown[] })?.data)
    ? (payload as { data: Array<Record<string, unknown>> }).data
    : [];

  return records.map((banner) => ({
    id: String(banner._id || ''),
    title: String(banner.title || ''),
    subtitle: String(banner.subtitle || ''),
    image: String(banner.image || ''),
    buttonText: String(banner.buttonText || ''),
    createdAt: String(banner.createdAt || ''),
  }));
};

const normalizeRentalOrders = (payload: unknown): AdminRentalOrder[] => {
  const records = Array.isArray((payload as { data?: unknown[] })?.data)
    ? (payload as { data: Array<Record<string, unknown>> }).data
    : [];

  return records.map((r) => {
    const user = (r.userId || {}) as { name?: string; fullName?: string };
    const seller = (r.sellerId || {}) as { name?: string; fullName?: string };
    const product = (r.productId || {}) as { title?: string };
    return {
      id: String(r._id || ''),
      rentalId: String(r.rentalId || ''),
      customerName: String(user.fullName || user.name || 'Unknown'),
      sellerName: String(seller.fullName || seller.name || 'Unknown'),
      productTitle: String(product.title || r.productTitle || 'Unknown'),
      rentalStart: String(r.rentalStart || ''),
      rentalEnd: String(r.rentalEnd || ''),
      rentalDurationDays: Number(r.rentalDurationDays || 0),
      dailyRate: Number(r.dailyRate || 0),
      subtotal: Number(r.subtotal || 0),
      securityDeposit: Number(r.securityDeposit || 0),
      totalAmount: Number(r.totalAmount || 0),
      rentalStatus: String(r.rentalStatus || 'pending_deposit'),
      paymentStatus: String(r.paymentStatus || 'pending'),
      createdAt: String(r.createdAt || ''),
    };
  });
};

const normalizeCoupons = (payload: unknown): AdminCoupon[] => {
  const records = Array.isArray((payload as { data?: unknown[] })?.data)
    ? (payload as { data: Array<Record<string, unknown>> }).data
    : [];
  return records.map((c) => ({
    id: String(c._id || ''),
    code: String(c.code || ''),
    description: String(c.description || ''),
    discountType: c.discountType === 'fixed' ? 'fixed' : 'percentage',
    discountValue: Number(c.discountValue || 0),
    minOrderAmount: Number(c.minOrderAmount || 0),
    maxDiscount: Number(c.maxDiscount || 0),
    usageLimit: Number(c.usageLimit || 0),
    usedCount: Number(c.usedCount || 0),
    isActive: c.isActive !== false,
    startDate: String(c.startDate || ''),
    endDate: String(c.endDate || ''),
    createdAt: String(c.createdAt || ''),
  }));
};

const normalizeAuditLogs = (payload: unknown): AdminAuditLog[] => {
  const records = Array.isArray((payload as { data?: unknown[] })?.data)
    ? (payload as { data: Array<Record<string, unknown>> }).data
    : [];
  return records.map((log) => {
    const user = (log.userId || {}) as { fullName?: string; email?: string };
    return {
      id: String(log._id || ''),
      userName: String(user.fullName || user.email || 'System'),
      action: String(log.action || ''),
      entity: String(log.entity || ''),
      entityId: String(log.entityId || ''),
      status: String(log.status || 'success'),
      details: String(log.details || ''),
      ipAddress: String(log.ipAddress || ''),
      createdAt: String(log.createdAt || ''),
    };
  });
};

const normalizeSettlements = (payload: unknown): AdminSettlement[] => {
  const records = Array.isArray((payload as { data?: unknown[] })?.data)
    ? (payload as { data: Array<Record<string, unknown>> }).data
    : [];
  return records.map((s) => {
    const seller = (s.sellerId || {}) as { fullName?: string; email?: string };
    return {
      id: String(s._id || ''),
      sellerName: String(seller.fullName || seller.email || 'Unknown'),
      period: String(s.period || ''),
      totalSales: Number(s.totalSales || 0),
      commissionDeducted: Number(s.commissionDeducted || 0),
      netPayable: Number(s.netPayable || 0),
      orderCount: Number(s.orderCount || 0),
      status: String(s.status || 'pending'),
      paidAt: String(s.paidAt || ''),
      createdAt: String(s.createdAt || ''),
    };
  });
};

const normalizeMerchants = (payload: unknown): AdminMerchant[] => {
  const records = Array.isArray((payload as { data?: unknown[] })?.data)
    ? (payload as { data: Array<Record<string, unknown>> }).data
    : Array.isArray(payload)
      ? (payload as Array<Record<string, unknown>>)
      : [];
  return records.map((m) => ({
    id: String(m._id || m.id || ''),
    companyName: String(m.companyName || m.fullName || m.name || 'Unknown'),
    email: String(m.email || ''),
    phone: String(m.phone || ''),
    totalProducts: Number(m.totalProducts || 0),
    totalOrders: Number(m.totalOrders || 0),
    revenue: Number(m.revenue || 0),
    status: String(m.status || m.accountStatus || 'active'),
    createdAt: String(m.createdAt || ''),
  }));
};

const normalizeSellersDetailed = (payload: unknown): AdminSellerDetailed[] => {
  const records = Array.isArray((payload as { data?: unknown[] })?.data)
    ? (payload as { data: Array<Record<string, unknown>> }).data
    : [];
  return records.map((s) => ({
    _id: String(s._id || ''),
    fullName: String(s.fullName || 'Unknown'),
    email: String(s.email || ''),
    phone: String(s.phone || ''),
    role: String(s.role || 'seller'),
    accountStatus: String(s.accountStatus || 'active'),
    totalProducts: Number(s.totalProducts || 0),
    totalSales: Number(s.totalSales || 0),
    totalOrders: Number(s.totalOrders || 0),
    revenue: Number(s.revenue || 0),
    avgRating: Number(s.avgRating || 0),
    reviewCount: Number(s.reviewCount || 0),
    createdAt: String(s.createdAt || ''),
  }));
};

const normalizeSellerReviews = (payload: unknown): AdminSellerReview[] => {
  const records = Array.isArray((payload as { data?: unknown[] })?.data)
    ? (payload as { data: Array<Record<string, unknown>> }).data
    : [];
  return records.map((r) => ({
    _id: String(r._id || ''),
    rating: Number(r.rating || 0),
    title: String(r.title || ''),
    comment: String(r.comment || ''),
    customerName: String(r.customerName || 'Anonymous'),
    productName: String(r.productName || ''),
    sellerReply: String(r.sellerReply || ''),
    source: String(r.source || ''),
    createdAt: String(r.createdAt || ''),
  }));
};

const normalizeInstructorsDetailed = (payload: unknown): AdminInstructorDetailed[] => {
  const records = Array.isArray((payload as { data?: unknown[] })?.data)
    ? (payload as { data: Array<Record<string, unknown>> }).data
    : [];
  return records.map((i) => ({
    _id: String(i._id || ''),
    fullName: String(i.fullName || 'Unknown'),
    email: String(i.email || ''),
    headline: String(i.headline || ''),
    profilePhoto: String(i.profilePhoto || ''),
    bio: String(i.bio || ''),
    expertiseTags: Array.isArray(i.expertiseTags) ? i.expertiseTags.map(String) : [],
    languages: Array.isArray(i.languages) ? i.languages.map(String) : [],
    linkedin: String(i.linkedin || ''),
    portfolio: String(i.portfolio || ''),
    website: String(i.website || ''),
    experience: Array.isArray(i.experience) ? i.experience.map((entry) => {
      const value = entry as Record<string, unknown>;
      return { title: String(value.title || ''), company: String(value.company || ''), years: String(value.years || '') };
    }) : [],
    accountStatus: String(i.accountStatus || 'pending'),
    isVerified: Boolean(i.isVerified),
    isEmailVerified: Boolean(i.isEmailVerified),
    profileCompletion: Number(i.profileCompletion || 0),
    documentCompletion: Number(i.documentCompletion || 0),
    isDocumentSubmitted: Boolean(i.isDocumentSubmitted),
    verificationStatus: typeof i.verificationStatus === 'object' && i.verificationStatus !== null
      ? i.verificationStatus as AdminInstructorDetailed['verificationStatus'] : {},
    verificationDate: String(i.verificationDate || ''),
    rejectionReason: String(i.rejectionReason || ''),
    lastLogin: String(i.lastLogin || ''),
    totalCourses: Number(i.totalCourses || 0),
    totalStudents: Number(i.totalStudents || 0),
    avgRating: Number(i.avgRating || 0),
    reviewCount: Number(i.reviewCount || 0),
    createdAt: String(i.createdAt || ''),
  }));
};

const normalizeInstructorReviews = (payload: unknown): AdminInstructorReview[] => {
  const records = Array.isArray((payload as { data?: unknown[] })?.data)
    ? (payload as { data: Array<Record<string, unknown>> }).data
    : [];
  return records.map((r) => ({
    _id: String(r._id || ''),
    rating: Number(r.rating || 0),
    review: String(r.review || ''),
    courseName: String(r.courseName || ''),
    studentName: String(r.studentName || 'Unknown'),
    instructorResponse: String(r.instructorResponse || ''),
    createdAt: String(r.createdAt || ''),
  }));
};

const normalizeJobPostersDetailed = (payload: unknown): AdminJobPosterDetailed[] => {
  const records = Array.isArray((payload as { data?: unknown[] })?.data)
    ? (payload as { data: Array<Record<string, unknown>> }).data
    : [];
  return records.map((p) => ({
    _id: String(p._id || ''),
    companyName: String(p.companyName || 'Unknown'),
    companyEmail: String(p.companyEmail || ''),
    industry: String(p.industry || ''),
    companySize: String(p.companySize || ''),
    profileCompleted: Boolean(p.profileCompleted),
    websiteUrl: String(p.websiteUrl || ''),
    totalJobs: Number(p.totalJobs || 0),
    activeJobs: Number(p.activeJobs || 0),
    totalApplications: Number(p.totalApplications || 0),
    createdAt: String(p.createdAt || ''),
  }));
};

const normalizeJobPosterJobs = (payload: unknown): AdminJobPosterJob[] => {
  const records = Array.isArray((payload as { data?: unknown[] })?.data)
    ? (payload as { data: Array<Record<string, unknown>> }).data
    : [];
  return records.map((j) => ({
    _id: String(j._id || ''),
    jobTitle: String(j.jobTitle || ''),
    jobCategory: String(j.jobCategory || ''),
    location: String(j.location || ''),
    salary: String(j.salary || ''),
    status: String(j.status || 'active'),
    isFeatured: Boolean(j.isFeatured),
    applicantCount: Number(j.applicantCount || 0),
    createdAt: String(j.createdAt || ''),
  }));
};

const normalizeVenues = (payload: unknown): AdminVenue[] => {
  const records = Array.isArray((payload as { data?: unknown[] })?.data)
    ? (payload as { data: Array<Record<string, unknown>> }).data
    : [];
  return records.map((v) => ({
    _id: String(v._id || ''),
    name: String(v.name || 'Unknown Venue'),
    location: String(v.location || ''),
    rating: Number(v.rating || 0),
    reviews: Number(v.reviews || 0),
    guests: Number(v.guests || 0),
    images: Array.isArray(v.images) ? v.images.map(String) : [],
    description: String(v.description || ''),
    pricePerDay: Number(v.pricePerDay || 0),
    serviceFee: Number(v.serviceFee || 0),
    createdAt: String(v.createdAt || ''),
  }));
};

const normalizeServices = (payload: unknown): AdminService[] => {
  const records = Array.isArray((payload as { data?: unknown[] })?.data)
    ? (payload as { data: Array<Record<string, unknown>> }).data : [];
  return records.map((service) => ({
    _id: String(service._id || ''), sellerId: String(service.sellerId || ''), sellerEmail: String(service.sellerEmail || ''),
    title: String(service.title || ''), category: (service.category || 'venue') as AdminService['category'], price: Number(service.price || 0),
    description: String(service.description || ''), location: String(service.location || ''), eventType: String(service.eventType || ''),
    images: Array.isArray(service.images) ? service.images.map(String) : [], status: service.status === 'draft' ? 'draft' : 'active',
    isActive: service.isActive !== false, isFeatured: Boolean(service.isFeatured), createdAt: String(service.createdAt || ''),
  }));
};

const normalizeJobs = (payload: unknown): AdminJob[] => {
  const records = Array.isArray((payload as { data?: unknown[] })?.data)
    ? (payload as { data: Array<Record<string, unknown>> }).data
    : Array.isArray(payload)
      ? (payload as Array<Record<string, unknown>>)
      : [];
  return records.map((j) => {
    const recruiter = (j.recruiterId || {}) as { companyName?: string };
    return {
      id: String(j._id || ''),
      jobTitle: String(j.jobTitle || j.title || ''),
      jobCategory: String(j.jobCategory || ''),
      companyName: String(recruiter?.companyName || ''),
      location: String(j.location || ''),
      salary: String(j.salary || ''),
      status: String(j.status || 'active'),
      applicantCount: Number(j.applicantCount || 0),
      createdAt: String(j.createdAt || ''),
    };
  });
};

const normalizeApplications = (payload: unknown): AdminApplication[] => {
  const records = Array.isArray((payload as { data?: unknown[] })?.data)
    ? (payload as { data: Array<Record<string, unknown>> }).data
    : Array.isArray(payload)
      ? (payload as Array<Record<string, unknown>>)
      : [];
  return records.map((a) => {
    const job = (a.jobId || {}) as { jobTitle?: string };
    const seeker = (a.jobSeekerId || a.seekerId || {}) as { fullName?: string; email?: string };
    return {
      id: String(a._id || ''),
      jobTitle: String(job.jobTitle || a.jobTitle || ''),
      applicantName: String(seeker.fullName || a.applicantName || ''),
      applicantEmail: String(seeker.email || a.applicantEmail || ''),
      status: String(a.status || 'pending'),
      appliedAt: String(a.createdAt || a.appliedAt || ''),
      resumeUrl: String(a.resumeUrl || a.resume || ''),
    };
  });
};

export const adminApi = createApi({
  reducerPath: 'adminApi',
  tagTypes: [
    'AdminSettings',
    'AdminDashboard',
    'AdminUsers',
    'AdminProducts',
    'AdminOrders',
    'AdminAnalytics',
    'AdminStudents',
    'AdminInstructors',
    'AdminCourses',
    'AdminEnrollments',
    'AdminJobSeekers',
    'AdminJobPosters',
    'AdminModeration',
    'AdminContentModeration',
    'AdminCategories',
    'AdminCommissions',
    'AdminFeaturedListings',
    'AdminDisputes',
    'AdminSupportTickets',
    'AdminRolesPermissions',
    'AdminBlogs',
    'AdminBanners',
    'AdminRentalOrders',
    'AdminCoupons',
    'AdminAuditLogs',
    'AdminSettlements',
    'AdminMerchants',
    'AdminJobs',
    'AdminApplications',
    'AdminSellersDetailed',
    'AdminInstructorsDetailed',
    'AdminJobPostersDetailed',
    'AdminVenues',
    'AdminServices',
  ],
  baseQuery: baseQueryWithLogout,
  endpoints: (builder) => ({
    login: builder.mutation<AdminLoginResponse, { username: string; password: string }>({
      query: (body) => ({
        url: '/auth/admin-login',
        method: 'POST',
        body,
      }),
    }),
    getDashboardStats: builder.query<{ success: boolean; data: DashboardStats }, void>({
      query: () => '/admin/dashboard/stats',
      providesTags: ['AdminDashboard'],
    }),
    getUsers: builder.query<AdminUser[], void>({
      query: () => '/admin/users',
      transformResponse: (response: unknown) => normalizeUsers(response),
      providesTags: ['AdminUsers'],
    }),
    createUser: builder.mutation<unknown, { fullName: string; email: string; phone?: string; role: string; status: string }>({
      query: (body) => ({ url: '/admin/users', method: 'POST', body }),
      invalidatesTags: ['AdminUsers', 'AdminDashboard'],
    }),
    updateUser: builder.mutation<unknown, { id: string; fullName: string; email: string; phone?: string; role: string; status: string }>({
      query: ({ id, ...body }) => ({ url: `/admin/users/${id}`, method: 'PUT', body }),
      invalidatesTags: ['AdminUsers', 'AdminDashboard'],
    }),
    deleteUser: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/admin/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AdminUsers', 'AdminDashboard'],
    }),
    getProducts: builder.query<AdminProduct[], { limit?: number } | void>({
      query: (params) => ({ url: '/admin/products', params: params || undefined }),
      transformResponse: (response: unknown) => normalizeProducts(response),
      providesTags: ['AdminProducts'],
    }),
    createProduct: builder.mutation<unknown, { title: string; name: string; category: string; price: number; sellerId: string; userId: string; status: string; isApproved: boolean; isPublished: boolean; description?: string; images: string[]; shippingRequired: boolean; freeShipping: boolean; shippingCost: number; shippingWeight?: number; dimensions?: { length?: number; width?: number; height?: number } }>({
      query: (body) => ({ url: '/admin/products', method: 'POST', body }),
      invalidatesTags: ['AdminProducts', 'AdminDashboard'],
    }),
    updateProduct: builder.mutation<unknown, { id: string; title?: string; name?: string; category?: string; price?: number; sellerId?: string; userId?: string; status?: string; isApproved?: boolean; isPublished?: boolean; description?: string; images?: string[]; shippingRequired?: boolean; freeShipping?: boolean; shippingCost?: number; shippingWeight?: number; dimensions?: { length?: number; width?: number; height?: number } }>({
      query: ({ id, ...body }) => ({ url: `/admin/products/${id}`, method: 'PUT', body }),
      invalidatesTags: ['AdminProducts', 'AdminDashboard'],
    }),
    deleteProduct: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/admin/products/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AdminProducts', 'AdminDashboard'],
    }),
    getOrders: builder.query<AdminOrder[], { search?: string; status?: string; paymentStatus?: string; type?: string; from?: string; to?: string } | void>({
      query: (params) => ({ url: '/admin/orders', params: params || undefined }),
      transformResponse: (response: unknown) => normalizeOrders(response),
      providesTags: ['AdminOrders'],
    }),
    updateOrder: builder.mutation<unknown, { id: string; orderStatus: string; status?: string }>({
      query: ({ id, ...body }) => ({ url: `/admin/orders/${id}`, method: 'PUT', body }),
      invalidatesTags: ['AdminOrders', 'AdminDashboard', 'AdminAnalytics'],
    }),
    refundOrder: builder.mutation<{ success: boolean; refundId: string; message?: string }, { id: string; amount?: number; reason?: string }>({
      query: ({ id, ...body }) => ({ url: `/admin/orders/${id}/refund`, method: 'POST', body }),
      invalidatesTags: ['AdminOrders', 'AdminDashboard', 'AdminAnalytics'],
    }),
    createShiprocketShipment: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/admin/orders/${id}/shipping/shiprocket`, method: 'POST' }),
      invalidatesTags: ['AdminOrders'],
    }),
    assignShiprocketAwb: builder.mutation<unknown, { id: string; courierId?: number }>({
      query: ({ id, courierId }) => ({ url: `/admin/orders/${id}/shipping/shiprocket/awb`, method: 'POST', body: courierId ? { courierId } : {} }),
      invalidatesTags: ['AdminOrders'],
    }),
    refreshShiprocketTracking: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/admin/orders/${id}/shipping/shiprocket/track`, method: 'POST' }),
      invalidatesTags: ['AdminOrders'],
    }),
    getAnalytics: builder.query<AnalyticsStats, void>({
      query: () => '/admin/analytics',
      transformResponse: (response: { data?: any }) => {
        const analytics = response?.data || {};
        const panelCounts = (analytics.panelStats || {}) as Record<string, number | string | undefined>;
        const totalPanels = Object.values(panelCounts).reduce<number>((sum, value) => sum + Number(value || 0), 0) || 1;
        const totalBookings = Array.isArray(analytics.dailyRevenue)
          ? analytics.dailyRevenue.reduce((sum: number, entry: { orders?: number }) => sum + Number(entry.orders || 0), 0)
          : 0;
        const totalRevenue = Array.isArray(analytics.dailyRevenue)
          ? analytics.dailyRevenue.reduce((sum: number, entry: { revenue?: number }) => sum + Number(entry.revenue || 0), 0)
          : 0;

        return {
          totalBookings,
          averageOrderValue: totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0,
          ratingAverage: 4.7,
          usersByPanel: [
            { name: 'Event Owners', value: Math.round((Number(panelCounts.eventOwners || 0) / totalPanels) * 100) },
            { name: 'Buyers', value: Math.round((Number(panelCounts.buyers || 0) / totalPanels) * 100) },
            { name: 'Vendors', value: Math.round((Number(panelCounts.vendors || 0) / totalPanels) * 100) },
          ],
        } satisfies AnalyticsStats;
      },
      providesTags: ['AdminAnalytics'],
    }),
    getStudents: builder.query<AdminStudent[], void>({
      query: () => '/admin/students',
      transformResponse: (response: unknown) => normalizeStudents(response),
      providesTags: ['AdminStudents'],
    }),
    createStudent: builder.mutation<unknown, { fullName: string; email: string; phone?: string; experienceLevel?: string; password?: string }>({
      query: (body) => ({ url: '/admin/students', method: 'POST', body }),
      invalidatesTags: ['AdminStudents', 'AdminDashboard'],
    }),
    updateStudent: builder.mutation<unknown, { id: string; fullName?: string; email?: string; phone?: string; experienceLevel?: string; accountStatus?: string }>({
      query: ({ id, ...body }) => ({ url: `/admin/students/${id}`, method: 'PUT', body }),
      invalidatesTags: ['AdminStudents', 'AdminDashboard'],
    }),
    deleteStudent: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/admin/students/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AdminStudents', 'AdminDashboard'],
    }),
    getInstructors: builder.query<AdminInstructor[], void>({
      query: () => '/admin/instructors',
      transformResponse: (response: unknown) => normalizeInstructors(response),
      providesTags: ['AdminInstructors'],
    }),
    createInstructor: builder.mutation<unknown, { fullName: string; email: string; headline?: string; password?: string }>({
      query: (body) => ({ url: '/admin/instructors', method: 'POST', body }),
      invalidatesTags: ['AdminInstructors', 'AdminDashboard'],
    }),
    updateInstructor: builder.mutation<unknown, { id: string; fullName?: string; email?: string; headline?: string; accountStatus?: string; isVerified?: boolean }>({
      query: ({ id, ...body }) => ({ url: `/admin/instructors/${id}`, method: 'PUT', body }),
      invalidatesTags: ['AdminInstructors', 'AdminDashboard'],
    }),
    deleteInstructor: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/admin/instructors/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AdminInstructors', 'AdminDashboard'],
    }),
    getCourses: builder.query<AdminCourse[], void>({
      query: () => '/admin/courses',
      transformResponse: (response: unknown) => normalizeCourses(response),
      providesTags: ['AdminCourses'],
    }),
    createCourse: builder.mutation<unknown, { title: string; category?: string; level?: string; price?: number; instructorId?: string; description?: string }>({
      query: (body) => ({ url: '/admin/courses', method: 'POST', body }),
      invalidatesTags: ['AdminCourses', 'AdminDashboard'],
    }),
    updateCourse: builder.mutation<unknown, { id: string; title?: string; category?: string; price?: number; status?: string; visibility?: string }>({
      query: ({ id, ...body }) => ({ url: `/admin/courses/${id}`, method: 'PUT', body }),
      invalidatesTags: ['AdminCourses', 'AdminDashboard'],
    }),
    deleteCourse: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/admin/courses/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AdminCourses', 'AdminDashboard'],
    }),
    getEnrollments: builder.query<AdminEnrollment[], void>({
      query: () => '/admin/enrollments',
      transformResponse: (response: unknown) => normalizeEnrollments(response),
      providesTags: ['AdminEnrollments'],
    }),
    updateEnrollment: builder.mutation<unknown, { id: string; status?: string; progressPercentage?: number }>({
      query: ({ id, ...body }) => ({ url: `/admin/enrollments/${id}`, method: 'PUT', body }),
      invalidatesTags: ['AdminEnrollments', 'AdminDashboard'],
    }),
    deleteEnrollment: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/admin/enrollments/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AdminEnrollments', 'AdminDashboard'],
    }),
    getJobSeekers: builder.query<AdminJobSeeker[], void>({
      query: () => '/admin/job-seekers',
      transformResponse: (response: unknown) => normalizeJobSeekers(response),
      providesTags: ['AdminJobSeekers'],
    }),
    createJobSeeker: builder.mutation<unknown, { fullName: string; email: string; phone?: string; currentRole?: string; experienceLevel?: string; location?: string; password?: string }>({
      query: (body) => ({ url: '/admin/job-seekers', method: 'POST', body }),
      invalidatesTags: ['AdminJobSeekers', 'AdminDashboard'],
    }),
    updateJobSeeker: builder.mutation<unknown, { id: string; fullName?: string; email?: string; phone?: string; currentRole?: string; experienceLevel?: string; location?: string }>({
      query: ({ id, ...body }) => ({ url: `/admin/job-seekers/${id}`, method: 'PUT', body }),
      invalidatesTags: ['AdminJobSeekers', 'AdminDashboard'],
    }),
    deleteJobSeeker: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/admin/job-seekers/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AdminJobSeekers', 'AdminDashboard'],
    }),
    getJobPosters: builder.query<AdminJobPoster[], void>({
      query: () => '/admin/job-posters',
      transformResponse: (response: unknown) => normalizeJobPosters(response),
      providesTags: ['AdminJobPosters'],
    }),
    createJobPoster: builder.mutation<unknown, { companyName: string; companyEmail: string; industry?: string; companySize?: string; websiteUrl?: string; password?: string }>({
      query: (body) => ({ url: '/admin/job-posters', method: 'POST', body }),
      invalidatesTags: ['AdminJobPosters', 'AdminDashboard'],
    }),
    updateJobPoster: builder.mutation<unknown, { id: string; companyName?: string; companyEmail?: string; industry?: string; companySize?: string; profileCompleted?: boolean; websiteUrl?: string }>({
      query: ({ id, ...body }) => ({ url: `/admin/job-posters/${id}`, method: 'PUT', body }),
      invalidatesTags: ['AdminJobPosters', 'AdminDashboard'],
    }),
    deleteJobPoster: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/admin/job-posters/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AdminJobPosters', 'AdminDashboard'],
    }),
    getModerationJobs: builder.query<AdminModerationJob[], void>({
      query: () => '/admin/jobs/moderation',
      transformResponse: (response: unknown) => normalizeModerationJobs(response),
      providesTags: ['AdminModeration', 'AdminFeaturedListings'],
    }),
    getModerationProducts: builder.query<AdminModerationProduct[], void>({
      query: () => '/admin/moderation/products',
      transformResponse: (response: unknown) => normalizeModerationProducts(response),
      providesTags: ['AdminModeration', 'AdminFeaturedListings'],
    }),
    updateModerationProduct: builder.mutation<unknown, { id: string; status?: string; isFeatured?: boolean }>({
      query: ({ id, ...body }) => ({
        url: `/admin/moderation/products/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AdminModeration', 'AdminFeaturedListings'],
    }),
    updateModerationJob: builder.mutation<unknown, { id: string; status?: string; isFeatured?: boolean; featuredPlan?: string }>({
      query: ({ id, ...body }) => ({
        url: `/admin/jobs/moderation/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AdminModeration', 'AdminFeaturedListings'],
    }),
    getContentModerationPosts: builder.query<AdminModerationPost[], void>({
      query: () => '/admin/moderation/content',
      transformResponse: (response: unknown) => normalizeModerationPosts(response),
      providesTags: ['AdminContentModeration'],
    }),
    deleteContentModerationPost: builder.mutation<unknown, string>({
      query: (id) => ({
        url: `/admin/moderation/content/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminContentModeration'],
    }),
    getCategories: builder.query<AdminCategory[], void>({
      query: () => '/admin/categories',
      transformResponse: (response: unknown) => normalizeCategories(response),
      providesTags: ['AdminCategories'],
    }),
    createCategory: builder.mutation<unknown, { name: string; subcategories?: string[]; scopes?: string[]; isActive?: boolean }>({
      query: (body) => ({
        url: '/admin/categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdminCategories'],
    }),
    updateCategory: builder.mutation<unknown, { id: string; name?: string; subcategories?: string[]; scopes?: string[]; isActive?: boolean }>({
      query: ({ id, ...body }) => ({
        url: `/admin/categories/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AdminCategories'],
    }),
    deleteCategory: builder.mutation<unknown, string>({
      query: (id) => ({
        url: `/admin/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminCategories'],
    }),
    getCommissionRules: builder.query<AdminCommissionRule[], void>({
      query: () => '/admin/commissions',
      transformResponse: (response: unknown) => normalizeCommissionRules(response),
      providesTags: ['AdminCommissions'],
    }),
    createCommissionRule: builder.mutation<unknown, { category: string; type: 'fixed' | 'percentage'; value: number; isActive?: boolean }>({
      query: (body) => ({
        url: '/admin/commissions',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdminCommissions'],
    }),
    updateCommissionRule: builder.mutation<unknown, { id: string; category?: string; type?: 'fixed' | 'percentage'; value?: number; isActive?: boolean }>({
      query: ({ id, ...body }) => ({
        url: `/admin/commissions/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AdminCommissions'],
    }),
    deleteCommissionRule: builder.mutation<unknown, string>({
      query: (id) => ({
        url: `/admin/commissions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminCommissions'],
    }),
    getFeaturedListings: builder.query<AdminFeaturedListings, void>({
      query: () => '/admin/featured-listings',
      transformResponse: (response: { data?: AdminFeaturedListings }) => {
        return response?.data || { products: [], jobs: [], courses: [] };
      },
      providesTags: ['AdminFeaturedListings'],
    }),
    getJobPostingFee: builder.query<{ fee: number }, void>({
      query: () => '/admin/job-posting-fee',
      transformResponse: (response: { data?: { fee?: number } }) => ({ fee: Number(response?.data?.fee || 0) }),
      providesTags: ['AdminSettings'],
    }),
    updateJobPostingFee: builder.mutation<{ fee: number }, { fee: number }>({
      query: (body) => ({
        url: '/admin/job-posting-fee',
        method: 'PUT',
        body,
      }),
      transformResponse: (response: { data?: { fee?: number } }) => ({ fee: Number(response?.data?.fee || 0) }),
      invalidatesTags: ['AdminSettings'],
    }),
    getDisputes: builder.query<AdminDispute[], void>({
      query: () => '/admin/disputes',
      transformResponse: (response: unknown) => normalizeDisputes(response),
      providesTags: ['AdminDisputes'],
    }),
    updateDispute: builder.mutation<unknown, { id: string; status?: string; resolution?: string }>({
      query: ({ id, ...body }) => ({
        url: `/admin/disputes/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AdminDisputes'],
    }),
    getSupportTickets: builder.query<AdminSupportTicket[], void>({
      query: () => '/admin/support-tickets',
      transformResponse: (response: unknown) => normalizeSupportTickets(response),
      providesTags: ['AdminSupportTickets'],
    }),
    updateSupportTicket: builder.mutation<unknown, { id: string; status?: string; priority?: string; assignedTo?: string; note?: string }>({
      query: ({ id, ...body }) => ({
        url: `/admin/support-tickets/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AdminSupportTickets'],
    }),
    getRolePermissions: builder.query<AdminRolePermission[], void>({
      query: () => '/admin/roles-permissions',
      transformResponse: (response: unknown) => normalizeRolePermissions(response),
      providesTags: ['AdminRolesPermissions'],
    }),
    createRolePermission: builder.mutation<unknown, { role: string; description?: string; permissions?: string[] }>({
      query: (body) => ({
        url: '/admin/roles-permissions',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdminRolesPermissions'],
    }),
    updateRolePermission: builder.mutation<unknown, { id: string; role?: string; description?: string; permissions?: string[] }>({
      query: ({ id, ...body }) => ({
        url: `/admin/roles-permissions/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AdminRolesPermissions'],
    }),
    deleteRolePermission: builder.mutation<unknown, string>({
      query: (id) => ({
        url: `/admin/roles-permissions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminRolesPermissions'],
    }),
    getSettings: builder.query<{ success: boolean; data: AdminSettings }, void>({
      query: () => '/admin/settings',
      providesTags: ['AdminSettings'],
    }),
    updateSettings: builder.mutation<{ success: boolean; data: AdminSettings; message?: string }, AdminSettings>({
      query: (body) => ({
        url: '/admin/settings',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AdminSettings'],
    }),
    getSettingsHistory: builder.query<{ success: boolean; data: AdminSettingsHistoryEntry[] }, void>({
      query: () => '/admin/settings/history',
      providesTags: ['AdminSettings'],
    }),

    // Blogs
    getBlogs: builder.query<AdminBlog[], { status?: string; q?: string }>({
      query: ({ status, q }) => {
        const params = new URLSearchParams();
        if (status) params.set('status', status);
        if (q) params.set('q', q);
        const qs = params.toString();
        return `/admin/blogs${qs ? `?${qs}` : ''}`;
      },
      transformResponse: (response: unknown) => normalizeBlogs(response),
      providesTags: ['AdminBlogs'],
    }),
    createBlog: builder.mutation<unknown, { title: string; content?: string; category?: string; status?: string; featured?: boolean; seoTitle?: string; seoDescription?: string }>({
      query: (body) => ({ url: '/admin/blogs', method: 'POST', body }),
      invalidatesTags: ['AdminBlogs'],
    }),
    updateBlog: builder.mutation<unknown, { id: string; title?: string; content?: string; category?: string; status?: string; featured?: boolean; seoTitle?: string; seoDescription?: string }>({
      query: ({ id, ...body }) => ({ url: `/admin/blogs/${id}`, method: 'PUT', body }),
      invalidatesTags: ['AdminBlogs'],
    }),
    deleteBlog: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/admin/blogs/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AdminBlogs'],
    }),

    // Banners
    getBanners: builder.query<AdminBanner[], void>({
      query: () => '/admin/banners',
      transformResponse: (response: unknown) => normalizeBanners(response),
      providesTags: ['AdminBanners'],
    }),
    createBanner: builder.mutation<unknown, { title: string; subtitle?: string; image?: string; buttonText?: string }>({
      query: (body) => ({ url: '/admin/banners', method: 'POST', body }),
      invalidatesTags: ['AdminBanners'],
    }),
    updateBanner: builder.mutation<unknown, { id: string; title?: string; subtitle?: string; image?: string; buttonText?: string }>({
      query: ({ id, ...body }) => ({ url: `/admin/banners/${id}`, method: 'PUT', body }),
      invalidatesTags: ['AdminBanners'],
    }),
    deleteBanner: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/admin/banners/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AdminBanners'],
    }),

    // Rental Orders
    getRentalOrders: builder.query<AdminRentalOrder[], { status?: string }>({
      query: ({ status }) => {
        const qs = status ? `?status=${status}` : '';
        return `/admin/rental-orders${qs}`;
      },
      transformResponse: (response: unknown) => normalizeRentalOrders(response),
      providesTags: ['AdminRentalOrders'],
    }),
    updateRentalOrder: builder.mutation<unknown, { id: string; rentalStatus?: string; paymentStatus?: string; adminNotes?: string }>({
      query: ({ id, ...body }) => ({ url: `/admin/rental-orders/${id}`, method: 'PUT', body }),
      invalidatesTags: ['AdminRentalOrders'],
    }),

    // Coupons
    getCoupons: builder.query<AdminCoupon[], { status?: string; q?: string }>({
      query: ({ status, q }) => {
        const params = new URLSearchParams();
        if (status) params.set('status', status);
        if (q) params.set('q', q);
        const qs = params.toString();
        return `/coupons${qs ? `?${qs}` : ''}`;
      },
      transformResponse: (response: unknown) => normalizeCoupons(response),
      providesTags: ['AdminCoupons'],
    }),
    createCoupon: builder.mutation<unknown, Partial<AdminCoupon>>({
      query: (body) => ({ url: '/coupons', method: 'POST', body }),
      invalidatesTags: ['AdminCoupons'],
    }),
    updateCoupon: builder.mutation<unknown, { id: string } & Partial<AdminCoupon>>({
      query: ({ id, ...body }) => ({ url: `/coupons/${id}`, method: 'PUT', body }),
      invalidatesTags: ['AdminCoupons'],
    }),
    deleteCoupon: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/coupons/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AdminCoupons'],
    }),

    // Audit Logs
    getAuditLogs: builder.query<AdminAuditLog[], { action?: string; entity?: string }>({
      query: ({ action, entity }) => {
        const params = new URLSearchParams();
        if (action) params.set('action', action);
        if (entity) params.set('entity', entity);
        const qs = params.toString();
        return `/audit-logs${qs ? `?${qs}` : ''}`;
      },
      transformResponse: (response: unknown) => normalizeAuditLogs(response),
      providesTags: ['AdminAuditLogs'],
    }),

    // Settlements
    getSettlements: builder.query<AdminSettlement[], { status?: string }>({
      query: ({ status }) => {
        const qs = status ? `?status=${status}` : '';
        return `/settlements${qs}`;
      },
      transformResponse: (response: unknown) => normalizeSettlements(response),
      providesTags: ['AdminSettlements'],
    }),
    updateSettlement: builder.mutation<unknown, { id: string; status?: string; notes?: string }>({
      query: ({ id, ...body }) => ({ url: `/settlements/${id}`, method: 'PUT', body }),
      invalidatesTags: ['AdminSettlements'],
    }),

    // Merchants
    getMerchants: builder.query<AdminMerchant[], void>({
      query: () => '/merchant',
      transformResponse: (response: unknown) => normalizeMerchants(response),
      providesTags: ['AdminMerchants'],
    }),

    // Enhanced seller views
    getSellersDetailed: builder.query<AdminSellerDetailed[], void>({
      query: () => '/admin/sellers',
      transformResponse: (response: unknown) => normalizeSellersDetailed(response),
      providesTags: ['AdminSellersDetailed'],
    }),
    getSellerReviews: builder.query<AdminSellerReview[], string>({
      query: (sellerId) => `/admin/sellers/${sellerId}/reviews`,
      transformResponse: (response: unknown) => normalizeSellerReviews(response),
    }),
    suspendSeller: builder.mutation<unknown, { id: string; status: string }>({
      query: ({ id, ...body }) => ({ url: `/admin/sellers/${id}/status`, method: 'PUT', body }),
      invalidatesTags: ['AdminSellersDetailed'],
    }),

    // Enhanced instructor views
    getInstructorsDetailed: builder.query<AdminInstructorDetailed[], void>({
      query: () => '/admin/instructors-detailed',
      transformResponse: (response: unknown) => normalizeInstructorsDetailed(response),
      providesTags: ['AdminInstructorsDetailed'],
    }),
    getInstructorReviews: builder.query<AdminInstructorReview[], string>({
      query: (instructorId) => `/admin/instructors/${instructorId}/reviews`,
      transformResponse: (response: unknown) => normalizeInstructorReviews(response),
    }),
    updateInstructorStatus: builder.mutation<unknown, { id: string; accountStatus?: string; isVerified?: boolean }>({
      query: ({ id, ...body }) => ({ url: `/admin/instructors/${id}/status`, method: 'PUT', body }),
      invalidatesTags: ['AdminInstructorsDetailed'],
    }),

    // Enhanced job poster views
    getJobPostersDetailed: builder.query<AdminJobPosterDetailed[], void>({
      query: () => '/admin/job-posters-detailed',
      transformResponse: (response: unknown) => normalizeJobPostersDetailed(response),
      providesTags: ['AdminJobPostersDetailed'],
    }),
    getJobPosterJobs: builder.query<AdminJobPosterJob[], string>({
      query: (posterId) => `/admin/job-posters/${posterId}/jobs`,
      transformResponse: (response: unknown) => normalizeJobPosterJobs(response),
    }),
    updateJobPosterStatus: builder.mutation<unknown, { id: string; status: string }>({
      query: ({ id, ...body }) => ({ url: `/admin/job-posters/${id}/status`, method: 'PUT', body }),
      invalidatesTags: ['AdminJobPostersDetailed'],
    }),

    // Venues
    getVenues: builder.query<AdminVenue[], void>({
      query: () => '/admin/venues',
      transformResponse: (response: unknown) => normalizeVenues(response),
      providesTags: ['AdminVenues'],
    }),
    createVenue: builder.mutation<unknown, Omit<AdminVenue, '_id' | 'createdAt'>>({
      query: (body) => ({ url: '/admin/venues', method: 'POST', body }),
      invalidatesTags: ['AdminVenues'],
    }),
    updateVenue: builder.mutation<unknown, { id: string; name?: string; location?: string; description?: string; pricePerDay?: number; serviceFee?: number; guests?: number; rating?: number; reviews?: number; images?: string[] }>({
      query: ({ id, ...body }) => ({ url: `/admin/venues/${id}`, method: 'PUT', body }),
      invalidatesTags: ['AdminVenues'],
    }),
    deleteVenue: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/admin/venues/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AdminVenues'],
    }),

    getServices: builder.query<AdminService[], void>({
      query: () => '/admin/services', transformResponse: (response: unknown) => normalizeServices(response), providesTags: ['AdminServices'],
    }),
    createService: builder.mutation<unknown, Omit<AdminService, '_id' | 'createdAt'>>({
      query: (body) => ({ url: '/admin/services', method: 'POST', body }), invalidatesTags: ['AdminServices'],
    }),
    updateService: builder.mutation<unknown, ({ id: string } & Partial<Omit<AdminService, '_id' | 'createdAt'>>) >({
      query: ({ id, ...body }) => ({ url: `/admin/services/${id}`, method: 'PUT', body }), invalidatesTags: ['AdminServices'],
    }),
    deleteService: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/admin/services/${id}`, method: 'DELETE' }), invalidatesTags: ['AdminServices'],
    }),

    // Jobs (all jobs, not just moderation)
    getAllJobs: builder.query<AdminJob[], void>({
      query: () => '/admin/jobs/moderation',
      transformResponse: (response: unknown) => normalizeJobs(response),
      providesTags: ['AdminJobs'],
    }),
    createJob: builder.mutation<unknown, { recruiterId: string; jobTitle: string; jobCategory?: string; jobType?: string; experienceLevel?: string; salaryMin?: number; salaryMax?: number; location?: string; remoteAvailable?: boolean; aboutRole?: string; responsibilities?: string[]; skills?: string[]; applicationDeadline?: string; openings?: number; status?: string }>({
      query: (body) => ({ url: '/admin/jobs', method: 'POST', body }), invalidatesTags: ['AdminJobs'],
    }),

    // Applications
    getApplications: builder.query<AdminApplication[], void>({
      query: () => '/admin/applications',
      transformResponse: (response: unknown) => normalizeApplications(response),
      providesTags: ['AdminApplications'],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetDashboardStatsQuery,
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetOrdersQuery,
  useUpdateOrderMutation,
  useRefundOrderMutation,
  useCreateShiprocketShipmentMutation,
  useAssignShiprocketAwbMutation,
  useRefreshShiprocketTrackingMutation,
  useGetAnalyticsQuery,
  useGetStudentsQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useGetInstructorsQuery,
  useCreateInstructorMutation,
  useUpdateInstructorMutation,
  useDeleteInstructorMutation,
  useGetCoursesQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useGetEnrollmentsQuery,
  useUpdateEnrollmentMutation,
  useDeleteEnrollmentMutation,
  useGetJobSeekersQuery,
  useCreateJobSeekerMutation,
  useUpdateJobSeekerMutation,
  useDeleteJobSeekerMutation,
  useGetJobPostersQuery,
  useCreateJobPosterMutation,
  useUpdateJobPosterMutation,
  useDeleteJobPosterMutation,
  useGetModerationJobsQuery,
  useGetModerationProductsQuery,
  useUpdateModerationProductMutation,
  useUpdateModerationJobMutation,
  useGetContentModerationPostsQuery,
  useDeleteContentModerationPostMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCommissionRulesQuery,
  useCreateCommissionRuleMutation,
  useUpdateCommissionRuleMutation,
  useDeleteCommissionRuleMutation,
  useGetFeaturedListingsQuery,
  useGetJobPostingFeeQuery,
  useUpdateJobPostingFeeMutation,
  useGetDisputesQuery,
  useUpdateDisputeMutation,
  useGetSupportTicketsQuery,
  useUpdateSupportTicketMutation,
  useGetRolePermissionsQuery,
  useCreateRolePermissionMutation,
  useUpdateRolePermissionMutation,
  useDeleteRolePermissionMutation,
  useGetSettingsQuery,
  useGetSettingsHistoryQuery,
  useUpdateSettingsMutation,
  useGetBlogsQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
  useGetBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  useGetRentalOrdersQuery,
  useUpdateRentalOrderMutation,
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useGetAuditLogsQuery,
  useGetSettlementsQuery,
  useUpdateSettlementMutation,
  useGetMerchantsQuery,
  useGetSellersDetailedQuery,
  useGetSellerReviewsQuery,
  useSuspendSellerMutation,
  useGetInstructorsDetailedQuery,
  useGetInstructorReviewsQuery,
  useUpdateInstructorStatusMutation,
  useGetJobPostersDetailedQuery,
  useGetJobPosterJobsQuery,
  useUpdateJobPosterStatusMutation,
  useGetVenuesQuery,
  useCreateVenueMutation,
  useUpdateVenueMutation,
  useDeleteVenueMutation,
  useGetServicesQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useGetAllJobsQuery,
  useCreateJobMutation,
  useGetApplicationsQuery,
} = adminApi;

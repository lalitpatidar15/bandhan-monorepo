require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/shared/User");
const Product = require("../models/shared/Product");
const Service = require("../models/shared/Service");
const Venue = require("../models/shared/Venue");
const Order = require("../models/shared/Order");
const RentalOrder = require("../models/shared/RentalOrder");
const Quote = require("../models/shared/Quote");
const Conversation = require("../models/shared/Conversation");
const Message = require("../models/shared/Message");
const Recruiter = require("../models/jobPoster/Recruiter");
const Job = require("../models/jobPoster/Job");
const JobSeeker = require("../models/jobSeeker/JobSeeker");
const Application = require("../models/jobPoster/Application");

const password = "Password@123";
const imageSet = (seed) => [1, 2, 3, 4].map((index) => `https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=85&sig=${seed}${index}`);

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  const hash = await bcrypt.hash(password, 10);
  const [admin, buyer, seller] = await User.create([
    { fullName: "Bandhan Admin", email: "admin@bandhan.demo", password: hash, role: "admin", status: "active", emailVerified: true, isProfileComplete: true },
    { fullName: "Aarav Mehta", email: "buyer@bandhan.demo", password: hash, role: "buyer", status: "active", emailVerified: true, isProfileComplete: true, phone: "9876543210" },
    { fullName: "Meera Events", email: "seller@bandhan.demo", password: hash, role: "seller", status: "active", emailVerified: true, isProfileComplete: true, phone: "9876501234" },
  ]);

  const [product, rentalProduct] = await Product.create([
    { sellerId: seller._id, sellerEmail: seller.email, sellerName: seller.fullName, title: "Brass Celebration Lantern Set", category: "Decor", description: "Hand-finished lanterns for intimate celebrations.", images: imageSet("lantern"), price: 2499, stock: 24, stockStatus: "in_stock", status: "active", isPublished: true, isApproved: true, productType: "sale", type: "sale", shippingWeight: 1.5, dimensions: { length: 24, width: 18, height: 30 }, sku: "DEMO-LANTERN-01", rating: 4.7, reviewCount: 18 },
    { sellerId: seller._id, sellerEmail: seller.email, sellerName: seller.fullName, title: "Premium Lounge Furniture Set", category: "Furniture", description: "A complete rental lounge for weddings and corporate events.", images: imageSet("lounge"), price: 18000, rentalPrice: 5500, rentalDuration: "day", securityDeposit: 6000, stock: 3, rentalStock: 3, stockStatus: "in_stock", status: "active", isPublished: true, isApproved: true, productType: "rental", type: "rental", shippingWeight: 40, dimensions: { length: 200, width: 90, height: 90 }, sku: "DEMO-LOUNGE-01", rating: 4.8, reviewCount: 9 },
  ]);

  const service = await Service.create({ sellerId: seller._id, sellerEmail: seller.email, title: "Signature Wedding Decor", category: "decor", description: "Bespoke stage, floral, and table styling for celebrations.", price: 85001, location: "Mumbai", eventType: "Wedding", images: imageSet("service"), image: imageSet("service")[0], rating: 4.9, minGuests: 100, maxGuests: 800, status: "active", isActive: true, isFeatured: true });
  await Venue.create([
    { name: "The Banyan Estate", location: "Jaipur, Rajasthan", description: "Admin-curated heritage venue with lawn and ballroom.", pricePerDay: 175001, serviceFee: 15001, guests: 750, rating: 4.8, reviews: 42, images: imageSet("banyan") },
    { name: "Lakeview Pavilion", location: "Udaipur, Rajasthan", description: "Admin-curated lakeside venue for destination events.", pricePerDay: 210000, serviceFee: 18000, guests: 500, rating: 4.9, reviews: 31, images: imageSet("lake") },
  ]);

  const quote = await Quote.create({ userId: buyer._id, sellerId: seller._id, serviceId: service._id, eventType: "Wedding", eventDate: "2026-12-10", location: "Mumbai", guestRange: "200-300", services: ["Decoration"], budget: 100000, fullName: buyer.fullName, phone: buyer.phone, email: buyer.email, status: "pending" });
  const conversation = await Conversation.create({ buyerId: buyer._id, sellerId: seller._id, serviceId: service._id, serviceName: service.title, serviceImage: service.image, buyerName: buyer.fullName, sellerName: seller.fullName, customerId: buyer._id, customerName: buyer.fullName, amount: quote.budget, lastMessage: "Could you share a detailed decor proposal?", lastMessageAt: new Date() });
  await Message.create({ conversationId: conversation._id, senderId: buyer._id, senderRole: "buyer", text: "Could you share a detailed decor proposal?" });

  await Order.create({ sellerId: seller._id, buyerId: buyer._id, customerName: buyer.fullName, orderId: "DEMO-ORDER-1001", productName: product.title, items: [{ productId: product._id, sellerId: seller._id, itemType: "product", title: product.title, image: product.images[0], price: product.price, quantity: 1 }], amount: product.price, paymentStatus: "paid", orderStatus: "confirmed", status: "confirmed", shippingAddress: { fullName: buyer.fullName, street: "42 Marine Drive", city: "Mumbai", state: "Maharashtra", pincode: "400001", phone: buyer.phone } });
  const rental = await RentalOrder.create({ rentalId: "DEMO-RENTAL-1001", userId: buyer._id, sellerId: seller._id, productId: rentalProduct._id, productTitle: rentalProduct.title, productImage: rentalProduct.images[0], quantity: 1, rentalStart: new Date("2026-09-10"), rentalEnd: new Date("2026-09-13"), rentalDurationDays: 3, dailyRate: rentalProduct.rentalPrice, subtotal: 16500, securityDeposit: 6000, totalAmount: 22500, paymentStatus: "full_paid", rentalStatus: "reserved" });
  await Conversation.create({ buyerId: buyer._id, sellerId: seller._id, rentalOrderId: rental._id, productId: rentalProduct._id, productName: rentalProduct.title, productImage: rentalProduct.images[0], buyerName: buyer.fullName, sellerName: seller.fullName, customerId: buyer._id, customerName: buyer.fullName, amount: rental.totalAmount, orderStatus: rental.rentalStatus, orderNumber: rental.rentalId });

  const recruiter = await Recruiter.create({ companyName: "Symmetry Events", companyEmail: "employer@bandhan.demo", password, industry: "Events & Hospitality", companySize: "51-200", profileCompleted: true });
  const seeker = await JobSeeker.create({ fullName: "Riya Kapoor", email: "jobseeker@bandhan.demo", password: hash, location: "Bengaluru", currentRole: "Event Coordinator", headline: "Event operations specialist", experienceLevel: "1-3 Years", skills: ["Vendor Management", "Event Planning", "Budgeting"], isVerified: true });
  const job = await Job.create({ recruiterId: recruiter._id, jobTitle: "Senior Event Coordinator", jobCategory: "Marketing", jobType: "Full-time", experienceLevel: "Mid-Level", salaryMin: 600000, salaryMax: 900000, location: "Bengaluru", remoteAvailable: false, aboutRole: "Lead planning and delivery for premium events.", responsibilities: ["Coordinate vendors", "Manage event timelines"], skills: ["Event Planning", "Vendor Management"], requirements: ["2+ years experience"], benefits: ["Health cover", "Learning budget"], openings: 2, status: "active", isDraft: false, isPublished: true, currentStep: 5, completedSteps: [1, 2, 3, 4, 5] });
  await Application.create({ jobId: job._id, recruiterId: recruiter._id, seekerId: seeker._id, coverLetter: "I would love to bring my event operations experience to Symmetry Events.", expectedSalary: 800000, salaryType: "Negotiable", status: "Submitted", isDraft: false, submittedAt: new Date() });

  console.log(JSON.stringify({ users: [admin.email, buyer.email, seller.email], recruiter: recruiter.companyEmail, jobSeeker: seeker.email, password, products: 2, services: 1, venues: 2, jobs: 1 }, null, 2));
  await mongoose.disconnect();
}

seed().catch(async (error) => { console.error("Marketplace seed failed:", error); await mongoose.disconnect(); process.exit(1); });

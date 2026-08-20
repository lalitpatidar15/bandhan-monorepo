require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const connectDB = require("../config/db");

const Instructor = require("../models/instructor/Instructor");
const Student = require("../models/student/Student");
const Course = require("../models/student/Course");
const Enrollment = require("../models/student/Enrollment");
const Progress = require("../models/student/CourseProgress");
const Wishlist = require("../models/shared/Wishlist");
const Notification = require("../models/shared/Notification");
const Review = require("../models/shared/Review");
const ReviewInstructor = require("../models/student/ReviewInstructor");

const PASS = "Password@123";

async function seed() {
  await connectDB();

  // Clear previously seeded data (dev seed)
  await Promise.all([
    Instructor.deleteMany({}),
    Student.deleteMany({}),
    Course.deleteMany({}),
    Enrollment.deleteMany({}),
    Progress.deleteMany({}),
    Wishlist.deleteMany({}),
    Notification.deleteMany({}),
    Review.deleteMany({}),
    ReviewInstructor.deleteMany({}),
  ]);
  console.log("Cleared existing academy collections.");

  const hashed = await bcrypt.hash(PASS, 10);

  // ---------- Instructors ----------
  const instructorData = [
    { fullName: "Priya Sharma", email: "priya@bandhan.academy", headline: "Wedding Planning Expert", expertiseTags: ["wedding", "decor"], bio: "10+ years planning luxury weddings." },
    { fullName: "Rahul Mehta", email: "rahul@bandhan.academy", headline: "Event Photography Coach", expertiseTags: ["photography"], bio: "Award-winning wedding photographer." },
    { fullName: "Anita Nair", email: "anita@bandhan.academy", headline: "Catering & Hospitality", expertiseTags: ["catering"], bio: "Expert in event catering." },
  ];
  const instructors = [];
  for (const d of instructorData) {
    instructors.push(await Instructor.create({ ...d, password: hashed, isVerified: true, verificationStatus: { aadhaar: "approved", pan: "approved", academicDegree: "approved", professionalCertificate: "approved", overall: "approved" } }));
  }
  console.log(`Created ${instructors.length} instructors.`);

  // ---------- Students ----------
  const studentData = [
    { fullName: "Aarav Kumar", email: "aarav@bandhan.academy", learningInterests: ["wedding", "photography"] },
    { fullName: "Diya Singh", email: "diya@bandhan.academy", learningInterests: ["catering"] },
    { fullName: "Vivaan Reddy", email: "vivaan@bandhan.academy", learningInterests: ["wedding"] },
    { fullName: "Isha Verma", email: "isha@bandhan.academy", learningInterests: ["photography", "decor"] },
    { fullName: "Kabir Joshi", email: "kabir@bandhan.academy", learningInterests: ["catering", "wedding"] },
  ];
  const students = [];
  for (const d of studentData) {
    students.push(await Student.create({ ...d, password: hashed }));
  }
  console.log(`Created ${students.length} students.`);

  // ---------- Courses ----------
  const courseDefs = [
    {
      instructor: instructors[0],
      title: "Complete Wedding Planning Masterclass",
      subtitle: "Plan and execute a flawless wedding",
      category: "wedding-planning",
      level: "Beginner",
      price: 4999,
      emiMonths: [3, 6, 12],
      certificate: true,
      isFeatured: true,
      modules: [
        { title: "Foundations", lessons: [
          { title: "Introduction to Wedding Planning", type: "video", duration: 12, videoUrl: "https://sample.com/v1", isPreview: true },
          { title: "Budgeting Basics", type: "video", duration: 15, videoUrl: "https://sample.com/v2" },
        ]},
        { title: "Vendors & Logistics", lessons: [
          { title: "Selecting Vendors", type: "video", duration: 18, videoUrl: "https://sample.com/v3" },
          { title: "Knowledge Check", type: "quiz", duration: 10, quiz: { questions: [
            { question: "What is a typical venue deposit?", options: [{ text: "10%", isCorrect: true }, { text: "100%", isCorrect: false }, { text: "0%", isCorrect: false }], marks: 1 },
            { question: "When should you book a photographer?", options: [{ text: "Last minute", isCorrect: false }, { text: "6-9 months ahead", isCorrect: true }, { text: "After wedding", isCorrect: false }], marks: 1 },
          ], passingMarks: 2 } },
        ]},
      ],
    },
    {
      instructor: instructors[1],
      title: "Wedding Photography Essentials",
      subtitle: "Capture moments like a pro",
      category: "photography",
      level: "Intermediate",
      price: 3499,
      emiMonths: [3, 6],
      certificate: true,
      isFeatured: true,
      modules: [
        { title: "Camera Basics", lessons: [
          { title: "Understanding Your Camera", type: "video", duration: 20, videoUrl: "https://sample.com/p1", isPreview: true },
          { title: "Lighting", type: "video", duration: 22, videoUrl: "https://sample.com/p2" },
        ]},
        { title: "Shooting a Wedding", lessons: [
          { title: "Ceremony Shots", type: "video", duration: 25, videoUrl: "https://sample.com/p3" },
          { title: "Quiz: Lighting", type: "quiz", duration: 8, quiz: { questions: [
            { question: "Best light for portraits?", options: [{ text: "Harsh noon", isCorrect: false }, { text: "Golden hour", isCorrect: true }, { text: "Dark room", isCorrect: false }], marks: 1 },
          ], passingMarks: 1 } },
        ]},
      ],
    },
    {
      instructor: instructors[2],
      title: "Event Catering & Menu Design",
      subtitle: "Design menus that delight",
      category: "catering",
      level: "Beginner",
      price: 2999,
      emiMonths: [3],
      certificate: true,
      isFeatured: false,
      modules: [
        { title: "Menu Planning", lessons: [
          { title: "Cuisine Selection", type: "video", duration: 14, videoUrl: "https://sample.com/c1", isPreview: true },
        ]},
      ],
    },
    {
      instructor: instructors[0],
      title: "Decor & Floral Design",
      subtitle: "Create stunning spaces",
      category: "decor",
      level: "Beginner",
      price: 2499,
      emiMonths: [3, 6],
      certificate: true,
      isFeatured: false,
      modules: [
        { title: "Floral Basics", lessons: [
          { title: "Color Theory", type: "video", duration: 16, videoUrl: "https://sample.com/d1", isPreview: true },
          { title: "Arrangements", type: "video", duration: 18, videoUrl: "https://sample.com/d2" },
        ]},
      ],
    },
    {
      instructor: instructors[1],
      title: "Advanced Editing Workshop",
      subtitle: "Post-production mastery",
      category: "photography",
      level: "Advanced",
      price: 5999,
      emiMonths: [6, 12],
      certificate: true,
      isFeatured: true,
      modules: [
        { title: "Lightroom", lessons: [
          { title: "Workflow", type: "video", duration: 24, videoUrl: "https://sample.com/e1", isPreview: true },
        ]},
      ],
    },
    {
      instructor: instructors[2],
      title: "Hospitality Management 101",
      subtitle: "Run smooth events",
      category: "catering",
      level: "Intermediate",
      price: 3999,
      emiMonths: [3, 6, 12],
      certificate: true,
      isFeatured: false,
      modules: [
        { title: "Service Standards", lessons: [
          { title: "Guest Experience", type: "video", duration: 19, videoUrl: "https://sample.com/h1", isPreview: true },
        ]},
      ],
    },
  ];

  const courses = [];
  for (const def of courseDefs) {
    const modules = def.modules.map((m, mi) => ({
      title: m.title,
      order: mi,
      status: "completed",
      lessons: m.lessons.map((l, li) => ({
        title: l.title,
        type: l.type,
        duration: l.duration,
        videoUrl: l.videoUrl,
        isPreview: !!l.isPreview,
        status: "published",
        order: li,
        quiz: l.quiz ? { questions: l.quiz.questions, passingMarks: l.quiz.passingMarks } : null,
      })),
    }));
    const pricing = {
      basePrice: def.price,
      enableDiscount: true,
      discountPercentage: 10,
      finalPrice: Math.round(def.price * 0.9),
    };
    const emi = {
      enabled: def.emiMonths.length > 0,
      plans: def.emiMonths.map((m) => ({ months: m, monthlyAmount: Math.round((def.price / m) * 1.15) })),
    };
    const course = await Course.create({
      instructorId: def.instructor._id,
      instructor: def.instructor.fullName,
      title: def.title,
      subtitle: def.subtitle,
      category: def.category,
      level: def.level,
      description: def.subtitle,
      status: "published",
      visibility: "public",
      thumbnail: "https://picsum.photos/seed/" + encodeURIComponent(def.title) + "/400/240",
      pricing,
      emi,
      certificate: def.certificate,
      isFeatured: def.isFeatured,
      modules,
      skills: [def.category],
      rating: 4.5,
      ratingCount: 12,
    });
    courses.push(course);
  }
  console.log(`Created ${courses.length} courses.`);

  // ---------- Enrollments + Progress + Certificates ----------
  const enrollPairs = [
    [students[0], courses[0]],
    [students[0], courses[1]],
    [students[1], courses[2]],
    [students[2], courses[0]],
    [students[3], courses[1]],
    [students[3], courses[3]],
    [students[4], courses[2]],
    [students[4], courses[4]],
  ];

  for (const [student, course] of enrollPairs) {
    const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);
    const enrollment = await Enrollment.create({
      studentId: student._id,
      courseId: course._id,
      unlockedModules: [course.modules[0]._id],
      progressPercentage: 100,
      status: "completed",
      completedAt: new Date(),
      completedLessons: course.modules.flatMap((m) => m.lessons.map((l) => ({ moduleId: m._id, lessonId: l._id }))),
    });

    const progress = await Progress.create({
      studentId: student._id,
      courseId: course._id,
      progressPercentage: 100,
      completed: true,
      completedLessons: course.modules.flatMap((m) => m.lessons.map((l) => ({ lessonId: l._id }))),
      certificates: [{ title: `${course.title} — Completion Certificate`, pdfUrl: "", issuedAt: new Date() }],
    });
    void enrollment;
    void progress;

    // Wishlist for a couple
    if (Math.random() > 0.5) {
      await Wishlist.create({ studentId: student._id, courseId: courses[(courses.indexOf(course) + 1) % courses.length]._id });
    }
  }
  console.log(`Created ${enrollPairs.length} enrollments with progress + certificates.`);

  // ---------- Notifications (student) ----------
  for (const s of students) {
    await Notification.create({ userId: s._id, userModel: "Student", title: "Welcome to Bandhan Academy", message: "Start your learning journey today!", type: "system" });
  }

  // ---------- Reviews ----------
  await Review.create({ studentId: students[0]._id, courseId: courses[0]._id, rating: 5, review: "Excellent course, very practical!" });
  await Review.create({ studentId: students[3]._id, courseId: courses[1]._id, rating: 4, review: "Loved the lighting module." });
  await ReviewInstructor.create({ courseId: courses[0]._id, studentId: students[0]._id, instructorId: instructors[0]._id, rating: 5, review: "Priya is a great instructor.", instructorResponse: "" });

  console.log("Seed complete.");
  console.log("Login credentials -> password for all: " + PASS);
  instructors.forEach((i) => console.log("  Instructor:", i.email));
  students.forEach((s) => console.log("  Student:", s.email));

  await mongoose.disconnect();
}

seed().catch(async (e) => {
  console.error("Seed failed:", e);
  await mongoose.disconnect();
  process.exit(1);
});

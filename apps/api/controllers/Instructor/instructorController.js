
const bcrypt = require("bcryptjs");
const { validatePassword } = require("../../utils/validatePassword.js");
const jwt = require("jsonwebtoken");

const Instructor = require("../../models/instructor/Instructor.js");
const Course = require("../../models/student/Course.js");
const Enrollment = require("../../models/student/Enrollment.js");
const Progress = require("../../models/student/CourseProgress.js");

// ======== register instructor ========
exports.registerInstructor = async (req, res) => {
  try {

    const {
      fullName,
      email,
      password
    } = req.body;

    if (!fullName?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: passwordErrors[0],
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingInstructor =
      await Instructor.findOne({
        email: normalizedEmail
      });

    if (existingInstructor) {
      return res.status(409).json({
        success: false,
        message: "Instructor already exists"
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const instructor =
      await Instructor.create({
        fullName: fullName.trim(),
        email: normalizedEmail,
        password: hashedPassword
      });

    const token = jwt.sign(
      { id: instructor._id, role: "instructor" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "Instructor registered successfully",
      token,
      instructor: {
        _id: instructor._id,
        fullName: instructor.fullName,
        email: instructor.email,
        accountStatus: instructor.accountStatus,
        isProfileCompleted: instructor.isProfileCompleted,
        isVerified: instructor.isVerified
      }
    });

  } catch (error) {

    

    console.error("Error in Instructor/instructorController.js:", error);
return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ========= login instructor ========
exports.loginInstructor =async (req, res) => {

  try {

    const {
      email,
      password
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password required"
      });
    }

    const instructor =
      await Instructor
        .findOne({
          email:
            email.toLowerCase()
        })
        .select("+password");

    if (!instructor) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password"
      });
    }

    const isMatch =
      await bcrypt.compare(
        password,
        instructor.password
      );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password"
      });
    }

    const token =
      jwt.sign(
        {
          id: instructor._id,
          role: "instructor"
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d"
        }
      );

    res.status(200).json({
      success: true,
      message:
        "Login successful",

      token,

      instructor: {
        _id:
          instructor._id,
        fullName:
          instructor.fullName,
        email:
          instructor.email,
        accountStatus:
          instructor.accountStatus,
        isProfileCompleted:
          instructor.isProfileCompleted,
        isVerified:
          instructor.isVerified,
        profilePhoto:
          instructor.profilePhoto
      }
    });

  } catch (error) {
    console.error("Error in controllers/Instructor/instructorController.js:", error);


    res.status(500).json({
      success: false,
      message:
        "Server error"
    });
  }
};


// ===== setup profile =====
exports.updateProfile = async (req,res) => {
  try {

    const instructorId =
      req.user.id;

    const instructor =
      await Instructor.findById(
        instructorId
      );

    if (!instructor) {
      return res.status(404).json({
        success: false,
        message:
          "Instructor not found"
      });
    }

    const {
      fullName,
      headline,
      bio,
      linkedin,
      portfolio,
      website
    } = req.body;

    if (fullName)
      instructor.fullName =
        fullName;

    if (headline)
      instructor.headline =
        headline;

    if (bio)
      instructor.bio = bio;

    if (linkedin)
      instructor.linkedin =
        linkedin;

    if (portfolio)
      instructor.portfolio =
        portfolio;

    if (website)
      instructor.website =
        website;

    // expertise
    if (req.body.expertiseTags) {

      instructor.expertiseTags =
        typeof req.body
          .expertiseTags ===
        "string"
          ? JSON.parse(
              req.body
                .expertiseTags
            )
          : req.body
              .expertiseTags;
    }

    // languages
    if (req.body.languages) {

      instructor.languages =
        typeof req.body
          .languages ===
        "string"
          ? JSON.parse(
              req.body
                .languages
            )
          : req.body
              .languages;
    }

    // experience
    if (req.body.experience) {

      instructor.experience =
        typeof req.body
          .experience ===
        "string"
          ? JSON.parse(
              req.body
                .experience
            )
          : req.body
              .experience;
    }

    // profile photo
    if (req.file) {
      instructor.profilePhoto =
        req.file.path;
    }

    // completion
    const fields = [
      instructor.fullName,
      instructor.profilePhoto,
      instructor.headline,
      instructor.bio,
      instructor.linkedin,
      instructor.portfolio,
      instructor.website,
      instructor
        .expertiseTags
        ?.length,
      instructor
        .languages
        ?.length,
      instructor
        .experience
        ?.length
    ];

    const completed =
      fields.filter(
        Boolean
      ).length;

    instructor.profileCompletion =
      Math.round(
        (completed /
          fields.length) *
          100
      );

    instructor
      .isProfileCompleted =
      instructor
        .profileCompletion ===
      100;

    await instructor.save();

    return res.status(200).json({
      success: true,
      message:
        "Profile updated successfully",

      profileCompletion:
        instructor
          .profileCompletion,

      isProfileCompleted:
        instructor
          .isProfileCompleted,

      data: {
        _id:
          instructor._id,

        fullName:
          instructor.fullName,

        profilePhoto:
          instructor
            .profilePhoto,

        headline:
          instructor
            .headline,

        bio:
          instructor.bio,

        expertiseTags:
          instructor
            .expertiseTags,

        languages:
          instructor
            .languages,

        experience:
          instructor
            .experience,

        linkedin:
          instructor
            .linkedin,

        portfolio:
          instructor
            .portfolio,

        website:
          instructor
            .website
      }
    });

  } catch (error) {

    

    console.error("Error in Instructor/instructorController.js:", error);
return res.status(500).json({
      success: false,
      message:
        "Server error"
    });
  }
};


exports.getProfile =async (req, res) => {

  try {

    const instructor =
      await Instructor
        .findById(
          req.user.id
        )
        .select(
          "-password"
        );

    if (!instructor) {
      return res.status(404)
        .json({
          success: false,
          message:
            "Instructor not found"
        });
    }

    return res.status(200)
      .json({
        success: true,
        data: instructor
      });

  } catch (error) {

    

    console.error("Error in Instructor/instructorController.js:", error);
return res.status(500)
      .json({
        success: false,
        message:
          "Server error"
      });
  }
};



// ======== verification instructor =======

//       if (
//         req.files
//           ?.pan
//       ) {

//         instructor.documents.pan =
//           req.files
//             .pan[0]
//             .path;

//         instructor.verificationStatus.pan =
//           "pending";
//       }

//       if (
//         req.files
//           ?.academicDegree
//       ) {

//         instructor.documents.academicDegree =
//           req.files
//             .academicDegree[0]
//             .path;

//         instructor.verificationStatus.academicDegree =
//           "pending";
//       }

//       if (
//         req.files
//           ?.professionalCertificate
//       ) {

//         instructor.documents.professionalCertificate =
//           req.files
//             .professionalCertificate[0]
//             .path;

//         instructor.verificationStatus.professionalCertificate =
//           "pending";
//       }

//       let completed =
//         0;

//       if (
//         instructor
//           .documents
//           .aadhaar
//       )
//         completed++;

//       if (
//         instructor
//           .documents
//           .pan
//       )
//         completed++;

//       if (
//         instructor
//           .documents
//           .academicDegree
//       )
//         completed++;

//       if (
//         instructor
//           .documents
//           .professionalCertificate
//       )
//         completed++;

//       instructor.documentCompletion =
//         Math.round(
//           (
//             completed /
//             4
//           ) *
//             100
//         );

//       instructor.isDocumentSubmitted =
//         completed ===
//         4;

//       await instructor.save();

//       return res
//         .status(
//           200
//         )
//         .json({
//           success:
//             true,

//           message:
//             "Documents uploaded successfully",

//           data: {
//             documents:
//               instructor.documents,

//             verificationStatus:
//               instructor.verificationStatus,

//             documentCompletion:
//               instructor.documentCompletion,

//             isDocumentSubmitted:
//               instructor.isDocumentSubmitted
//           }
//         });

//     } catch (
//       error
//     ) {

//       console.log(
//         error
//       );

//       return res
//         .status(
//           500
//         )
//         .json({
//           success:
//             false,

//           message:
//             "Server error",

//           error
//         });
//     }
//   };
exports.uploadDocuments =async (req, res) => {

    try {

      console.log(req.files);

      const instructor =
        await Instructor.findById(
          req.user.id
        );

      if (!instructor) {

        return res
          .status(404)
          .json({
            success: false,
            message:
              "Instructor not found"
          });
      }

      // FIX OLD DATA

      if (
        !instructor.documents
      ) {

        instructor.documents = {

          aadhaar: "",

          pan: "",

          academicDegree: "",

          professionalCertificate:
            ""
        };
      }

      if (
        !instructor
          .verificationStatus
      ) {

        instructor.verificationStatus = {

          aadhaar:
            "pending",

          pan:
            "pending",

          academicDegree:
            "pending",

          professionalCertificate:
            "pending",

          overall:
            "pending"
        };
      }

      // AADHAAR

      if (
        req.files?.aadhaar
      ) {

        instructor.documents.aadhaar =
          req.files
            .aadhaar[0]
            .path;

        instructor
          .verificationStatus
          .aadhaar =
          "pending";
      }

      // PAN

      if (
        req.files?.pan
      ) {

        instructor.documents.pan =
          req.files
            .pan[0]
            .path;

        instructor
          .verificationStatus
          .pan =
          "pending";
      }

      // DEGREE

      if (
        req.files
          ?.academicDegree
      ) {

        instructor
          .documents
          .academicDegree =
          req.files
            .academicDegree[0]
            .path;

        instructor
          .verificationStatus
          .academicDegree =
          "pending";
      }

      // CERTIFICATE

      if (
        req.files
          ?.professionalCertificate
      ) {

        instructor
          .documents
          .professionalCertificate =
          req.files
            .professionalCertificate[0]
            .path;

        instructor
          .verificationStatus
          .professionalCertificate =
          "pending";
      }

      let completed =
        0;

      if (
        instructor
          .documents
          .aadhaar
      )
        completed++;

      if (
        instructor
          .documents
          .pan
      )
        completed++;

      if (
        instructor
          .documents
          .academicDegree
      )
        completed++;

      if (
        instructor
          .documents
          .professionalCertificate
      )
        completed++;

      instructor.documentCompletion =
        Math.round(
          (completed / 4)
          * 100
        );

      instructor.isDocumentSubmitted =
        completed ===
        4;

      await instructor.save();

      return res
        .status(200)
        .json({

          success: true,

          message:
            "Documents uploaded successfully",

          data: {

            documents:
              instructor.documents,

            verificationStatus:
              instructor.verificationStatus,

            documentCompletion:
              instructor.documentCompletion,

            isDocumentSubmitted:
              instructor.isDocumentSubmitted
          }
        });

    }
    catch (error) {

      console.log(error);

      return res
        .status(500)
        .json({

          success: false,

          message:
            "Server error",

          error
        });
    }
  };

exports.getDocuments =async (req, res) => {
    try {

      const instructor =
        await Instructor.findById(
          req.user.id
        );

      if (!instructor) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Instructor not found"
          });
      }

      return res
        .status(200)
        .json({
          success: true,

          data: {
            documents:
              instructor
                .documents,

            verificationStatus:
              instructor
                .verificationStatus,

            documentCompletion:
              instructor
                .documentCompletion,

            isDocumentSubmitted:
              instructor
                .isDocumentSubmitted
          }
        });

    } catch (error) {

      

      console.error("Error in Instructor/instructorController.js:", error);
return res
        .status(500)
        .json({
          success: false,
          message:
            "Server error"
        });
    }
  };


exports.getVerificationStatus =async (req, res) => {
  try {

    const instructor =
      await Instructor.findById(
        req.user.id
      );

    if (!instructor) {
      return res.status(404)
        .json({
          success: false,
          message:
            "Instructor not found"
        });
    }

    return res.status(200)
      .json({
        success: true,

        data: {
          verificationStatus:
            instructor
              .verificationStatus,

          isVerified:
            instructor
              .isVerified,

          verificationDate:
            instructor
              .verificationDate,

          rejectionReason:
            instructor
              .rejectionReason
        }
      });

  } catch (error) {

    

    console.error("Error in Instructor/instructorController.js:", error);
return res.status(500)
      .json({
        success: false,
        message:
          "Server error"
      });
  }
};

// ======== instructor earnings dashboard ========
exports.getEarnings = async (req, res) => {
  try {
    const instructorId = req.user.id;

    const courses = await Course.find({ instructorId });
    const courseIds = courses.map((c) => c._id);

    const enrollments = await Enrollment.find({ courseId: { $in: courseIds } });
    const totalRevenue = enrollments.length; // count of paid enrollments (proxy)
    const completed = enrollments.filter((e) => e.status === "completed").length;

    // Aggregate revenue from Payments linked to these courses
    const Payment = require("../../models/shared/Payment.js");
    const payments = await Payment.find({ courseId: { $in: courseIds }, status: "completed" });
    const grossRevenue = payments.reduce((sum, p) => sum + (p.totalAmount || p.amount || 0), 0);
    const platformFees = payments.reduce((sum, p) => sum + (p.platformFee || 0), 0);
    const netRevenue = grossRevenue - platformFees;

    const chart = {};
    payments.forEach((p) => {
      const key = new Date(p.createdAt).toISOString().slice(0, 7);
      chart[key] = (chart[key] || 0) + (p.totalAmount || p.amount || 0);
    });

    const byCourse = await Promise.all(
      courses.map(async (c) => {
        const cnt = await Enrollment.countDocuments({ courseId: c._id, status: "completed" });
        return { courseId: c._id, title: c.title, enrollments: cnt };
      })
    );

    res.json({
      success: true,
      earnings: {
        totalCourses: courses.length,
        totalEnrollments: enrollments.length,
        completedEnrollments: completed,
        grossRevenue,
        platformFees,
        netRevenue,
        pendingPayout: netRevenue,
        chart,
        byCourse
      }
    });
  } catch (error) {
    console.error("Error in controllers/Instructor/instructorController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ======== instructor toggle featured course ========
exports.toggleFeatured = async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.courseId, instructorId: req.user.id });
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    course.isFeatured = !course.isFeatured;
    await course.save();
    res.json({ success: true, isFeatured: course.isFeatured });
  } catch (error) {
    console.error("Error in controllers/Instructor/instructorController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ======== instructor issue certificate to a student ========
exports.issueCertificate = async (req, res) => {
  try {
    const { courseId, studentId } = req.params;
    const course = await Course.findOne({ _id: courseId, instructorId: req.user.id });
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    let progress = await Progress.findOne({ studentId, courseId });
    if (!progress) progress = await Progress.create({ studentId, courseId });

    const title = req.body.title || `${course.title} — Completion Certificate`;
    const already = progress.certificates.some((c) => c.title === title);
    if (already) return res.status(400).json({ success: false, message: "Certificate already issued" });

    progress.certificates.push({ title, pdfUrl: req.body.pdfUrl || "", issuedAt: new Date() });
    await progress.save();

    res.status(201).json({ success: true, certificate: progress.certificates[progress.certificates.length - 1] });
  } catch (error) {
    console.error("Error in controllers/Instructor/instructorController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getInstructorPageResources = async (req, res) => {
  try {
    const instructorId = req.user.id;

    const courses = await Course.find({ instructorId }).lean();
    const courseIds = courses.map((c) => c._id);

    const Payment = require("../../models/shared/Payment.js");
    const StudentCourseProgress = require("../../models/student/StudentCourseProgress.js");
    const ReviewInstructor = require("../../models/student/ReviewInstructor.js");

    const enrollments = await Enrollment.find({ courseId: { $in: courseIds } });
    const activeEnrollments = enrollments.filter((e) => e.status === "active").length;
    const completedEnrollments = enrollments.filter((e) => e.status === "completed").length;
    const stalledEnrollments = enrollments.length - activeEnrollments - completedEnrollments;

    const payments = await Payment.find({ courseId: { $in: courseIds }, status: "completed" });
    const grossRevenue = payments.reduce((sum, p) => sum + (p.totalAmount || p.amount || 0), 0);

    const dayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const dailyRevenue = {};
    const weeklyRevenue = {};
    payments.forEach((p) => {
      const d = new Date(p.createdAt);
      const day = dayLabels[d.getDay()];
      dailyRevenue[day] = (dailyRevenue[day] || 0) + (p.totalAmount || p.amount || 0);

      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const weekKey = weekStart.toISOString().slice(0, 10);
      weeklyRevenue[weekKey] = (weeklyRevenue[weekKey] || 0) + (p.totalAmount || p.amount || 0);
    });

    const earningsChart = {
      labels: dayLabels,
      values: dayLabels.map((d) => dailyRevenue[d] || 0),
    };

    const wkLabels = Object.keys(weeklyRevenue).sort();
    const wkValues = wkLabels.map((k) => Math.round((weeklyRevenue[k] / (grossRevenue || 1)) * 100));
    const totalRevenueFormatted = `₹${Math.round(grossRevenue / 1000)}k`;

    const totalLessons = courses.reduce(
      (sum, c) => sum + (c.curriculumSummary?.totalLessons || 0),
      0
    );
    const totalDuration = courses.reduce(
      (sum, c) => sum + (c.curriculumSummary?.totalDuration || c.estimatedDuration || 0),
      0
    );
    const avgWatchTime = totalLessons > 0 ? totalDuration / totalLessons : 0;

    const progressEntries = await StudentCourseProgress.find({
      courseId: { $in: courseIds },
    });
    const completionRates = progressEntries.map((p) => p.progressPercentage || 0);
    const avgCompletion =
      completionRates.length > 0
        ? Math.round(
            completionRates.reduce((s, v) => s + v, 0) / completionRates.length
          )
        : 0;
    const dropOffRate = avgCompletion > 0 ? 100 - avgCompletion : 0;
    const totalStudents = await Enrollment.countDocuments({ courseId: { $in: courseIds } });

    const allProgress = await StudentCourseProgress.find({
      courseId: { $in: courseIds },
      progressPercentage: { $gt: 0 },
    })
      .sort({ progressPercentage: -1 })
      .limit(5)
      .populate("courseId", "title")
      .lean();

    const topLessons = allProgress.map((p, i) => ({
      title: p.courseId?.title
        ? `${String(i + 1).padStart(2, "0")}. ${p.courseId.title}`
        : `Lesson ${i + 1}`,
      watch: `${(p.progressPercentage || 0) * 0.05}m`,
      completion: `${p.progressPercentage || 0}%`,
      result: (p.progressPercentage || 0) >= 80 ? "Excellent" : (p.progressPercentage || 0) >= 60 ? "Good" : "Average",
    }));

    const platformFee = 10;

    res.status(200).json({
      success: true,
      data: {
        tasks: [
          totalStudents > 0
            ? `Review ${Math.max(1, Math.round(totalStudents * 0.1))} learner assignments`
            : "Create your first course to get started",
          totalLessons > 0
            ? `Upload module ${Math.min(totalLessons, 5)} resources`
            : "Build your curriculum to see tasks here",
          completedEnrollments > 0
            ? `Reply to ${completedEnrollments} discussion questions`
            : "No pending discussions",
          activeEnrollments > 0
            ? "Confirm Friday live session agenda"
            : "Share your course to attract learners",
        ],
        todaySchedule: [],
        earningsChart,
        weeklyRevenue: {
          labels: wkLabels.length > 0 ? wkLabels : ["WK 1", "WK 2", "WK 3", "WK 4", "WK 5", "WK 6"],
          values: wkValues.length > 0 ? wkValues : [0, 0, 0, 0, 0, 0],
        },
        totalRevenueFormatted,
        watchTime: Math.round(avgWatchTime * 10) / 10,
        watchTimeChange: avgWatchTime > 0 ? `+${Math.round(avgWatchTime)}m` : "0m",
        watchTimeDistribution: [22, 35, 48, 60, 75, 96],
        dropOffRate,
        dropOffLesson: dropOffRate > 50 ? "Early lessons — high drop-off detected" : "No significant drop-off",
        topLessons: topLessons.length > 0 ? topLessons : [],
        studentSegments: {
          total: enrollments.length || 0,
          active: enrollments.length > 0 ? Math.round((activeEnrollments / enrollments.length) * 100) : 0,
          stalled: enrollments.length > 0 ? Math.round((stalledEnrollments / enrollments.length) * 100) : 0,
          completed: enrollments.length > 0 ? Math.round((completedEnrollments / enrollments.length) * 100) : 0,
        },
        bankAccount: null,
        nextPayout: null,
        platformFee,
      },
    });
  } catch (error) {
    console.error("Error in controllers/Instructor/instructorController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

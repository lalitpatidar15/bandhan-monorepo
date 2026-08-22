const Course = require("../../models/student/Course.js");
const Wishlist = require("../../models/shared/Wishlist.js");
const Enrollment = require("../../models/student/Enrollment.js");
const Quiz = require("../../models/student/Quiz.js");
const QuizResult = require("../../models/student/QuizResult.js");
const Progress = require("../../models/student/CourseProgress.js");
const Profile = require("../../models/shared/Profile.js");
const Notification = require("../../models/shared/Notification.js");
const Student = require("../../models/student/Student.js");
const Review = require("../../models/shared/Review.js");
const { validatePassword } = require("../../utils/validatePassword.js");
const Payment =require("../../models/shared/Payment.js");
const Instructor =require("../../models/instructor/Instructor.js");
const StudentCourseProgress = require("../../models/student/StudentCourseProgress.js");
const { getSetting } = require("../../services/configService.js");
const razorpay = require("../../config/razorpay.js");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ======== Register Student ========
exports.registerStudent =async(req,res)=>{
try{

const {
fullName,
email,
password
}=req.body;

if(
!fullName ||
!email ||
!password
){
return res.status(400)
.json({
success:false,
message:
"All fields required"
});
}

const passwordErrors = validatePassword(password);
if (passwordErrors.length > 0) {
return res.status(400).json({
success: false,
message: passwordErrors[0],
});
}

const existing=
await Student.findOne({
email:
email.toLowerCase()
});

if(existing){
return res.status(400)
.json({
success:false,
message:
"Student already exists"
});
}

const hashed=
await bcrypt.hash(
password,
10
);

const student=
await Student.create({

fullName,

email:
email.toLowerCase(),

password:
hashed

});

res.status(201)
.json({

success:true,

message:
"Student registered successfully",

student:{
_id:
student._id,

fullName:
student.fullName,

email:
student.email,

accountStatus:
student.accountStatus
}

});

}
catch(error){
  // console.error("Error in controllers/Student/courseController.js:", error);


res.status(500)
.json({
success:false,
message: "Server error"
});

}
};

// ======== Login Student ========
exports.loginStudent=async(req,res)=>{
try{

const {
email,
password
}=req.body;

if(
!email ||
!password
){
return res.status(400)
.json({
success:false,
message:
"Email and password required"
});
}

const student=
await Student.findOne({
email:
email.toLowerCase()
})
.select("+password");

if(!student){
return res.status(401)
.json({
success:false,
message:
"Invalid email or password"
});
}

const match=
await bcrypt.compare(
password,
student.password
);

if(!match){
return res.status(401)
.json({
success:false,
message:
"Invalid email or password"
});
}

const token=
jwt.sign(
{
id:
student._id,
role:
"student"
},
process.env.JWT_SECRET,
{
expiresIn:"7d"
}
);

res.status(200)
.json({

success:true,

message:
"Login successful",

token,

student:{

_id:
student._id,

fullName:
student.fullName,

email:
student.email,

profilePhoto:
student.profilePhoto,

enrolledCourses:
student.enrolledCourses.length,

wishlist:
student.wishlist.length
}

});

}
catch(error){
  // console.error("Error in controllers/Student/courseController.js:", error);


res.status(500)
.json({
success:false,
message: "Server error"
});

}
};

// ======= student -course markeplace=====
exports.getMarketplaceCourses = async (req, res) => {
  try {

    const {
      page = 1,
      limit = 12,
      search,
      category,
      level,
      minPrice,
      maxPrice,
      rating,
      sort
    } = req.query;

    const query = {
      status: "published",
      visibility: "public"
    };

    // Search
    if (search) {
      query.$or = [
        {
          title: {
            $regex: search,
            $options: "i"
          }
        },
        {
          subtitle: {
            $regex: search,
            $options: "i"
          }
        },
        {
          description: {
            $regex: search,
            $options: "i"
          }
        },
        {
          category: {
            $regex: search,
            $options: "i"
          }
        }
      ];
    }

    // Category
    if (category) {
      query.category = category;
    }

    // Level
    if (level) {
      query.level = level;
    }

    // Rating
    if (rating) {
      query.rating = {
        $gte: Number(rating)
      };
    }

    // Price
    if (minPrice || maxPrice) {

      query.$expr = {
        $and: []
      };

      if (minPrice) {
        query.$expr.$and.push({
          $gte: [
            {
              $ifNull: [
                "$pricing.finalPrice",
                "$price"
              ]
            },
            Number(minPrice)
          ]
        });
      }

      if (maxPrice) {
        query.$expr.$and.push({
          $lte: [
            {
              $ifNull: [
                "$pricing.finalPrice",
                "$price"
              ]
            },
            Number(maxPrice)
          ]
        });
      }
    }

    // Sorting
    let sortOption = {
      createdAt: -1
    };

    switch (sort) {

      case "popular":
        sortOption = {
          totalStudents: -1
        };
        break;

      case "rating":
        sortOption = {
          rating: -1
        };
        break;

      case "priceLow":
        sortOption = {
          "pricing.finalPrice": 1,
          price: 1
        };
        break;

      case "priceHigh":
        sortOption = {
          "pricing.finalPrice": -1,
          price: -1
        };
        break;

      case "newest":
        sortOption = {
          createdAt: -1
        };
        break;
    }

    const courses =
      await Course.find(query)

        .populate(
          "instructorId",
          "fullName profilePhoto headline"
        )

        .sort(sortOption)

        .skip(
          (Number(page) - 1) *
          Number(limit)
        )

        .limit(
          Number(limit)
        )

        .lean();

    const formattedCourses =
      courses.map(course => ({

        _id:
          course._id,

        thumbnail:
          course.thumbnail ||
          course.image ||
          "",

        category:
          course.category,

        title:
          course.title,

        subtitle:
          course.subtitle || "",

        instructor: {

          _id:
            course.instructorId?._id || null,

          fullName:
            course.instructorId?.fullName ||
            course.instructor ||
            "Unknown",

          profilePhoto:
            course.instructorId?.profilePhoto || "",

          headline:
            course.instructorId?.headline || ""
        },

        rating:
          course.rating || 0,

        totalReviews:
          course.totalReviews || 0,

        totalStudents:
          course.totalStudents || 0,

        level:
          course.level,

        language:
          course.language,

        duration:
          course.duration ||
          course.totalDuration ||
          course.estimatedDuration,

        totalLessons:
          course.totalLessons ||
          course.lessonsCount ||
          0,

        certificate:
          course.certificate || false,

        skills:
          course.skills || [],

        price:
          course.pricing?.finalPrice ??
          course.price ??
          0,

        oldPrice:
          course.pricing?.basePrice ??
          course.oldPrice ??
          0,

        discountPercentage:
          course.pricing?.discountPercentage ??
          0
      }));

    const totalCourses =
      await Course.countDocuments(
        query
      );

    const categories =
      await Course.distinct(
        "category",
        {
          status: "published",
          visibility: "public"
        }
      );

    return res.status(200).json({

      success: true,

      data: {

        courses:
          formattedCourses,

        filters: {

          categories,

          levels: [
            "Beginner",
            "Intermediate",
            "Advanced"
          ],

          durations: [
            "0-5 Hours",
            "5-20 Hours",
            "20+ Hours"
          ]
        },

        pagination: {

          currentPage:
            Number(page),

          totalPages:
            Math.ceil(
              totalCourses /
              Number(limit)
            ),

          totalCourses,

          hasNext:
            Number(page) <
            Math.ceil(
              totalCourses /
              Number(limit)
            ),

          hasPrev:
            Number(page) > 1
        }
      }
    });

  }
  catch (error) {

    console.log(error);

    return res.status(500).json({

      success: false,

      message:
        "Server error"
    });
  }
};


//     // Total Lessons
//     const totalLessons =
//       course.modules.reduce(
//         (sum, module) =>
//           sum +
//           (module.lessons?.length || 0),
//         0
//       );

//     // Total Duration
//     let totalDuration = 0;

//     course.modules.forEach(module => {
//       module.lessons.forEach(lesson => {
//         totalDuration +=
//           Number(
//             lesson.duration || 0
//           );
//       });
//     });

//     // Curriculum Format
//     const curriculum =
//       course.modules.map(module => ({

//         _id: module._id,

//         title: module.title,

//         totalLessons:
//           module.lessons.length,

//         duration:
//           module.lessons.reduce(
//             (a, l) =>
//               a +
//               Number(
//                 l.duration || 0
//               ),
//             0
//           ),

//         lessons:
//           module.lessons.map(
//             lesson => ({
//               _id: lesson._id,
//               title: lesson.title,
//               type: lesson.type,
//               duration:
//                 lesson.duration,
//               isPreview:
//                 lesson.isPreview ||
//                 false
//             })
//           )
//       }));

//     res.status(200).json({

//       success: true,

//       data: {

//         course: {

//           _id:
//             course._id,

//           title:
//             course.title,

//           subtitle:
//             course.subtitle || "",

//           category:
//             course.category,

//           topic:
//             course.topic || "",

//           description:
//             course.description,

//           thumbnail:
//             course.thumbnail ||
//             course.image ||
//             "",

//           trailerVideo:
//             course.trailerVideo ||
//             "",

//           level:
//             course.level,

//           language:
//             course.language,

//           rating:
//             course.rating || 0,

//           totalReviews:
//             course.totalReviews || 0,

//           totalStudents:
//             course.totalStudents || 0,

//           certificate:
//             course.certificate,

//           requirements:
//             course.requirements || [],

//           whatYouWillLearn:
//             course.whatYouWillLearn || [],

//           resources:
//             course.resources || []
//         },

//         instructor: {

//           _id:
//             course.instructorId?._id ||
//             null,

//           fullName:
//             course.instructorId?.fullName ||
//             course.instructor ||
//             "Unknown",

//           profilePhoto:
//             course.instructorId?.profilePhoto ||
//             "",

//           headline:
//             course.instructorId?.headline ||
//             "",

//           bio:
//             course.instructorId?.bio ||
//             ""
//         },

//         pricing: {
 
//   basePrice:
//     course.pricing?.basePrice ??
//     course.price ??
//     0,
 
//   finalPrice:
//     course.pricing?.finalPrice ??
//     course.price ??
//     0,
 
//   enableDiscount:
//     course.pricing?.enableDiscount ??
//     false,
 
//   discountPercentage:
//     course.pricing?.discountPercentage ??
//     0,
 
//   price:
//     course.pricing?.finalPrice ??
//     course.price ??
//     0,
 
//   oldPrice:
//     course.pricing?.basePrice ??
//     course.oldPrice ??
//     0
 
// },
 
// emi: {
 
//   enabled:
//     course.emi?.enabled ??
//     false,
 
//   plans:
//     course.emi?.plans ??
//     []
 
// },

//         includes: {

//           totalHours:
//             totalDuration,

//           downloadableResources:
//             course.resources
//               ?.length || 0,

//           certificate:
//             course.certificate,

//           lifetimeAccess:
//             true
//         },

//         stats: {

//           modules:
//             course.modules.length,

//           lessons:
//             totalLessons,

//           duration:
//             totalDuration
//         },

//         curriculum,

//         reviews,

//         relatedCourses:
//           relatedCourses.map(
//             c => ({
//               _id: c._id,
//               title: c.title,
//               thumbnail:
//                 c.thumbnail ||
//                 c.image ||
//                 "",
//               price:
//                 c.pricing
//                   ?.finalPrice ||
//                 c.price,
//               rating:
//                 c.rating,
//               totalStudents:
//                 c.totalStudents
//             })
//           ),

//         isEnrolled:
//           !!enrollment
//       }
//     });

//   }
//   catch (error) {
//   // console.error("Error in controllers/Student/courseController.js:", error);


//     res.status(500).json({
//       success: false,
//       message: "Server error"
//     });
//   }
// };
exports.getCourseDetails = async (req, res) => {

  try {

    // ================= COURSE =================

    const course =
      await Course.findOne({

        _id: req.params.courseId,

        $or: [

          {
            isPublished: true
          },

          {

            status: "published",

            visibility: "public"

          }

        ]

      })

        .populate(

          "instructorId",

          `
          fullName
          profilePhoto
          headline
          bio
          `
        );

    if (!course) {

      return res.status(404).json({

        success: false,

        message: "Course not found"

      });

    }

    // ================= ENROLLMENT =================

    let enrollment = null;

    if (req.user?.id) {

      enrollment =
        await Enrollment.findOne({

          studentId: req.user.id,

          courseId: course._id

        });

    }

    // ================= REVIEWS =================

    const reviews =
      await Review.find({

        courseId: course._id

      })

        .populate(

          "studentId",

          "fullName profilePhoto"

        )

        .sort({

          createdAt: -1

        });

    // ================= RELATED COURSES =================

    const relatedCourses =
      await Course.find({

        _id: {

          $ne: course._id

        },

        category:
          course.category,

        status: "published",

        visibility: "public"

      })

        .limit(4);

    // ================= STATS =================

    let totalLessons = 0;

    let totalDuration = 0;

    course.modules.forEach(module => {

      totalLessons +=
        module.lessons.length;

      module.lessons.forEach(lesson => {

        totalDuration +=
          Number(
            lesson.duration || 0
          );

      });

    });

    // ================= CURRICULUM =================

    const curriculum =
      course.modules.map(module => {

        const moduleUnlocked =
          enrollment
            ? enrollment.unlockedModules.some(
                item =>
                  item.toString() ===
                  module._id.toString()
              )
            : false;

        const lessons =
          module.lessons.map(lesson => {

            const completed =
              enrollment
                ? enrollment.completedLessons.some(
                    item =>
                      item.lessonId.toString() ===
                      lesson._id.toString()
                  )
                : false;

            const current =
              enrollment
                ? enrollment.currentLessonId?.toString() ===
                  lesson._id.toString()
                : false;

            return {

              _id:
                lesson._id,

              title:
                lesson.title,

              description:
                lesson.description,

              duration:
                lesson.duration,

              type:
                lesson.type,

              isPreview:
                lesson.isPreview ||

                false,

              completed,

              current,

              locked:
                !moduleUnlocked

            };

          });

        return {

          _id:
            module._id,

          title:
            module.title,

          order:
            module.order,

          locked:
            !moduleUnlocked,

          completed:
            enrollment
              ? enrollment.completedLessons.filter(
                  item =>
                    item.moduleId.toString() ===
                    module._id.toString()
                ).length ===
                module.lessons.length
              : false,

          totalLessons:
            module.lessons.length,

          duration:
            module.lessons.reduce(

              (sum, lesson) =>

                sum +

                Number(
                  lesson.duration || 0
                ),

              0

            ),

          lessons

        };

      });
    // ================= RESPONSE =================

    return res.status(200).json({

      success: true,

      data: {

        // ================= COURSE =================

        course: {

          _id:
            course._id,

          title:
            course.title,

          subtitle:
            course.subtitle || "",

          category:
            course.category,

          topic:
            course.topic || "",

          description:
            course.description || "",

          thumbnail:
            course.thumbnail ||
            course.image ||
            "",

          trailerVideo:
            course.trailerVideo || "",

          level:
            course.level,

          language:
            course.language,

          rating:
            course.rating || 0,

          totalReviews:
            course.totalReviews || 0,

          totalStudents:
            course.totalStudents || 0,

          certificate:
            course.certificate,

          requirements:
            course.requirements || [],

          whatYouWillLearn:
            course.whatYouWillLearn || [],

          resources:
            course.resources || []

        },

        // ================= INSTRUCTOR =================

        instructor: {

          _id:
            course.instructorId?._id || null,

          fullName:
            course.instructorId?.fullName ||
            course.instructor ||
            "Unknown",

          profilePhoto:
            course.instructorId?.profilePhoto || "",

          headline:
            course.instructorId?.headline || "",

          bio:
            course.instructorId?.bio || ""

        },

        // ================= PRICING =================

        pricing: {

          basePrice:
            course.pricing?.basePrice ??
            course.price ??
            0,

          finalPrice:
            course.pricing?.finalPrice ??
            course.price ??
            0,

          enableDiscount:
            course.pricing?.enableDiscount ??
            false,

          discountPercentage:
            course.pricing?.discountPercentage ??
            0,

          price:
            course.pricing?.finalPrice ??
            course.price ??
            0,

          oldPrice:
            course.pricing?.basePrice ??
            course.oldPrice ??
            0

        },

        // ================= EMI =================

        emi: {

          enabled:
            course.emi?.enabled ??
            false,

          plans:
            course.emi?.plans ??
            []

        },

        // ================= ENROLLMENT =================

        enrollment:

          enrollment ?

          {

            progressPercentage:
              enrollment.progressPercentage,

            currentModuleId:
              enrollment.currentModuleId,

            currentLessonId:
              enrollment.currentLessonId,

            unlockedModules:
              enrollment.unlockedModules,

            completedLessons:
              enrollment.completedLessons,

            status:
              enrollment.status,

            lastAccessedAt:
              enrollment.lastAccessedAt

          }

          :

          null,

        // ================= COURSE INFO =================

        includes: {

          totalHours:
            totalDuration,

          totalLessons,

          downloadableResources:
            course.resources?.length || 0,

          certificate:
            course.certificate,

          lifetimeAccess:
            true

        },

        // ================= STATS =================

        stats: {

          modules:
            course.modules.length,

          lessons:
            totalLessons,

          duration:
            totalDuration

        },

        // ================= CURRICULUM =================

        curriculum,

        // ================= REVIEWS =================

        reviews,

        // ================= RELATED =================

        relatedCourses:

          relatedCourses.map(item => ({

            _id:
              item._id,

            title:
              item.title,

            thumbnail:
              item.thumbnail ||
              item.image ||
              "",

            rating:
              item.rating ||

              0,

            totalStudents:
              item.totalStudents ||

              0,

            price:
              item.pricing?.finalPrice ??
              item.price ??
              0

          })),

        // ================= FLAGS =================

        isEnrolled:
          !!enrollment

      }

    });

  }

  catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message:
        "Server error"

    });

  }

};

exports.getStudentPageResources = async (req, res) => {
  try {
    const courses = await require("../../models/student/Course.js").find().select("category").lean();
    const uniqueCategories = ["All Topics", ...new Set(courses.map(c => c.category).filter(Boolean))];
    res.status(200).json({
      success: true,
      data: {
        categories: uniqueCategories,
        interests: ["UI/UX Design", "Development", "Marketing", "Data Science", "AI/ML", "Creative Writing"],
        cardTypes: [{ label: "Visa", value: "Visa" }, { label: "Mastercard", value: "Mastercard" }, { label: "Amex", value: "Amex" }],
        upiApps: ["Google Pay", "PhonePe", "Paytm", "Amazon Pay"],
        practiceSets: [
          { title: "UI/UX Aptitude Test", questions: 40, duration: "45 min", level: "Beginner" },
          { title: "Frontend Coding Drill", questions: 25, duration: "60 min", level: "Intermediate" },
          { title: "Marketing Case Quiz", questions: 30, duration: "35 min", level: "Beginner" },
        ],
        learningTracks: [
          "Design career roadmap",
          "Frontend developer path",
          "Business growth starter",
          "Productivity and focus",
        ],
      }
    });
  } catch (error) {
    // console.error("Error in controllers/Student/courseController.js:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};


// ========== checkout & payment ==========
exports.getCheckout = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    const instructor = course.instructorId
      ? await Instructor.findById(course.instructorId)
      : null;

    const subtotal =
      course.pricing?.finalPrice || course.price || 0;

    const platformFee = subtotal > 0 ? await getSetting("platformFee") : 0;

    const gst = Math.round(subtotal * await getSetting("gstRate"));

    const total = subtotal + platformFee + gst;

    res.status(200).json({
      success: true,

      data: {

        course: {

          _id: course._id,

          title: course.title,

          thumbnail: course.thumbnail,

          category: course.category

        },

        instructor: instructor
          ? {

              _id: instructor._id,

              fullName: instructor.fullName,

              profilePhoto: instructor.profilePhoto

            }
          : null,

        pricing: {

          subtotal,

          platformFee,

          gst,

          total

        },

        emi: course.emi?.enabled
          ? course.emi
          : {

              enabled: false,

              plans: []

            }

      }

    });

  } catch (error) {
    // console.error("Error in controllers/Student/courseController.js:", error);


    res.status(500).json({

      success: false,

      message: "Server error"

    });

  }
};

// CREATE ORDER
exports.createOrder = async (req, res) => {

  try {

    const { courseId } = req.params;

    const { paymentMethod, emiMonths } = req.body;

    const course = await Course.findById(courseId);

    if (!course) {

      return res.status(404).json({

        success: false,

        message: "Course not found"

      });

    }

    const subtotal =
      course.pricing?.finalPrice || course.price || 0;

    const platformFee = subtotal > 0 ? await getSetting("platformFee") : 0;

    const gst = Math.round(subtotal * await getSetting("gstRate"));

    const totalAmount = subtotal + platformFee + gst;

    let emiData = {

      enabled: false,

      months: 0,

      monthlyAmount: 0

    };

    if (paymentMethod === "emi") {

      if (!course.emi?.enabled || !Array.isArray(course.emi.plans) || course.emi.plans.length === 0) {
        return res.status(400).json({
          success: false,
          message: "EMI is not available for this course. Please choose card or UPI."
        });
      }

      const selectedPlan = course.emi.plans.find(
        (item) => item.months == emiMonths
      );

      if (!selectedPlan) {

        return res.status(400).json({

          success: false,

          message: "Invalid EMI Plan"

        });

      }

      emiData = {

        enabled: true,

        months: selectedPlan.months,

        monthlyAmount: selectedPlan.monthlyAmount

      };

    }

    if (!razorpay) {
      return res.status(503).json({ success: false, message: "Payment service not configured" });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount * 100,
      currency: "INR",
      receipt: "REC-" + Date.now(),
      payment_capture: 1
    });

    const payment = await Payment.create({

      studentId: req.user.id,

      courseId,

      subtotal,

      platformFee,

      gst,

      totalAmount,

      paymentMethod,

      emi: emiData,

      paymentGateway: "razorpay",

      orderId: razorpayOrder.id,

      status: "created"

    });

    res.status(201).json({

      success: true,

      message: "Order created successfully",

      data: {
        paymentId: payment._id,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: "INR",
        razorpayKey: process.env.RAZORPAY_KEY_ID,
        paymentMethod: payment.paymentMethod,
        paymentStatus: "pending"
      }

    });

  } catch (error) {
    // console.error("Error in controllers/Student/courseController.js:", error);


    res.status(500).json({

      success: false,

      message: "Server error"

    });

  }

};


//       const alreadyEnrolled =
//         enrollment.courses.some(
//           id => id.toString() === payment.courseId.toString()
//         );

//       if (!alreadyEnrolled) {

//         enrollment.courses.push(payment.courseId);

//         await enrollment.save();

//       }

//     }

//     await Course.findByIdAndUpdate(
//       payment.courseId,
//       {
//         $inc: {
//           totalStudents: 1
//         }
//       }
//     );

//     res.status(200).json({
//       success: true,
//       message: "Payment Verified",
//       data: {
//         paymentId: payment._id,
//         transactionId: payment.transactionId,
//         status: payment.status
//       }
//     });

//   } catch (error) {
  // console.error("Error in controllers/Student/courseController.js:", error);


//     res.status(500).json({
//       success: false,
//       message: "Server error"
//     });

//   }
// };
exports.verifyPayment = async (req, res) => {
  try {

    const { orderId, paymentId, signature } = req.body;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({
        success: false,
        message: "All fields are required."
      });
    }

    const payment = await Payment.findOne({
      studentId: req.user.id,
      orderId
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    if (payment.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Payment already verified"
      });
    }

    // Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(orderId + "|" + paymentId)
      .digest("hex");

    if (generatedSignature !== signature) {
      payment.status = "failed";
      await payment.save();
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature."
      });
    }

    if (!razorpay) {
      return res.status(503).json({ success: false, message: "Payment service not configured" });
    }

    const razorpayPayment = await razorpay.payments.fetch(paymentId);

    // Update Payment
    payment.status = "completed";
    payment.transactionId = paymentId;
    payment.signature = signature;
    payment.paymentMethod = razorpayPayment.method || payment.paymentMethod;
    payment.cardType = razorpayPayment.card?.network || "";
    payment.cardLast4 = razorpayPayment.card?.last4 || "";
    payment.bank = razorpayPayment.bank || "";
    payment.wallet = razorpayPayment.wallet || "";
    payment.vpa = razorpayPayment.vpa || "";
    payment.fee = razorpayPayment.fee || 0;
    payment.tax = razorpayPayment.tax || 0;
    payment.paidAt = new Date();

    await payment.save();

    // Course
    const course = await Course.findById(payment.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // Prevent Duplicate Enrollment
    let enrollment = await Enrollment.findOne({
      studentId: payment.studentId,
      courseId: payment.courseId
    });

    const createdEnrollment = !enrollment;
    if (createdEnrollment) {

      // First Module
      const firstModule =
        course.modules.length > 0
          ? course.modules[0]
          : null;

      // First Lesson
      const firstLesson =
        firstModule &&
        firstModule.lessons.length > 0
          ? firstModule.lessons[0]
          : null;

      enrollment =
        await Enrollment.create({

          studentId: payment.studentId,

          courseId: payment.courseId,

          paymentId: payment._id,

          progressPercentage: 0,

          currentModuleId:
            firstModule?._id || null,

          currentLessonId:
            firstLesson?._id || null,

          completedLessons: [],

          unlockedModules:
            firstModule
              ? [firstModule._id]
              : [],

          status: "active",

          lastAccessedAt:
            new Date()

        });

    }

    if (createdEnrollment) {
      await Student.findByIdAndUpdate(
        payment.studentId,
        { $addToSet: { enrolledCourses: payment.courseId } }
      );

      await Course.findByIdAndUpdate(
        payment.courseId,
        { $inc: { totalStudents: 1 } }
      );
    }

    res.status(200).json({

      success: true,

      message:
        "Payment verified successfully",

      paymentId:
        payment._id,

      orderId:
        payment.orderId,

      entityType:
        "course_payment",

      entityId:
        payment.courseId,

      amount:
        payment.totalAmount,

      currency:
        payment.currency || "INR",

      paymentMethod:
        payment.paymentMethod,

      paymentStatus:
        "paid",

      data: {

        paymentId:
          payment._id,

        orderId:
          payment.orderId,

        transactionId:
          payment.transactionId,

        enrollmentId:
          enrollment._id,

        courseId:
          payment.courseId,

        status:
          payment.status,

        paymentStatus:
          "paid"

      }

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message:
        "Server error"

    });

  }
};

// PAYMENT DETAILS
exports.getPayment = async (req, res) => {

  try {

    const payment = await Payment.findById(req.params.paymentId)

      .populate({
        path: "courseId",
        select: "title thumbnail instructorId",
        populate: {
          path: "instructorId",
          select: "fullName profilePhoto"
        }
      })

      .populate(
        "studentId",
        "name email"
      );

    if (!payment) {

      return res.status(404).json({

        success: false,

        message: "Payment not found"

      });

    }

    const paymentStatus = payment.status === "completed"
      ? "paid"
      : payment.status === "created"
        ? "pending"
        : payment.status;

    res.status(200).json({

      success: true,

      paymentId: payment._id,

      orderId: payment.orderId,

      entityType: "course_payment",

      entityId: payment.courseId?._id || payment.courseId,

      amount: payment.totalAmount,

      currency: payment.currency || "INR",

      paymentMethod: payment.paymentMethod,

      paymentStatus,

      data: {
        ...payment.toObject(),
        paymentStatus,
      }

    });

  } catch (error) {
    // console.error("Error in controllers/Student/courseController.js:", error);


    res.status(500).json({

      success: false,

      message: "Server error"

    });

  }

};

// ========== wishlist =======
exports.addToWishlist =async(req,res)=>{

try{

const course=
await Course.findById(
req.params.courseId
);

if(!course){
return res.status(404).json({
success:false,
message:"Course not found"
});
}

const exists=
await Wishlist.findOne({

studentId:
req.user.id,

courseId:
req.params.courseId

});

if(exists){
return res.status(400).json({
success:false,
message:
"Already in wishlist"
});
}

const wishlist=
await Wishlist.create({

studentId:
req.user.id,

courseId:
req.params.courseId

});

res.status(201).json({

success:true,

message:
"Course added to wishlist",

data:wishlist

});

}
catch(error){
  // console.error("Error in controllers/Student/courseController.js:", error);


res.status(500).json({

success:false,
message: "Server error"

});

}
};

// REMOVE
exports.removeFromWishlist =async(req,res)=>{

try{

await Wishlist.findOneAndDelete({

studentId:
req.user.id,

courseId:
req.params.courseId

});

res.status(200).json({

success:true,

message:
"Course removed from wishlist"

});

}
catch(error){
  // console.error("Error in controllers/Student/courseController.js:", error);


res.status(500).json({

success:false,
message: "Server error"

});

}
};

// GET
exports.getWishlist = async (req, res) => {
  try {

    const wishlist =
      await Wishlist.find({

        studentId: req.user.id

      })
      .populate({
  path: "courseId",
  select: `
    title
    subtitle
    thumbnail
    image
    category
    level
    rating
    totalStudents
    price
    oldPrice
    pricing
    language
    certificate
    totalReviews
    skills
    instructorId
  `,
  populate: {
    path: "instructorId",
    select: "fullName profilePhoto"
  }
});

    const courses =
      wishlist
      .filter(
        item => item.courseId
      )
      .map(
        item => ({

          wishlistId:
            item._id,

          courseId:
            item.courseId._id,

          title:
            item.courseId.title,

          subtitle:
            item.courseId.subtitle || "",

          thumbnail:
            item.courseId.thumbnail ||
            item.courseId.image ||
            "",
            instructor:
          item.courseId.instructorId?.fullName || "Instructor",
 
           instructorProfile:
           item.courseId.instructorId?.profilePhoto || "",

          category:
            item.courseId.category,

          level:
            item.courseId.level,

          language:
            item.courseId.language || "English",

          rating:
            item.courseId.rating || 0,

          totalReviews:
            item.courseId.totalReviews || 0,

          totalStudents:
            item.courseId.totalStudents || 0,

          certificate:
            item.courseId.certificate || false,

          skills:
            item.courseId.skills || [],

          price:
            item.courseId.pricing?.finalPrice ??
            item.courseId.price ??
            0,

          oldPrice:
            item.courseId.pricing?.basePrice ??
            item.courseId.oldPrice ??
            item.courseId.price ??
            0,

          discountPercentage:
            item.courseId.pricing?.discountPercentage ??
            0
        })
      );

    res.status(200).json({

      success: true,

      count:
        courses.length,

      data:
        courses

    });

  }
  catch (error) {
    // console.error("Error in controllers/Student/courseController.js:", error);


    res.status(500).json({

      success: false,

      message:
        "Server error"

    });
  }
};

//  ======== ENROLL COURSE ========
exports.enrollCourse = async (req, res) => {
  try {

    const course =
      await Course.findById(
        req.params.courseId
      );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    const coursePrice = Number(course.pricing?.finalPrice ?? course.price ?? 0);
    if (coursePrice > 0) {
      return res.status(400).json({
        success: false,
        message: "Complete payment before enrolling in this paid course."
      });
    }

    const existing =
      await Enrollment.findOne({
        studentId: req.user.id,
        courseId: req.params.courseId
      });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Already enrolled"
      });
    }

    const enrollment =
      await Enrollment.create({
        studentId: req.user.id,
        courseId: req.params.courseId,
        unlockedModules: [course.modules?.[0]?._id].filter(Boolean)
      });

    await Promise.all([
      Student.findByIdAndUpdate(req.user.id, { $addToSet: { enrolledCourses: course._id } }),
      Course.findByIdAndUpdate(course._id, { $inc: { totalStudents: 1 } })
    ]);

    const data =
      await Enrollment.findById(
        enrollment._id
      ).populate({
        path: "courseId",
        populate: { path: "instructorId", select: "fullName profilePhoto headline" }
      });

    res.status(201).json({
      success: true,
      message: "Course enrolled successfully",
      data
    });

  } catch (error) {
    // console.error("Error in controllers/Student/courseController.js:", error);


    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};

exports.getEnrollments = async (req, res) => {
  try {

    const enrollments = await Enrollment.find({
      studentId: req.user.id
    })
      .populate({
        path: "courseId",
        populate: {
          path: "instructorId",
          select: "fullName profilePhoto headline"
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments
    });

  } catch (error) {
    // console.error("Error in controllers/Student/courseController.js:", error);


    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};

exports.getEnrollment = async (req, res) => {
  try {

    const enrollment = await Enrollment.findOne({
      studentId: req.user.id,
      courseId: req.params.courseId
    }).populate({
      path: "courseId",
      populate: {
        path: "instructorId",
        select: "fullName profilePhoto headline"
      }
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found"
      });
    }

    res.status(200).json({
      success: true,
      data: enrollment
    });

  } catch (error) {
    // console.error("Error in controllers/Student/courseController.js:", error);


    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};

exports.removeEnrollment =async (req, res) => {

  try {

    const enrollment =
      await Enrollment.findOneAndDelete({
        studentId: req.user.id,
        courseId: req.params.courseId
      });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message:
          "Enrollment not found"
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Enrollment removed successfully"
    });

  } catch (error) {
    // console.error("Error in controllers/Student/courseController.js:", error);


    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};

// ======= STUDENT DASHBOARD PAGE ==========
exports.getStudentDashboard = async (req, res) => {
  try {

    const enrollments = await Enrollment.find({
      studentId: req.user.id
    })
      .populate({
        path: "courseId",
        populate: {
          path: "instructorId",
          select: "fullName profilePhoto headline"
        }
      });

    if (!enrollments.length) {

      return res.status(200).json({

        success: true,

        data: {

          totalCourses: 0,

          completedCourses: 0,

          inProgressCourses: 0,

          completionRate: 0,

          continueLearning: [],

          upcomingTasks: [],

          recentCourses: [],

          recommendedCourses: []

        }

      });

    }

    let completedCourses = 0;

    let inProgressCourses = 0;

    const continueLearning = [];

    const recentCourses = [];

    const upcomingTasks = [];

    // ================= LOOP =================

    for (const enrollment of enrollments) {

      const course = enrollment.courseId;

      if (!course) continue;

      if (enrollment.progressPercentage >= 100) {

        completedCourses++;

      } else {

        inProgressCourses++;

      }

      // ---------------- CURRENT MODULE ----------------

      const currentModule =
        (course.modules || []).find(
          (module) =>
            module._id.toString() ===
            enrollment.currentModuleId?.toString()
        );

      // ---------------- CURRENT LESSON ----------------

      let currentLesson = null;

      if (currentModule) {

        currentLesson =
          (currentModule.lessons || []).find(
            (lesson) =>
              lesson._id.toString() ===
              enrollment.currentLessonId?.toString()
          );

      }


      // ---------------- CONTINUE LEARNING ----------------

      continueLearning.push({

        _id: course._id,

        title: course.title,

        thumbnail:
          course.thumbnail ||
          course.image ||
          "",

        instructor: {
          _id: course.instructorId?._id || null,
          fullName: course.instructorId?.fullName || course.instructor || "Unknown",
          profilePhoto: course.instructorId?.profilePhoto || "",
          headline: course.instructorId?.headline || ""
        },

        progress:
          enrollment.progressPercentage,

        currentModuleId:
          enrollment.currentModuleId,

        currentLessonId:
          enrollment.currentLessonId,

        currentModule:
          currentModule?.title || "",

        currentLesson:
          currentLesson?.title || "",

        lastAccessedAt:
          enrollment.lastAccessedAt

      });

      // ---------------- RECENT ----------------


      recentCourses.push({

        _id: course._id,

        title: course.title,

        thumbnail:
          course.thumbnail ||
          course.image ||
          "",

        instructor: {
          _id: course.instructorId?._id || null,
          fullName: course.instructorId?.fullName || course.instructor || "Unknown",
          profilePhoto: course.instructorId?.profilePhoto || ""
        },

        progress:
          enrollment.progressPercentage

      });

      // ---------------- UPCOMING TASK ----------------

      if (currentModule && currentLesson) {

        upcomingTasks.push({

          courseId:
            course._id,

          courseTitle:
            course.title,

          moduleId:
            currentModule._id,

          moduleTitle:
            currentModule.title,

          lessonId:
            currentLesson._id,

          lessonTitle:
            currentLesson.title,

          lessonType:
            currentLesson.type,

          duration:
            currentLesson.duration,

          locked:
            false

        });

      }

    }

    // ================= COMPLETION =================

    const totalCourses =
      enrollments.length;

    const completionRate =
      totalCourses
        ? Math.round(
            (completedCourses /
              totalCourses) *
              100
          )
        : 0;

    // ================= RECOMMENDED =================

    const enrolledCourseIds = enrollments
      .filter((item) => item.courseId)
      .map((item) => item.courseId._id);

    const recommendedCourses =
      await Course.find({

        status: "published",

        visibility: "public",

        _id: {

          $nin: enrolledCourseIds
        }

      })

        .populate(
          "instructorId",
          "fullName profilePhoto headline"
        )

        .limit(6)
        .lean();

    // Normalize recommended courses for frontend
    const formattedRecommended = (recommendedCourses || []).map((c) => {
      const totalLectures = (c.modules || []).reduce(
        (sum, m) => sum + (m.lessons ? m.lessons.length : 0),
        0
      );

      return {
        _id: c._id,
        title: c.title,
        description: c.description || "",
        category: c.category || "Course",
        lectures: totalLectures ? `${totalLectures} Lectures` : "-",
        price: c.pricing?.finalPrice ?? c.price ?? 0,
        image: c.thumbnail || c.image || "",
        instructor: {
          _id: c.instructorId?._id || null,
          fullName: c.instructorId?.fullName || c.instructor || "Unknown",
          profilePhoto: c.instructorId?.profilePhoto || ""
        }
      };
    });

    // ================= RESPONSE =================

    res.status(200).json({

      success: true,

      data: {

        totalCourses,

        completedCourses,

        inProgressCourses,

        completionRate,

        continueLearning,

        recentCourses:
          recentCourses.reverse(),

        upcomingTasks,

        recommendedCourses: formattedRecommended

      }

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message:
        "Server error"

    });

  }

};

// ======= MY COURSES PAGE =========
exports.getMyCourses = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 9,
      status = "all",
      search = "",
      sort = "recent"
    } = req.query;

    page = Number(page);
    limit = Number(limit);

    // Get student enrollments
    let enrollments = await Enrollment.find({
      studentId: req.user.id
    })
      .populate({
        path: "courseId",
        populate: {
          path: "instructorId",
          select: "fullName profilePhoto"
        }
      });

    // remove deleted courses
    enrollments = enrollments.filter(item => item.courseId);

    // search
    if (search) {
      enrollments = enrollments.filter(item =>
        item.courseId.title
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    // filter
    if (status === "completed") {
      enrollments = enrollments.filter(
        item => item.progressPercentage >= 100
      );
    }

    if (status === "in-progress") {
      enrollments = enrollments.filter(
        item => item.progressPercentage < 100
      );
    }

    // sorting
    if (sort === "oldest") {
      enrollments.sort(
        (a, b) => a.createdAt - b.createdAt
      );
    }

    if (sort === "recent") {
      enrollments.sort(
        (a, b) => b.createdAt - a.createdAt
      );
    }

    if (sort === "progress") {
      enrollments.sort(
        (a, b) =>
          b.progressPercentage -
          a.progressPercentage
      );
    }

    const total = enrollments.length;

    const start = (page - 1) * limit;

    const end = start + limit;

    const data = enrollments
      .slice(start, end)
      .map(item => {

        const course = item.courseId;

        let lastLesson = "";

        if (
          course.modules &&
          course.modules.length >
            item.currentModule
        ) {
          const module =
            course.modules[item.currentModule];

          if (
            module.lessons &&
            module.lessons.length >
              item.currentLesson
          ) {
            lastLesson =
              module.lessons[
                item.currentLesson
              ].title;
          }
        }

        return {

          enrollmentId: item._id,

          courseId: course._id,

          title: course.title,

          thumbnail:
            course.thumbnail ||
            course.image,

          category: course.category,

          instructor:
            course.instructorId
              ? {
                  _id:
                    course.instructorId._id,
                  fullName:
                    course.instructorId
                      .fullName,
                  profilePhoto:
                    course.instructorId
                      .profilePhoto
                }
              : null,

          progress:
            item.progressPercentage,

          status:
            item.progressPercentage >= 100
              ? "completed"
              : "in-progress",

          completed:
            item.progressPercentage >= 100,

          lastLesson,

          totalModules:
            course.modules.length,

          totalLessons:
            course.modules.reduce(
              (sum, module) =>
                sum +
                module.lessons.length,
              0
            ),

          certificate:
            course.certificate,

          createdAt:
            item.createdAt
        };
      });

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(
        total / limit
      ),
      courses: data
    });

  } catch (error) {
    // console.error("Error in controllers/Student/courseController.js:", error);


    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};

exports.reviewCourse = async (req, res) => {
  try {

    const { courseId } = req.params;

    const { rating, review } = req.body;

    if (!rating) {
      return res.status(400).json({
        success: false,
        message: "Rating is required"
      });
    }

    // Course exists?
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // Student enrolled?
    const enrollment = await Enrollment.findOne({
      studentId: req.user.id,
      courseId
    });

    if (!enrollment) {
      return res.status(400).json({
        success: false,
        message: "You are not enrolled in this course"
      });
    }

    // Already reviewed?
    const alreadyReviewed = await Review.findOne({
      studentId: req.user.id,
      courseId
    });

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this course"
      });
    }

    // Create Review
    const newReview = await Review.create({
      studentId: req.user.id,
      courseId,
      rating,
      review
    });

    // Update Course Rating
    const reviews = await Review.find({ courseId });

    const totalRating = reviews.reduce(
      (sum, item) => sum + item.rating,
      0
    );

    const averageRating =
      totalRating / reviews.length;

    course.rating = averageRating.toFixed(1);

    course.totalReviews = reviews.length;

    await course.save();

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: newReview
    });

  } catch (error) {
    // console.error("Error in controllers/Student/courseController.js:", error);


    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};

// ================= COURSE PLAYER =================
exports.getCoursePlayer = async (req, res) => {

  try {

    const { courseId } = req.params;

    const course =
      await Course.findOne({

        _id: courseId,

        status: "published",

        visibility: "public"

      })

      .populate(
        "instructorId",
        "fullName profilePhoto headline bio"
      );

    if (!course) {

      return res.status(404).json({

        success: false,

        message: "Course not found"

      });

    }

    // ============================
    // TOTALS
    // ============================

    let totalLessons = 0;

    let completedLessons = 0;

    let totalDuration = 0;

    course.modules.forEach(module => {

      totalLessons += module.lessons.length;

      module.lessons.forEach(lesson => {

        totalDuration += Number(
          lesson.duration || 0
        );

      });

    });

    // ============================
    // FIRST MODULE
    // ============================

    const firstModule =
      course.modules.length
        ? course.modules[0]
        : null;

    const firstLesson =
      firstModule &&
      firstModule.lessons.length
        ? firstModule.lessons[0]
        : null;

    // ============================
    // SIDEBAR MODULES
    // ============================

    const modules =
      course.modules.map(module => {

        return {

          _id:
            module._id,

          title:
            module.title,

          order:
            module.order,

          completed:false,

          locked:false,

          totalLessons:
            module.lessons.length,

          duration:
            module.lessons.reduce(

              (sum, lesson) =>

                sum +

                Number(
                  lesson.duration || 0
                ),

              0

            ),

          lessons:

            module.lessons.map(

              lesson => ({

                _id:
                  lesson._id,

                title:
                  lesson.title,

                description:
                  lesson.description,

                duration:
                  lesson.duration,

                type:
                  lesson.type,

                videoUrl:
                  lesson.videoUrl || "",

                pdfUrl:
                  lesson.pdfUrl || "",

                preview:
                  lesson.isPreview,

                completed:false,

                current:
                  firstLesson &&
                  lesson._id.toString() ===
                  firstLesson._id.toString(),

                locked:false

              })

            )

        };

      });

    // ============================
    // RESOURCES
    // ============================

    let resources = [];

    if (firstLesson) {

      resources =
        firstLesson.resources || [];

    }

    // ============================
    // NAVIGATION
    // ============================

    let nextLesson = null;

    if (

      firstModule &&

      firstModule.lessons.length > 1

    ) {

      nextLesson = {

        _id:
          firstModule.lessons[1]._id,

        title:
          firstModule.lessons[1].title

      };

    }

    // ============================
    // RESPONSE
    // ============================

    return res.status(200).json({

      success:true,

      data:{

        course:{

          _id:
            course._id,

          title:
            course.title,

          subtitle:
            course.subtitle,

          thumbnail:
            course.thumbnail ||

            course.image ||

            "",

          description:
            course.description,

          category:
            course.category,

          level:
            course.level,

          language:
            course.language,

          certificate:
            course.certificate

        },

        instructor:{

          _id:
            course.instructorId?._id,

          fullName:
            course.instructorId?.fullName ||

            "",

          profilePhoto:
            course.instructorId?.profilePhoto ||

            "",

          headline:
            course.instructorId?.headline ||

            "",

          bio:
            course.instructorId?.bio ||

            ""

        },

        progress:{

          completedLessons,

          totalLessons,

          percentage:0

        },

        stats:{

          totalModules:
            course.modules.length,

          totalLessons,

          totalDuration

        },

        currentModule:{

          _id:
            firstModule?._id ||

            null,

          title:
            firstModule?.title ||

            ""

        },

        currentLesson:

          firstLesson ?

          {

            _id:
              firstLesson._id,

            title:
              firstLesson.title,

            description:
              firstLesson.description,

            duration:
              firstLesson.duration,

            type:
              firstLesson.type,

            videoUrl:
              firstLesson.videoUrl ||

              "",

            pdfUrl:
              firstLesson.pdfUrl ||

              "",

            overview:
              firstLesson.description ||

              "",

            notes:[],

            discussion:[],

            resources

          }

          :

          null,

        modules,

        navigation:{

          previousLesson:null,

          nextLesson

        }

      }

    });

  }

  catch(error){

    console.log(error);

    return res.status(500).json({

      success:false,

      message: "Server error"

    });

  }

};

exports.completeLesson = async (req, res) => {

  try {

    const { courseId, lessonId } = req.params;

    const enrollment =
      await Enrollment.findOne({
        studentId: req.user.id,
        courseId
      });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found"
      });
    }

    const course =
      await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    let foundModule = null;
    let foundLesson = null;

    let moduleIndex = -1;
    let lessonIndex = -1;

    // ================= FIND LESSON =================

    for (let i = 0; i < course.modules.length; i++) {

      const module = course.modules[i];

      const index =
        module.lessons.findIndex(
          lesson =>
            lesson._id.toString() ===
            lessonId
        );

      if (index !== -1) {

        foundModule = module;
        foundLesson = module.lessons[index];

        moduleIndex = i;
        lessonIndex = index;

        break;
      }
    }

    if (!foundLesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found"
      });
    }

    // ================= ALREADY COMPLETED =================

    const alreadyCompleted =
      enrollment.completedLessons.some(
        item =>
          item.lessonId.toString() ===
          lessonId
      );

    if (!alreadyCompleted) {

      enrollment.completedLessons.push({

        moduleId: foundModule._id,

        lessonId: foundLesson._id,

        completedAt: new Date()

      });

    }

    // ================= NEXT LESSON =================

    let nextLesson = null;
    let nextModule = null;

    // Same Module

    if (
      lessonIndex + 1 <
      foundModule.lessons.length
    ) {

      nextLesson =
        foundModule.lessons[
          lessonIndex + 1
        ];

      nextModule =
        foundModule;

    }

    // Next Module

    else if (
      moduleIndex + 1 <
      course.modules.length
    ) {

      nextModule =
        course.modules[
          moduleIndex + 1
        ];

      nextLesson =
        nextModule.lessons[0];

      // unlock next module

      const unlocked =
        enrollment.unlockedModules.some(
          item =>
            item.toString() ===
            nextModule._id.toString()
        );

      if (!unlocked) {

        enrollment.unlockedModules.push(
          nextModule._id
        );

      }

    }

    // ================= UPDATE POINTER =================

    if (nextLesson) {

      enrollment.currentModuleId =
        nextModule._id;

      enrollment.currentLessonId =
        nextLesson._id;

    }

    // ================= PROGRESS =================

    let totalLessons = 0;

    course.modules.forEach(module => {

      totalLessons +=
        module.lessons.length;

    });

    enrollment.progressPercentage =
      Math.round(
        (
          enrollment.completedLessons.length /
          totalLessons
        ) * 100
      );

    if (
      enrollment.progressPercentage >= 100
    ) {

      enrollment.progressPercentage = 100;

      enrollment.status = "completed";

      enrollment.completedAt =
        new Date();

      // Issue certificate on course completion
      try {
        let progress = await Progress.findOne({ studentId: req.user.id, courseId });
        if (!progress) {
          progress = await Progress.create({ studentId: req.user.id, courseId });
        }
        const already = progress.certificates.some(
          (c) => c.title === course.title
        );
        if (!already) {
          progress.certificates.push({
            title: `${course.title} — Completion Certificate`,
            pdfUrl: "",
            issuedAt: new Date()
          });
          await progress.save();
        }
      } catch (certErr) {
        console.error("Certificate issuance failed:", certErr.message);
      }

    }

    enrollment.lastAccessedAt =
      new Date();

    await enrollment.save();

    return res.status(200).json({

      success: true,

      message:
        "Lesson completed successfully",

      data: {

        progress:
          enrollment.progressPercentage,

        completedLessons:
          enrollment.completedLessons.length,

        currentModuleId:
          enrollment.currentModuleId,

        currentLessonId:
          enrollment.currentLessonId,

        nextLesson:

          nextLesson ?

          {

            _id:
              nextLesson._id,

            title:
              nextLesson.title,

            type:
              nextLesson.type

          }

          :

          null,

        completed:
          enrollment.status ===
          "completed"

      }

    });

  }

  catch (error) {

    

    console.error("Error in Student/courseController.js:", error);
return res.status(500).json({

      success: false,

      message:
        "Server error"

    });

  }

};

exports.changeLesson = async (req, res) => {

  try {

    const { courseId, lessonId } = req.params;

    const enrollment =
      await Enrollment.findOne({
        studentId: req.user.id,
        courseId
      });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found"
      });
    }

    const course =
      await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    let currentModule = null;
    let currentLesson = null;

    let moduleIndex = -1;
    let lessonIndex = -1;

    // ================= FIND LESSON =================

    for (let i = 0; i < course.modules.length; i++) {

      const module = course.modules[i];

      const index =
        module.lessons.findIndex(
          lesson =>
            lesson._id.toString() ===
            lessonId
        );

      if (index !== -1) {

        currentModule = module;
        currentLesson = module.lessons[index];

        moduleIndex = i;
        lessonIndex = index;

        break;
      }
    }

    if (!currentLesson) {

      return res.status(404).json({

        success: false,

        message: "Lesson not found"

      });

    }

    // ================= SAVE CURRENT POSITION =================

    enrollment.currentModuleId =
      currentModule._id;

    enrollment.currentLessonId =
      currentLesson._id;

    enrollment.lastAccessedAt =
      new Date();

    await enrollment.save();

    // ================= PREVIOUS LESSON =================

    let previousLesson = null;

    if (lessonIndex > 0) {

      previousLesson =
        currentModule.lessons[
          lessonIndex - 1
        ];

    } else if (moduleIndex > 0) {

      const previousModule =
        course.modules[moduleIndex - 1];

      previousLesson =
        previousModule.lessons[
          previousModule.lessons.length - 1
        ];

    }

    // ================= NEXT LESSON =================

    let nextLesson = null;

    if (
      lessonIndex <
      currentModule.lessons.length - 1
    ) {

      nextLesson =
        currentModule.lessons[
          lessonIndex + 1
        ];

    } else if (
      moduleIndex <
      course.modules.length - 1
    ) {

      const nextModule =
        course.modules[moduleIndex + 1];

      nextLesson =
        nextModule.lessons[0];

    }

    // ================= RESOURCES =================

    const resources =
      currentLesson.resources || [];

    // ================= RESPONSE =================

    return res.status(200).json({

      success: true,

      data: {

        module: {

          _id:
            currentModule._id,

          title:
            currentModule.title

        },

        lesson: {

          _id:
            currentLesson._id,

          title:
            currentLesson.title,

          description:
            currentLesson.description,

          type:
            currentLesson.type,

          duration:
            currentLesson.duration,

          videoUrl:
            currentLesson.videoUrl ||

            "",

          pdfUrl:
            currentLesson.pdfUrl ||

            "",

          mcqData:
            currentLesson.mcqData ||

            null,

          quiz:
            currentLesson.quiz ||

            null,

          resources

        },

        previousLesson:

          previousLesson ?

          {

            _id:
              previousLesson._id,

            title:
              previousLesson.title

          }

          :

          null,

        nextLesson:

          nextLesson ?

          {

            _id:
              nextLesson._id,

            title:
              nextLesson.title

          }

          :

          null,

        progress:
          enrollment.progressPercentage

      }

    });

  }

  catch (error) {

    

    console.error("Error in Student/courseController.js:", error);
return res.status(500).json({

      success: false,

      message:
        "Server error"

    });

  }

};

exports.getLessonResources = async (req, res) => {

  try {

    const { courseId, lessonId } = req.params;

    const enrollment =
      await Enrollment.findOne({
        studentId: req.user.id,
        courseId
      });

    if (!enrollment) {

      return res.status(404).json({

        success: false,

        message: "Enrollment not found"

      });

    }

    const course =
      await Course.findById(courseId);

    if (!course) {

      return res.status(404).json({

        success: false,

        message: "Course not found"

      });

    }

    let lesson = null;

    for (const module of course.modules) {

      const found =
        module.lessons.find(
          item =>
            item._id.toString() ===
            lessonId
        );

      if (found) {

        lesson = found;

        break;

      }

    }

    if (!lesson) {

      return res.status(404).json({

        success: false,

        message: "Lesson not found"

      });

    }

    const resources =
      lesson.resources.map(file => ({

        _id:
          file._id,

        name:
          file.name,

        fileName:
          file.fileName,

        fileUrl:
          file.fileUrl,

        fileType:
          file.fileType,

        fileSize:
          file.fileSize,

        uploadedAt:
          file.uploadedAt

      }));

    return res.status(200).json({

      success: true,

      count:
        resources.length,

      data:
        resources

    });

  }

  catch (error) {

    

    console.error("Error in Student/courseController.js:", error);
return res.status(500).json({

      success: false,

      message:
        "Server error"

    });

  }

};


// ===== create quiz =====
exports.createQuiz = async (req, res) => {
  try {

    const {
      courseId,
      moduleId,
      lessonId,
      questions
    } = req.body;

    const quiz = await Quiz.create({
      ...req.body,
      totalQuestions: questions.length
    });

    res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      data: quiz
    });

  } catch (error) {
    // console.error("Error in controllers/Student/courseController.js:", error);


    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};

// ====== quiz ======
exports.getQuizForStudent = async (req, res) => {
  try {

    const quiz = await Quiz.findOne({
      lessonId: req.params.lessonId
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found"
      });
    }

    res.status(200).json({
      success: true,
      data: quiz
    });

  } catch (error) {
    // console.error("Error in controllers/Student/courseController.js:", error);


    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};


exports.submitQuiz = async (req, res) => {
  try {

    const { studentId, answers } =
      req.body;

    const quiz =
      await Quiz.findById(
        req.params.quizId
      );

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found"
      });
    }

    const existingResult =
      await QuizResult.findOne({
        studentId,
        quizId: quiz._id
      });

    if (existingResult) {
      return res.status(400).json({
        success: false,
        message:
          "Quiz already submitted"
      });
    }

    let score = 0;

    const evaluatedAnswers = [];

    quiz.questions.forEach(
      (question) => {

        const submittedAnswer =
          answers.find(
            (answer) =>
              String(
                answer.questionId
              ) ===
              String(
                question._id
              )
          );

        if (!submittedAnswer)
          return;

        const correctOption =
          question.options.find(
            (option) =>
              option.isCorrect
          );

        const isCorrect =
          String(
            correctOption._id
          ) ===
          String(
            submittedAnswer.selectedOptionId
          );

        if (isCorrect) {
          score++;
        }

        evaluatedAnswers.push({
          questionId:
            question._id,

          selectedOptionId:
            submittedAnswer.selectedOptionId,

          isCorrect
        });
      }
    );

    const totalMarks =
      quiz.questions.length;

    const percentage =
      (score / totalMarks) * 100;

    const passed =
      percentage >=
      quiz.passingMarks;

    const result =
      await QuizResult.create({
        quizId: quiz._id,
        studentId,
        answers:
          evaluatedAnswers,
        score,
        totalMarks,
        percentage,
        passed
      });

    res.status(200).json({
      success: true,
      message:
        "Quiz submitted successfully",
      data: result
    });

  } catch (error) {
    // console.error("Error in controllers/Student/courseController.js:", error);


    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};

exports.getQuizResult = async ( req, res) => {
  try {

    const {
      studentId,
      quizId
    } = req.params;

    const result =
      await QuizResult.findOne({
        studentId,
        quizId
      }).populate(
        "studentId",
        "fullName email"
      );

    if (!result) {
      return res.status(404).json({
        success: false,
        message:
          "Result not found"
      });
    }

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    // console.error("Error in controllers/Student/courseController.js:", error);


    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};

// ==== create progress =====


exports.createProgress = async (req, res) => {
  try {

    const progress = await Progress.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Progress created successfully",
      data: progress
    });

  } catch (error) {

    

    console.error("Error in Student/courseController.js:", error);
return res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};


// ==== progress & certificates =====

exports.getProgress = async (req, res) => {
  try {
  
    const id = req.params.studentId || req.params.id;
  
    let progress = await Progress.findById(id);
  
    if (!progress) {
      progress = await Progress.findOne({ studentId: id });
    }
 
    if (!progress) {
      progress = await Progress.create({
        studentId: id,
        statistics: {
          coursesCompleted: 0,
          coursesInProgress: 0,
          overallProgress: 0,
          totalLearningHours: 0
        },
        recentlyCompleted: [],
        completedCourses: [],
        certificates: []
      });
    }
 
    res.status(200).json({
      success: true,
      data: progress
    });
 
  } catch (error) {
    // console.error("Error in controllers/Student/courseController.js:", error);

 
    res.status(500).json({
      success: false,
      message: "Server error"
    });
 
  }
};
 

exports.downloadCertificate = async ( req, res) => {
  try {

    const progress = await Progress.findOne({
      studentId: req.params.studentId
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress not found"
      });
    }

    const certificate =
      progress.certificates.id(
        req.params.certificateId
      );

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found"
      });
    }

    return res.status(200).json({
      success: true,
      title: certificate.title,
      pdfUrl: certificate.pdfUrl
    });

  } catch (error) {

    

    console.error("Error in Student/courseController.js:", error);
return res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};


// ===== profile ====== 

exports.createProfile = async (req, res) => {
  try {

    const existingProfile = await Profile.findOne({
      userId: req.user.id
    });

    // ===== PROFILE EXISTS =====
    if (existingProfile) {

      return res.status(400).json({
        success: false,
        message: "Profile already created"
      });
    }

    // ===== CREATE =====
    const profile = await Profile.create({

      userId: req.user.id,

      ...req.body
    });

    res.json({
      success: true,

      message: "Profile created successfully",

      profile: {

        profileId: profile._id,

        userId: profile.userId,

        profilePhoto: profile.profilePhoto,

        coverPhoto: profile.coverPhoto,

        fullName: profile.fullName,

        username: profile.username,

        bio: profile.bio,

        email: profile.email,

        contactNumber: profile.contactNumber,

        city: profile.city,

        state: profile.state,

        country: profile.country,

        profileCompleted: profile.profileCompleted,

        createdAt: profile.createdAt
      }
    });

  } catch (error) {
    // console.error("Error in controllers/Student/courseController.js:", error);


    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};



// ===== GET PROFILE =====
exports.getProfile = async (req, res) => {
  try {

    const profile = await Profile.findOne({
      userId: req.user.id
    });

    if (!profile) {

      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    res.json({
      success: true,
      profile
    });

  } catch (error) {
    // console.error("Error in controllers/Student/courseController.js:", error);


    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};



// ===== UPDATE PROFILE =====
exports.updateProfile = async (req, res) => {
  try {

    const profile = await Profile.findOneAndUpdate(

      {
        userId: req.user.id
      },

      {
        $set: req.body
      },

      {
        new: true
      }
    );

    if (!profile) {

      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      profile
    });

  } catch (error) {
    // console.error("Error in controllers/Student/courseController.js:", error);


    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};



// ===== DELETE PROFILE =====
exports.deleteProfile = async (req, res) => {
  try {

    const profile = await Profile.findOneAndDelete({
      userId: req.user.id
    });

    if (!profile) {

      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    res.json({
      success: true,
      message: "Profile deleted successfully"
    });

  } catch (error) {
    // console.error("Error in controllers/Student/courseController.js:", error);


    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};

// ========= notifications =========
exports.createNotification = async (req, res) => {

  try {

    const {

      title,

      message,

      type

    } = req.body;

    if (!title || !message) {

      return res.status(400).json({

        success: false,

        message:
          "Title and message are required"

      });

    }

    const notification =
      await Notification.create({

        userId:
          req.user.id,

        userModel: "Student",

        title,

        message,

        type:
          type || "system"

      });

    res.status(201).json({

      success: true,

      message:
        "Notification created successfully",

      data: {

        notificationId:
          notification._id,

        userId:
          notification.userId,

        title:
          notification.title,

        message:
          notification.message,

        type:
          notification.type,

        isRead:
          notification.isRead,

        createdAt:
          notification.createdAt

      }

    });

  }

  catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message:
        "Server error"

    });

  }

};


exports.getNotifications = async (req, res) => {
  try {

    const { type = "all" } = req.query;

    // ================= FILTER =================

    const query = {
      userId: req.user.id
    };

    if (type !== "all") {
      query.type = type;
    }

    // ================= NOTIFICATIONS =================

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 });

    // ================= COUNTS =================

    const totalNotifications = await Notification.countDocuments({
      userId: req.user.id
    });

    const unreadCount = await Notification.countDocuments({
      userId: req.user.id,
      isRead: false
    });

    // ================= LEARNING PROGRESS =================

    const enrollments = await Enrollment.find({
      studentId: req.user.id
    }).populate("courseId", "title thumbnail");

    const learningProgress = enrollments.map(item => ({

      courseId:
        item.courseId?._id,

      courseName:
        item.courseId?.title || "",

      thumbnail:
        item.courseId?.thumbnail || "",

      progress:
        item.progressPercentage || 0

    }));

    // ================= FORMAT =================

    const formattedNotifications =
      notifications.map(item => ({

        notificationId:
          item._id,

        title:
          item.title,

        message:
          item.message,

        type:
          item.type,

        isRead:
          item.isRead,

        courseId:
          item.courseId || null,

        redirectUrl:
          item.redirectUrl || "",

        icon:
          item.icon || "",

        createdAt:
          item.createdAt

      }));

    // ================= RESPONSE =================

    res.status(200).json({

      success: true,

      data: {

        totalNotifications,

        unreadCount,

        learningProgress,

        notifications:
          formattedNotifications

      }

    });

  }

  catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message:
        "Server error"

    });

  }

};


// ===== MARK AS READ =====
exports.markAsRead = async (req, res) => {
  try {

    const notification =
      await Notification.findOne({

        _id: req.params.id,

        userId: req.user.id

      });

    if (!notification) {

      return res.status(404).json({

        success: false,

        message: "Notification not found"

      });

    }

    if (notification.isRead) {

      return res.status(200).json({

        success: true,

        message: "Notification already marked as read",

        data: {

          notificationId:
            notification._id,

          isRead:
            notification.isRead

        }

      });

    }

    notification.isRead = true;

    await notification.save();

    res.status(200).json({

      success: true,

      message: "Notification marked as read",

      data: {

        notificationId:
          notification._id,

        isRead:
          notification.isRead

      }

    });

  }

  catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message: "Server error"

    });

  }

};

// ================= MARK ALL NOTIFICATIONS AS READ =================

exports.markAllAsRead = async (req, res) => {

  try {

    const result =
      await Notification.updateMany(

        {

          userId: req.user.id,

          isRead: false

        },

        {

          $set: {

            isRead: true

          }

        }

      );

    res.status(200).json({

      success: true,

      message: "All notifications marked as read",

      data: {

        modifiedCount:
          result.modifiedCount

      }

    });

  }

  catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message: "Server error"

    });

  }

};


// ===== DELETE NOTIFICATION =====
exports.deleteNotification = async (req, res) => {

  try {

    const notification =
      await Notification.findOne({

        _id: req.params.id,

        userId: req.user.id

      });

    if (!notification) {

      return res.status(404).json({

        success: false,

        message: "Notification not found"

      });

    }

    await Notification.findByIdAndDelete(
      notification._id
    );

    res.status(200).json({

      success: true,

      message:
        "Notification deleted successfully",

      data: {

        notificationId:
          notification._id

      }

    });

  }

  catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message:
        "Server error"

    });

  }

};

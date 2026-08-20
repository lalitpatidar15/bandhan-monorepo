const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Course = require("../../models/student/Course.js");
const CoursePerformance = require("../../models/student/CoursePerformance.js");
const ReviewInstructor = require("../../models/student/ReviewInstructor.js");
const Student = require("../../models/student/Student.js");
const StudentCourseProgress =require("../../models/student/StudentCourseProgress.js");

// ====== instructor overview (all courses) =====
exports.getInstructorOverview = async (req, res) => {
  try {
    const instructorId = req.user.id;

    const courses = await Course.find({ instructorId })
      .select("title category status totalStudents rating updatedAt pricing curriculumSummary")
      .lean();

    res.status(200).json({
      success: true,
      data: { courses }
    });
  } catch (error) {
    console.error("Error in controllers/Instructor/instructordashboardController.js:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ======course performance ===
exports.getInstructorDashboard =async(req,res)=>{
try{

const performance =
await CoursePerformance.findOne({
    courseId:req.params.courseId
});

if(!performance){
  const course = await Course.findOne({
    _id: req.params.courseId,
    instructorId: req.user.id,
  });

  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found"
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      overview: {
        totalStudents: 0,
        totalStudentsChange: "0%",
        completionRate: 0,
        completionRateChange: "0%",
        totalRevenue: 0,
        totalRevenueChange: "0%",
        averageRating: 0,
        averageRatingChange: "Stable"
      },
      enrollmentTrends: [],
      engagement: {
        videoMinutes: 0,
        assignmentMinutes: 0,
        averageWatchTime: 0
      },
      recentActivities: [],
      studentSnapshots: [],
      quickActions: [
        {
          title: "Edit Course",
          route: "/edit-course"
        },
        {
          title: "Add Lesson",
          route: "/lesson"
        },
        {
          title: "View Reviews",
          route: "/reviews"
        },
        {
          title: "Update Pricing",
          route: "/pricing"
        }
      ]
    }
  });
}

res.status(200).json({

success:true,

data:{

overview:{
 totalStudents:
 performance.totalStudents,

 totalStudentsChange:
 performance.totalStudentsChange,

 completionRate:
 performance.completionRate,

 completionRateChange:
 performance.completionRateChange,

 totalRevenue:
 performance.totalRevenue,

 totalRevenueChange:
 performance.totalRevenueChange,

 averageRating:
 performance.averageRating,

 averageRatingChange:
 performance.averageRatingChange
},

enrollmentTrends:
performance.enrollmentTrends,

engagement:
performance.engagement,

recentActivities:
performance.recentActivities,

studentSnapshots:
performance.studentSnapshots,

quickActions:[
{
title:"Edit Course",
route:"/edit-course"
},
{
title:"Add Lesson",
route:"/lesson"
},
{
title:"View Reviews",
route:"/reviews"
},
{
title:"Update Pricing",
route:"/pricing"
}
]

}

});

}
catch(error){
  console.error("Error in controllers/Instructor/instructordashboardController.js:", error);


res.status(500).json({
success:false,
message: "Server error"
});

}
};

// ===student tracking progress ==
exports.getStudentProgress =async(req,res)=>{
try{

const page =
Number(req.query.page) || 1;

const limit = 10;

const skip =
(page-1)*limit;

const students =
await StudentCourseProgress
.find({
courseId:
req.params.courseId
})
.skip(skip)
.limit(limit);

const totalStudents =
await StudentCourseProgress
.countDocuments({
courseId:
req.params.courseId
});

const activeStudents =
await StudentCourseProgress
.countDocuments({
courseId:
req.params.courseId,
status:"in-progress"
});

const completedStudents =
await StudentCourseProgress
.countDocuments({
courseId:
req.params.courseId,
status:"completed"
});

const allStudents =
await StudentCourseProgress
.find({
courseId:
req.params.courseId
});

const averageCompletion =
allStudents.length > 0
?
Math.round(
allStudents.reduce(
(sum,item)=>
sum +
item.progressPercentage,
0
)
/
allStudents.length
)
:
0;

res.status(200).json({

success:true,

data:{

overview:{

totalStudents,

activeStudents,

completedStudents,

averageCompletion

},

students:
students.map(
student=>({

studentId:
student.studentId,

name:
student.studentName,

email:
student.studentEmail,

profileImage:
student.profileImage,

progress:
student.progressPercentage,

lastActivity:
student.lastActivity,

lessons:
`${student.completedLessons}/${student.totalLessons}`,

status:
student.status
})
),

pagination:{

currentPage:
page,

totalPages:
Math.ceil(
totalStudents/limit
),

totalStudents
}

}

});

}
catch(error){
  console.error("Error in controllers/Instructor/instructordashboardController.js:", error);


res.status(500).json({
success:false,
message: "Server error"
});

}
};

exports.updateStudentProgress =async(req,res)=>{
try{

const student =
await StudentCourseProgress
.findOne({

courseId:
req.params.courseId,

studentId:
req.params.studentId
});

if(!student){
return res.status(404)
.json({
success:false,
message:
"Student not found"
});
}

student.completedLessons =
req.body.completedLessons;

student.totalLessons =
req.body.totalLessons;

student.progressPercentage =
Math.round(
(
student.completedLessons /
student.totalLessons
)*100
);

if(
student.progressPercentage
===100
){
student.status =
"completed";
}

student.lastActivity =
new Date();

await student.save();

res.status(200).json({
success:true,
message:
"Progress updated",
data:student
});

}
catch(error){
  console.error("Error in controllers/Instructor/instructordashboardController.js:", error);


res.status(500).json({
success:false,
message: "Server error"
});

}
};

exports.getStudentDetails =async(req,res)=>{
try{

const student =
await StudentCourseProgress
.findOne({

courseId:
req.params.courseId,

studentId:
req.params.studentId
});

if(!student){
return res.status(404)
.json({
success:false,
message:
"Student not found"
});
}

res.status(200).json({
success:true,
data:student
});

}
catch(error){
  console.error("Error in controllers/Instructor/instructordashboardController.js:", error);


res.status(500).json({
success:false,
message: "Server error"
});

}
};

exports.getReviews = async (req, res) => {
  try {

    const { courseId } = req.params;

    const reviews =
      await ReviewInstructor.find({
        courseId
      })
      .populate(
        "studentId",
        "fullName email"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });

  } catch (error) {
    console.error("Error in controllers/Instructor/instructordashboardController.js:", error);


    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};

exports.getReviewStats = async (req, res) => {
  try {

    const { courseId } = req.params;

    const reviews =
      await ReviewInstructor.find({
        courseId
      });

    const totalReviews =
      reviews.length;

    const averageRating =
      totalReviews > 0
        ? reviews.reduce(
            (sum, review) =>
              sum + review.rating,
            0
          ) / totalReviews
        : 0;

    const distribution = {
      fiveStar:
        reviews.filter(
          r => r.rating === 5
        ).length,

      fourStar:
        reviews.filter(
          r => r.rating === 4
        ).length,

      threeStar:
        reviews.filter(
          r => r.rating === 3
        ).length,

      twoStar:
        reviews.filter(
          r => r.rating === 2
        ).length,

      oneStar:
        reviews.filter(
          r => r.rating === 1
        ).length
    };

    res.status(200).json({
      success: true,
      data: {
        averageRating:
          Number(
            averageRating.toFixed(1)
          ),

        totalReviews,

        distribution
      }
    });

  } catch (error) {
    console.error("Error in controllers/Instructor/instructordashboardController.js:", error);


    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};

exports.replyReview = async (req, res) => {
  try {

    const { reviewId } = req.params;

    const { instructorResponse } =
      req.body;

    const review =
      await ReviewInstructor.findByIdAndUpdate(
        reviewId,
        {
          instructorResponse
        },
        {
          new: true
        }
      );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Reply added successfully",
      data: review
    });

  } catch (error) {
    console.error("Error in controllers/Instructor/instructordashboardController.js:", error);


    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};
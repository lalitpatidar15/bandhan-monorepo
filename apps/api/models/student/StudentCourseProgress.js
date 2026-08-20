const mongoose = require("mongoose");

const studentCourseProgressSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },
    completedLessons: { type: Number, default: 0 },
    totalLessons: { type: Number, default: 0 },
    progressPercentage: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["in-progress", "completed", "inactive"],
      default: "in-progress"
    },
    lastActivity: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.StudentCourseProgress ||
  mongoose.model(
    "StudentCourseProgress",
    studentCourseProgressSchema
  );
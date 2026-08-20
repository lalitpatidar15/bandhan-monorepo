const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true
    },

    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null
    },

    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    // Current Position
    currentModuleId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },

    currentLessonId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },

    // Completed Lessons
    completedLessons: [
      {
        moduleId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true
        },

        lessonId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true
        },

        completedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    // Unlocked Modules
    unlockedModules: [
      {
        type: mongoose.Schema.Types.ObjectId
      }
    ],

    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active"
    },

    lastAccessedAt: {
      type: Date,
      default: Date.now
    },

    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// One student can enroll only once in one course
enrollmentSchema.index(
  {
    studentId: 1,
    courseId: 1
  },
  {
    unique: true
  }
);

module.exports = mongoose.model(
  "Enrollment",
  enrollmentSchema
);
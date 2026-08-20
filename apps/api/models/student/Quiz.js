const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    default: false
  }
});

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },

  hint: {
    type: String,
    default: ""
  },

  options: {
    type: [optionSchema],
    validate: {
      validator: function (options) {
        return options.length >= 4;
      },
      message: "Minimum 4 options required"
    }
  }
});

const quizSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },

  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true
  },

  title: {
    type: String,
    required: true
  },

  description: String,

  duration: {
    type: Number,
    default: 10
  },

  passingMarks: {
    type: Number,
    default: 40
  },

  totalQuestions: {
    type: Number,
    default: 0
  },

  questions: [questionSchema]
},
{
  timestamps: true
});

module.exports = mongoose.model("Quiz", quizSchema);
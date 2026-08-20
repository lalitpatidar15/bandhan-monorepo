const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  questionId: mongoose.Schema.Types.ObjectId,

  selectedOptionId: mongoose.Schema.Types.ObjectId,

  isCorrect: Boolean
});

const quizResultSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz"
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student"
    },

    answers: [answerSchema],

    score: Number,

    totalMarks: Number,

    percentage: Number,

    passed: Boolean
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "QuizResult",
  quizResultSchema
);
const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TradeTest",
      required: true,
    },
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
    questionType: {
      type: String,
      enum: ["multiple-choice", "true-false", "short-answer", "essay"],
      default: "multiple-choice",
    },
    options: [
      {
        text: {
          type: String,
          required: true,
        },
        isCorrect: {
          type: Boolean,
          default: false,
        },
      },
    ],
    correctAnswer: {
      type: String, // For short-answer and essay types
      trim: true,
    },
    points: {
      type: Number,
      default: 1,
      min: 0,
    },
    explanation: {
      type: String,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { strict: false }
);

// Update the updatedAt field before saving
questionSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Question = mongoose.model("Question", questionSchema);
module.exports = { Question };

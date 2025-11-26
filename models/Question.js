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
      enum: ["multiple_choice", "true_false", "short_answer", "practical"],
      default: "multiple_choice",
      required: true,
    },
    options: {
      type: [String], // Array of strings for multiple_choice questions
      default: [],
    },
    correctAnswer: {
      type: mongoose.Schema.Types.Mixed, // Can be String or Array for multiple correct answers
      required: true,
    },
    points: {
      type: Number,
      default: 1,
      min: 1,
      required: true,
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
    category: {
      type: String,
      trim: true,
    },
    attachments: {
      type: [String], // Array of file URLs
      default: [],
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

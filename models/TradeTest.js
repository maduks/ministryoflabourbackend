const mongoose = require("mongoose");

const tradeTestSchema = new mongoose.Schema(
  {
    testName: {
      type: String,
      required: true,
      trim: true,
    },
    testCode: {
      type: String,
      unique: true,
      trim: true,
      sparse: true, // Allows multiple null/undefined values
    },
    ministryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ministry",
      default: null, // null means available for all ministries
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    duration: {
      type: Number, // in minutes
      required: true,
      min: 1,
    },
    passingScore: {
      type: Number, // percentage (0-100)
      required: true,
      min: 0,
      max: 100,
    },
    maxAttempts: {
      type: Number,
      required: true,
      min: 1,
      default: 3,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    scheduledStart: {
      type: Date,
      default: null,
    },
    scheduledEnd: {
      type: Date,
      default: null,
    },
    settings: {
      allowReview: {
        type: Boolean,
        default: true,
      },
      showResults: {
        type: Boolean,
        default: true,
      },
      randomizeQuestions: {
        type: Boolean,
        default: false,
      },
      randomizeOptions: {
        type: Boolean,
        default: false,
      },
      enableProctoring: {
        type: Boolean,
        default: false,
      },
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
tradeTestSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Generate test code if not provided
tradeTestSchema.pre("save", async function (next) {
  if (!this.testCode && this.isNew) {
    // Generate a test code based on category and timestamp
    const categoryPrefix = this.category
      .substring(0, 3)
      .toUpperCase()
      .replace(/[^A-Z]/g, "");
    const timestamp = Date.now().toString().slice(-6);
    this.testCode = `${categoryPrefix}-${timestamp}`;

    // Ensure uniqueness using this.constructor (the model)
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      const existing = await this.constructor.findOne({
        testCode: this.testCode,
      });
      if (!existing) {
        isUnique = true;
      } else {
        const randomSuffix = Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0");
        this.testCode = `${categoryPrefix}-${timestamp}${randomSuffix}`;
        attempts++;
      }
    }
  }
  next();
});

const TradeTest = mongoose.model("TradeTest", tradeTestSchema);
module.exports = { TradeTest };

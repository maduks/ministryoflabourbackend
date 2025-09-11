const mongoose = require("mongoose");
const { Schema } = mongoose;

const submissionSchema = new Schema(
  {
    ministry: { type: Schema.Types.ObjectId, ref: "Ministry", required: false },
    agentId: { type: Schema.Types.ObjectId, ref: "Users", required: false },
    dateOfSubmission: { type: Date, default: Date.now },
    category: { type: String, required: true }, // e.g., 'property', 'service_provider'
    notes: { type: String, required: false },
    professionCategory: { type: String, required: false },
    paymentStatus: { type: String, required: false },
    profession: { type: String, required: false },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    serviceProviderId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    submissionId: { type: Schema.Types.ObjectId, required: true }, // ref to the actual entity
  },
  { strictPopulate: false }
);

const Submission = mongoose.model("Submission", submissionSchema);
module.exports = Submission;

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const KYCDocumentSchema = new mongoose.Schema({
  fullName: {
    type: String,
    trim: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  religion: {
    type: String,
    required: true,
    //enum: ["christianity", "islam", "traditional", "others"],
  },

  bankAccountNumber: {
    type: String,
  },
  bankName: {
    type: String,
  },
  accountName: {
    type: String,
  },

  maritalStatus: {
    type: String,
    required: false,
  },
  residentialaddress: {
    type: String,
    required: true,
  },

  community: {
    type: String,
  },
  dateOfBirth: {
    type: String,
    required: false,
  },
  state: {
    type: String,
    required: true,
  },
  lga: {
    type: String,
    required: true,
  },
  nin: {
    type: String, // NIN number
    required: true,
  },
  photo: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "verified",
    lowercase: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

const KYCDocument = mongoose.model("KYCDocument", KYCDocumentSchema);
module.exports = KYCDocument;

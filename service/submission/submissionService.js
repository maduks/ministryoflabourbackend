const Submission = require("../../models/Submission");

async function createSubmission({
  ministry,
  agentId,
  category,
  status = "pending",
  professionCategory,
  profession,
  submissionId,
  serviceProviderId,
  paymentStatus,
  submissionType,
}) {
  const submission = new Submission({
    ministry,
    agentId,
    category,
    status,
    professionCategory,
    profession,
    submissionId,
    serviceProviderId,
    paymentStatus,
    submissionType,
  });
  await submission.save();
  return submission;
}

module.exports = { createSubmission };

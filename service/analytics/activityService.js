const Submission = require("../../models/Submission");
const ServiceProvider = require("../../models/ServiceProviderServiceHub");
const PropertyServiceHub = require("../../models/PropertyServiceHub");
const { User } = require("../../models/User");
const moment = require("moment");

function getActionAndItem(submission, entity) {
  if (submission.category === "services") {
    if (submission.status === "approved") {
      return {
        type: "approval",
        action: "Approved service provider registration",
        item: entity
          ? `${entity.profession} - ${entity.specialization}`
          : "Service Provider",
      };
    } else if (submission.status === "rejected") {
      return {
        type: "rejection",
        action: "Rejected service provider application",
        item: entity
          ? `${entity.profession} - ${entity.specialization}`
          : "Service Provider",
      };
    } else {
      return {
        type: "registration",
        action: "New service provider registered",
        item: entity
          ? `${entity.profession} - ${entity.specialization}`
          : "Service Provider",
      };
    }
  } else if (submission.category === "property") {
    if (submission.status === "approved") {
      return {
        type: "approval",
        action: "Approved property registration",
        item: entity ? entity.propertyName || "Property" : "Property",
      };
    } else if (submission.status === "rejected") {
      return {
        type: "rejection",
        action: "Rejected property application",
        item: entity ? entity.propertyName || "Property" : "Property",
      };
    } else {
      return {
        type: "registration",
        action: "New property submitted",
        item: entity ? entity.propertyName || "Property" : "Property",
      };
    }
  } else if (submission.category === "business") {
    if (submission.status === "approved") {
      return {
        type: "approval",
        action: "Approved business registration",
        item: entity ? entity.businessName || "Business" : "Business",
      };
    } else if (submission.status === "rejected") {
      return {
        type: "rejection",
        action: "Rejected business application",
        item: entity ? entity.businessName || "Business" : "Business",
      };
    } else {
      return {
        type: "registration",
        action: "New business premise submitted",
        item: entity ? entity.businessName || "Business" : "Business",
      };
    }
  }
  return { type: "other", action: "Activity", item: "Item" };
}

async function getRecentActivities(limit = 20) {
  // Get recent submissions
  const submissions = await Submission.find({})
    .sort("-dateOfSubmission")
    .limit(limit)
    .populate("agentId", "fullName")
    .lean();

  // Populate submissionId for each submission
  const activities = await Promise.all(
    submissions.map(async (submission) => {
      let entity = null;
      if (submission.category === "services") {
        entity = await ServiceProvider.findById(submission.submissionId).lean();
      } else if (submission.category === "property") {
        entity = await PropertyServiceHub.findById(
          submission.submissionId
        ).lean();
      } else if (submission.category === "business") {
        // If you have a Business model, you can add it here
        // entity = await Business.findById(submission.submissionId).lean();
      }
      const { type, action, item } = getActionAndItem(submission, entity);
      return {
        id: submission._id,
        type,
        action,
        item,
        agent: submission.agentId ? submission.agentId.fullName : "N/A",
        timestamp: moment(submission.dateOfSubmission).fromNow(),
        status: submission.status,
      };
    })
  );

  return activities;
}

async function getRecentActivitiesByMinistry(ministryId, limit = 20) {
  const submissions = await Submission.find({ ministry: ministryId })
    .sort("-dateOfSubmission")
    .limit(limit)
    .populate("agentId", "fullName")
    .lean();

  const activities = await Promise.all(
    submissions.map(async (submission) => {
      let entity = null;
      if (submission.category === "services") {
        entity = await ServiceProvider.findById(submission.submissionId).lean();
      } else if (submission.category === "property") {
        entity = await PropertyServiceHub.findById(
          submission.submissionId
        ).lean();
      } else if (submission.category === "business") {
        // entity = await Business.findById(submission.submissionId).lean();
      }
      const { type, action, item } = getActionAndItem(submission, entity);
      return {
        id: submission._id,
        type,
        action,
        item,
        agent: submission.agentId ? submission.agentId.fullName : "N/A",
        timestamp: moment(submission.dateOfSubmission).fromNow(),
        status: submission.status,
      };
    })
  );

  return activities;
}

module.exports = { getRecentActivities, getRecentActivitiesByMinistry };

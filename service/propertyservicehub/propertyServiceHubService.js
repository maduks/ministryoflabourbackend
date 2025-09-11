const PropertyServiceHub = require("../../models/PropertyServiceHub");
const { createSubmission } = require("../submission/submissionService");

class PropertyServiceHubService {
  async createPropertyServiceHub(data) {
    const property = new PropertyServiceHub(data);
    const savedProperty = await property.save();

    // Create Submission
    const submission = await createSubmission({
      ministry: data.ministryLinks[0]?.ministry || undefined,
      agentId: data.assignedBy || undefined,
      category: "property",
      status: "pending",
      submissionId: savedProperty._id,
    });

    return { property: savedProperty, submission };
  }

  async getPropertyServiceHubById(id) {
    return await PropertyServiceHub.findById(id);
  }

  async getPropertyServiceHubs(filter = {}, options = {}) {
    const { page = 1, limit = 10, sort = "-createdAt" } = options;
    const skip = (page - 1) * limit;
    const [properties, total] = await Promise.all([
      PropertyServiceHub.find(filter).sort(sort).skip(skip).limit(limit),
      PropertyServiceHub.countDocuments(filter),
    ]);
    return { properties, total };
  }

  async updatePropertyServiceHub(id, data) {
    return await PropertyServiceHub.findByIdAndUpdate(id, data, { new: true });
  }

  async deletePropertyServiceHub(id) {
    return await PropertyServiceHub.findByIdAndDelete(id);
  }
}

module.exports = new PropertyServiceHubService();

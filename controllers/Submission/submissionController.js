const Submission = require("../../models/Submission");
const ServiceProvider = require("../../models/ServiceProviderServiceHub");
const PropertyServiceHub = require("../../models/PropertyServiceHub");
const { Ministries } = require("../../models/Ministry");
const TransactionServiceHub = require("../../models/TransactionServiceHub");
const { User } = require("../../models/User");
// Helper function to populate submissionId based on category
async function populateSubmissionData(submissions) {
  for (let submission of submissions) {
    if (submission.category === "property") {
      await submission.populate("submissionId", null, "PropertyServiceHub");
    } else if (submission.category === "services") {
      await submission.populate({
        path: "submissionId",
        model: "ServiceProvider",
        populate: { path: "kyc", model: "KYCDocument" },
      });
    }
  }
  return submissions;
}

// Get all submissions with filtering and pagination
exports.getSubmissions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      ministry,
      agentId,
      sort = "-dateOfSubmission",
    } = req.query;

    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (ministry) filter.ministry = ministry;
    if (agentId) filter.agentId = agentId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [submissions, total] = await Promise.all([
      Submission.find(filter)
        .populate("ministry", "name")
        .populate("agentId", "fullName email phoneNumber")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Submission.countDocuments(filter),
    ]);

    // Populate submissionId based on submissionType
    await populateSubmissionData(submissions);

    res.status(200).json({
      success: true,
      data: submissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get submission by ID
exports.getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate("ministry", "name")
      .populate("agentId", "fullName email phoneNumber");

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    // Populate submissionId based on submissionType
    await populateSubmissionData([submission]);

    res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update submission status
exports.updateSubmissionStatus = async (req, res) => {
  try {
    const { status, notes, ministry } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be pending, approved, or rejected",
      });
    }

    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { status, notes, ministry },
      { new: true }
    )
      .populate("ministry", "name")
      .populate("agentId", "fullName email phoneNumber");

    const transaction = await TransactionServiceHub.findOneAndUpdate(
      { submissionId: req.params.id },
      { ministry },
      { new: true }
    );
    // const users = await User.findOneAndUpdate(
    //   { submissionId: submission.user },
    //   { ministry },
    //   { new: true }
    // );
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }
    // If approved, update the related model's approvalstatus

    if (submission.category === "services") {
      await ServiceProvider.findByIdAndUpdate(submission.submissionId, {
        approvalstatus: status,
        ministry: ministry,
      });
    } else if (submission.category === "property") {
      await PropertyServiceHub.findByIdAndUpdate(submission.submissionId, {
        approvalstatus: status,
      });
    }

    // Populate submissionId based on category
    await populateSubmissionData([submission]);

    res.status(200).json({
      success: true,
      data: submission,
      transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get submissions by category
exports.getSubmissionsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const filter = { category };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [submissions, total] = await Promise.all([
      Submission.find(filter)
        .populate("ministry", "name")
        .populate("agentId", "fullName email phoneNumber")
        .sort("-dateOfSubmission")
        .skip(skip)
        .limit(parseInt(limit)),
      Submission.countDocuments(filter),
    ]);

    // Populate submissionId based on submissionType
    await populateSubmissionData(submissions);

    res.status(200).json({
      success: true,
      data: submissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get submissions by agent (assignedBy)
exports.getSubmissionsByAgent = async (req, res) => {
  try {
    const { agentId } = req.params;
    const {
      page = 1,
      limit = 10,
      category,
      status,
      sort = "-dateOfSubmission",
    } = req.query;

    const filter = { agentId };

    if (category) filter.category = category;
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [submissions, total] = await Promise.all([
      Submission.find(filter)
        .populate("ministry", "name")
        .populate("agentId", "fullName email phoneNumber")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Submission.countDocuments(filter),
    ]);

    // Populate submissionId based on submissionType
    await populateSubmissionData(submissions);

    res.status(200).json({
      success: true,
      data: submissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get submissions by user (serviceProviderId)
exports.getSubmissionsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      page = 1,
      limit = 10,
      category,
      status,
      sort = "-dateOfSubmission",
    } = req.query;

    const filter = { serviceProviderId: userId };

    if (category) filter.category = category;
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [submissions, total] = await Promise.all([
      Submission.find(filter)
        .populate("ministry", "name")
        .populate("serviceProviderId", "fullName email phoneNumber")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Submission.countDocuments(filter),
    ]);

    // Populate submissionId based on submissionType
    await populateSubmissionData(submissions);

    res.status(200).json({
      success: true,
      data: submissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getSubmissionsByMinistry = async (req, res) => {
  try {
    const { ministryId } = req.params;
    const {
      page = 1,
      limit = 10,
      category,
      status,
      sort = "-dateOfSubmission",
    } = req.query;

    // Fetch ministry details
    const ministry = await Ministries.findById(ministryId);
    if (!ministry) {
      return res
        .status(404)
        .json({ success: false, message: "Ministry not found" });
    }

    const accessTypes = ministry.accessTypes || [];

    // Extract allowedCategories, allowedSubcategories, and professions from accessTypes
    const servicesAccess = accessTypes.find((a) => a.type === "services") || {};
    const propertyAccess = accessTypes.find((a) => a.type === "property") || {};

    const allowedCategories = servicesAccess.allowedCategories || [];
    const allowedSubcategories = servicesAccess.allowedSubcategories || [];
    const professions = servicesAccess.professions || [];

    // Property-specific access
    const propertyCategories = propertyAccess.allowedCategories || [];
    const propertySubcategories = propertyAccess.allowedSubcategories || [];

    // Fallback to top-level profession if professions array is not present
    const profession = professions.length === 0 ? ministry.profession : null;

    // Extract string value if item is an object with a 'name' property
    const extractString = (v) =>
      typeof v === "string"
        ? v
        : v && typeof v === "object" && v.name && typeof v.name === "string"
        ? v.name
        : "";
    // Helper function to escape regex special characters
    const escapeRegex = (string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    };

    // Filter and map to regex (case-insensitive) only valid, non-empty strings
    const categoryRegexes = allowedCategories
      .map(extractString)
      .filter((cat) => cat.trim() !== "")
      .map((cat) => new RegExp(`^${escapeRegex(cat)}$`, "i"));

    const subcategoryRegexes = allowedSubcategories
      .map(extractString)
      .filter((sub) => sub.trim() !== "")
      .map((sub) => new RegExp(`^${escapeRegex(sub)}$`, "i"));

    const professionRegexes = professions
      .map(extractString)
      .filter((prof) => prof.trim() !== "")
      .map((prof) => new RegExp(`^${prof}$`, "i"));

    // Property regexes
    const propertyCategoryRegexes = propertyCategories
      .map(extractString)
      .filter((cat) => cat.trim() !== "")
      .map((cat) => new RegExp(`^${escapeRegex(cat)}$`, "i"));

    const propertySubcategoryRegexes = propertySubcategories
      .map(extractString)
      .filter((sub) => sub.trim() !== "")
      .map((sub) => new RegExp(`^${escapeRegex(sub)}$`, "i"));

    // Debug: log ministry and access details
    console.log("Ministry ID:", ministryId);
    console.log("servicesAccess:", servicesAccess);
    console.log("propertyAccess:", propertyAccess);
    console.log("RAW allowedCategories:", allowedCategories);
    console.log("RAW allowedSubcategories:", allowedSubcategories);
    console.log("categoryRegexes:", categoryRegexes);
    console.log("subcategoryRegexes:", subcategoryRegexes);
    console.log("professions:", professions);
    console.log("profession:", profession);

    // Build base filter
    const baseFilter = {};
    if (category) baseFilter.category = category;
    if (status) baseFilter.status = status;
    baseFilter.ministry = ministryId;

    console.log("baseFilter:", baseFilter);

    // Get ALL submissions (we'll apply OR logic in filtering)
    const submissions = await Submission.find(baseFilter)
      .populate("ministry", "name")
      .populate("agentId", "fullName email phoneNumber")
      .sort(sort);

    console.log("submissions:", submissions);

    // Filter submissions based on ministry access control
    const filteredSubmissions = [];

    console.log("Total submissions to filter:", submissions.length);
    console.log("Ministry Category Regexes:", categoryRegexes);
    console.log("Ministry Subcategory Regexes:", subcategoryRegexes);
    console.log("Ministry Property Category Regexes:", propertyCategoryRegexes);
    console.log(
      "Ministry Property Subcategory Regexes:",
      propertySubcategoryRegexes
    );

    for (const submission of submissions) {
      console.log("\n=== Processing Submission ===");
      console.log("Submission ID:", submission._id);
      console.log("Submission Category:", submission.category);
      console.log(
        "Submission ProfessionCategory:",
        submission.professionCategory
      );
      console.log("Submission Profession:", submission.profession);
      console.log("Submission Ministry:", submission.ministry?._id);

      let shouldInclude = false;

      if (submission.category === "services") {
        // Extract data directly from submission
        const submissionProfessionCategory = submission.professionCategory;
        const submissionProfession = submission.profession;

        // Check if professionCategory AND profession matches ministry's allowed categories/subcategories
        let categoryMatch = false;
        let professionMatch = false;

        // Strictly require a match in both
        if (categoryRegexes.length > 0) {
          categoryMatch = categoryRegexes.some((regex) => {
            const matches = regex.test(submissionProfessionCategory);
            console.log(
              `Checking "${submissionProfessionCategory}" against regex "${regex}": ${matches}`
            );
            return matches;
          });
        }
        if (subcategoryRegexes.length > 0) {
          const normalizedProfession = submissionProfession
            ? submissionProfession.toLowerCase().replace(/\s+/g, "-")
            : "";
          professionMatch = subcategoryRegexes.some((regex) => {
            const rawMatch = regex.test(submissionProfession);
            const normalizedMatch = regex.test(normalizedProfession);
            console.log(
              `Checking profession raw "${submissionProfession}" and normalized "${normalizedProfession}" against regex "${regex}": rawMatch=${rawMatch}, normalizedMatch=${normalizedMatch}`
            );
            return rawMatch || normalizedMatch;
          });
        }

        // Only include if BOTH match
        shouldInclude = categoryMatch && professionMatch;

        console.log("Category Match (allowedCategories):", categoryMatch);
        console.log(
          "Profession Match (allowedSubcategories):",
          professionMatch
        );
        console.log("Should Include (AND):", shouldInclude);
      } else if (submission.category === "property") {
        // For property, extract data directly from submission
        const submissionProfessionCategory = submission.professionCategory;
        const submissionProfession = submission.profession;

        // Check if professionCategory AND profession matches ministry's allowed categories/subcategories
        let categoryMatch = false;
        let professionMatch = false;

        if (propertyCategoryRegexes.length > 0) {
          categoryMatch = propertyCategoryRegexes.some((regex) => {
            const matches = regex.test(submissionProfessionCategory);
            console.log(
              `Checking property "${submissionProfessionCategory}" against regex "${regex}": ${matches}`
            );
            return matches;
          });
        }
        if (propertySubcategoryRegexes.length > 0) {
          const normalizedProfession = submissionProfession
            ? submissionProfession.toLowerCase().replace(/\s+/g, "-")
            : "";
          professionMatch = propertySubcategoryRegexes.some((regex) => {
            const rawMatch = regex.test(submissionProfession);
            const normalizedMatch = regex.test(normalizedProfession);
            console.log(
              `Checking property profession raw "${submissionProfession}" and normalized "${normalizedProfession}" against regex "${regex}": rawMatch=${rawMatch}, normalizedMatch=${normalizedMatch}`
            );
            return rawMatch || normalizedMatch;
          });
        }

        // Only include if BOTH match
        shouldInclude = categoryMatch && professionMatch;

        console.log(
          "Property Category Match (allowedCategories):",
          categoryMatch
        );
        console.log(
          "Property Profession Match (allowedSubcategories):",
          professionMatch
        );
        console.log("Property Should Include (AND):", shouldInclude);
      }

      if (shouldInclude) {
        filteredSubmissions.push(submission);
        console.log("✅ INCLUDED submission:", submission._id);
      } else {
        console.log("❌ EXCLUDED submission:", submission._id);
      }
    }

    console.log("\n=== FINAL SUMMARY ===");
    console.log("Total submissions processed:", submissions.length);
    console.log(
      "Final filtered submissions count:",
      filteredSubmissions.length
    );
    console.log(
      "Filtered submission IDs:",
      filteredSubmissions.map((s) => s._id)
    );

    // Apply pagination to filtered results
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedSubmissions = filteredSubmissions.slice(
      skip,
      skip + parseInt(limit)
    );

    // Populate submission data
    await populateSubmissionData(paginatedSubmissions);

    res.status(200).json({
      success: true,
      accessTypes,
      data: paginatedSubmissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredSubmissions.length,
        pages: Math.ceil(filteredSubmissions.length / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error in getSubmissionsByMinistry:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

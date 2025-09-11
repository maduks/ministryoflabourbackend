const {
  createServiceProvider,
  getServiceProviderByMinistry,
  updateServiceProvider,
  getServiceProviderById,
  searchAndFilterServiceProviders,
} = require("../../service/serviceproviderservicehub/serviceProviderServiceHubService");
const ServiceProvider = require("../../models/ServiceProviderServiceHub");
const Submission = require("../../models/Submission");
const mongoose = require("mongoose");
const { Ministries } = require("../../models/Ministry");
const { User } = require("../../models/User");

exports.createServiceProvider = async (req, res) => {
  try {
    const result = await createServiceProvider(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getServiceProviderAnalytics = async (req, res) => {
  try {
    const { state, lga, ward, ministryId } = req.query;
    //const { ministryId } = req.;
    const match = {};
    if (state) match["address.state"] = state;
    if (lga) match["address.lga"] = lga;
    if (ward) match["address.ward"] = ward;
    if (ministryId) match.ministry = new mongoose.Types.ObjectId(ministryId); // ✅ put it in match

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          gender: "$userInfo.gender",
          class: 1,
          profession: 1,
          address: 1,
          specialization: 1,
          skills: 1,
          yearsOfExperience: 1,
          serviceAreas: 1,
          availability: 1,
          licenses: {
            $map: {
              input: "$licenses",
              as: "lic",
              in: {
                name: "$$lic.name",
                expires: "$$lic.expires",
                authority: "$$lic.authority",
              },
            },
          },
          isVerified: 1,
          status: 1,
          approvalstatus: 1,
          rating: 1,
          createdAt: 1,
          assignmentDate: 1,
          educationLevels: 1,
        },
      },
    ];

    // ✅ aggregate directly on the model
    const results = await ServiceProvider.aggregate(pipeline);

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getServiceProviderAnalyticsByMinistry = async (req, res) => {
  try {
    const { state, lga, ward } = req.query;
    const { ministryId } = req.params;
    const match = {};
    if (state) match["address.state"] = state;
    if (lga) match["address.lga"] = lga;
    if (ward) match["address.ward"] = ward;
    if (ministryId) match["ministry"] = ministryId;

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          gender: "$userInfo.gender",
          class: 1,
          profession: 1,
          address: 1,
          specialization: 1,
          skills: 1,
          yearsOfExperience: 1,
          serviceAreas: 1,
          availability: 1,
          licenses: {
            $map: {
              input: "$licenses",
              as: "lic",
              in: {
                name: "$$lic.name",
                expires: "$$lic.expires",
                authority: "$$lic.authority",
              },
            },
          },
          isVerified: 1,
          status: 1,
          approvalstatus: 1,
          rating: 1,
          createdAt: 1,
          assignmentDate: 1,
          educationLevels: 1,
        },
      },
    ];

    const results = await ServiceProvider.aggregate(pipeline);
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getServiceProviderByMinistry = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, sort = "-createdAt" } = req.query;

    // Fetch ministry details
    const ministry = await Ministries.findById(id);
    if (!ministry) {
      return res
        .status(404)
        .json({ success: false, message: "Ministry not found" });
    }
    const accessTypes = ministry.accessTypes || [];
    // Extract allowedCategories, allowedSubcategories, and professions from accessTypes.services
    const servicesAccess = accessTypes.find((a) => a.type === "services") || {};
    const allowedCategories = servicesAccess.allowedCategories || [];
    const allowedSubcategories = servicesAccess.allowedSubcategories || [];
    const professions = servicesAccess.professions || [];
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
      .map((prof) => new RegExp(`^${escapeRegex(prof)}$`, "i"));

    // Debug: log ministry and access details
    console.log("Ministry ID:", id);
    console.log("servicesAccess:", servicesAccess);
    console.log("RAW allowedCategories:", allowedCategories);
    console.log("RAW allowedSubcategories:", allowedSubcategories);
    console.log("categoryRegexes:", categoryRegexes);
    console.log("subcategoryRegexes:", subcategoryRegexes);
    console.log("professions:", professions);
    console.log("profession:", profession);

    // Get ALL service providers (not filtered by ministry)
    const allProviders = await ServiceProvider.find({
      "address.state": ministry.state,
    })
      .populate("user")
      .populate("kyc")
      .sort(sort);

    console.log(
      "Total service providers to filter:",
      allProviders.length + " " + ministry.state
    );

    // Filter service providers based on ministry access control
    const filteredProviders = [];

    for (const provider of allProviders) {
      console.log("\n=== Processing Service Provider ===");
      console.log("Provider ID:", provider._id);
      console.log("Provider Category:", provider.category);
      console.log("Provider Specialization:", provider.specialization);
      console.log("Provider Profession:", provider.profession);
      console.log("Provider Ministry:", provider.ministry);

      let shouldInclude = false;

      // Check if category AND profession matches ministry's allowed categories/subcategories
      let categoryMatch = false;
      let professionMatch = false;

      // Check category match against allowedCategories
      if (categoryRegexes.length > 0) {
        categoryMatch = categoryRegexes.some((regex) => {
          const matches = regex.test(provider.category);
          console.log(
            `Checking category "${provider.category}" against regex "${regex}": ${matches}`
          );
          return matches;
        });
      }

      // Check profession match against allowedSubcategories
      if (subcategoryRegexes.length > 0) {
        const normalizedProfession = provider.profession
          ? provider.profession.toLowerCase().replace(/\s+/g, "-")
          : "";

        professionMatch = subcategoryRegexes.some((regex) => {
          const professionRawMatch = regex.test(provider.profession);
          const professionNormalizedMatch = regex.test(normalizedProfession);

          console.log(
            `Checking profession raw "${provider.profession}" and normalized "${normalizedProfession}" against regex "${regex}": profRaw=${professionRawMatch}, profNorm=${professionNormalizedMatch}`
          );

          return professionRawMatch || professionNormalizedMatch;
        });
      }

      // Include if BOTH category AND profession match
      shouldInclude = categoryMatch && professionMatch;

      console.log("Category Match (allowedCategories):", categoryMatch);
      console.log("Profession Match (allowedSubcategories):", professionMatch);
      console.log("Should Include (AND):", shouldInclude);

      if (shouldInclude) {
        filteredProviders.push(provider);
        console.log("✅ INCLUDED provider:", provider._id);
      } else {
        console.log("❌ EXCLUDED provider:", provider._id);
      }
    }

    console.log("\n=== FINAL SUMMARY ===");
    console.log("Total providers processed:", allProviders.length);
    console.log("Final filtered providers count:", filteredProviders.length);
    console.log(
      "Filtered provider IDs:",
      filteredProviders.map((p) => p._id)
    );

    // Apply pagination to filtered results
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedProviders = filteredProviders.slice(
      skip,
      skip + parseInt(limit)
    );

    res.status(200).json({
      success: true,
      accessTypes,
      data: paginatedProviders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredProviders.length,
        pages: Math.ceil(filteredProviders.length / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error in getServiceProviderByMinistry:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateServiceProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, submissionId } = req.body;
    const updatedServiceProvider = await updateServiceProvider(id, data);
    if (submissionId) {
      const updateSubmissions = await Submission.findByIdAndUpdate(
        submissionId,
        {
          status: "pending",
          profession: data.profession,
        },
        { new: true }
      );
      if (!updateSubmissions) {
        return res
          .status(404)
          .json({ success: false, message: "Submission not found" });
      }
    }
    res.status(200).json({ success: true, data: updatedServiceProvider });
  } catch (error) {
    console.error("Error in updateServiceProvider:", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    console.log("ServiceProvider updated successfully");
  }
};

// Search and filter service providers
exports.searchAndFilterServiceProviders = async (req, res) => {
  try {
    const {
      // Search parameters
      search,
      userName,

      // Filter parameters
      profession,
      category,
      specialization,
      skills,
      yearsOfExperience,
      availability,
      isVerified,
      status,
      approvalstatus,
      ministry,
      educationLevels,

      // Location filters
      state,
      city,
      zip,

      // Rating filters
      minRating,
      maxRating,

      // Experience filters
      minExperience,
      maxExperience,

      // Date filters
      createdAfter,
      createdBefore,
      assignedAfter,
      assignedBefore,

      // Pagination
      page = 1,
      limit = 10,
      sort = "-createdAt",

      // Include related data
      populate = true,
    } = req.query;

    // Convert string arrays to actual arrays
    const parseArrayParam = (param) => {
      if (!param) return undefined;
      if (Array.isArray(param)) return param;
      return param.split(",").map((item) => item.trim());
    };

    // Convert boolean strings to actual booleans
    const parseBooleanParam = (param) => {
      if (param === undefined) return undefined;
      if (typeof param === "boolean") return param;
      return param.toLowerCase() === "true";
    };

    // Build search parameters object
    const searchParams = {
      search,
      userName,
      profession: parseArrayParam(profession),
      category: parseArrayParam(category),
      specialization: parseArrayParam(specialization),
      skills: parseArrayParam(skills),
      yearsOfExperience: yearsOfExperience
        ? parseInt(yearsOfExperience)
        : undefined,
      availability: parseArrayParam(availability),
      isVerified: parseBooleanParam(isVerified),
      status: parseArrayParam(status),
      approvalstatus: parseArrayParam(approvalstatus),
      ministry: parseArrayParam(ministry),
      educationLevels: parseArrayParam(educationLevels),
      state,
      city,
      zip,
      minRating: minRating ? parseFloat(minRating) : undefined,
      maxRating: maxRating ? parseFloat(maxRating) : undefined,
      minExperience: minExperience ? parseInt(minExperience) : undefined,
      maxExperience: maxExperience ? parseInt(maxExperience) : undefined,
      createdAfter,
      createdBefore,
      assignedAfter,
      assignedBefore,
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      populate: parseBooleanParam(populate),
    };

    const result = await searchAndFilterServiceProviders(searchParams);

    res.status(200).json({
      success: true,
      message: "Service providers retrieved successfully",
      data: result.serviceProviders,
      pagination: result.pagination,
      filters: result.filters,
    });
  } catch (error) {
    console.error("Error in searchAndFilterServiceProviders:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error searching service providers",
    });
  }
};

// Get service provider by ID with full data (same structure as search)
exports.getServiceProviderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Service provider ID is required",
      });
    }

    const serviceProvider = await getServiceProviderById(id);

    res.status(200).json({
      success: true,
      message: "Service provider retrieved successfully",
      data: serviceProvider,
    });
  } catch (error) {
    console.error("Error in getServiceProviderById:", error);

    if (error.message === "Service provider not found") {
      return res.status(404).json({
        success: false,
        message: "Service provider not found",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Error retrieving service provider",
    });
  }
};

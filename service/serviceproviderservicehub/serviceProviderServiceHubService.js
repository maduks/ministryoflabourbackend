const { User } = require("../../models/User");
const KYCDocument = require("../../models/Kyc");
const ServiceProvider = require("../../models/ServiceProviderServiceHub");
const TransactionServiceHub = require("../../models/TransactionServiceHub");
const { Certification } = require("../../models/Certifications");
const mongoose = require("mongoose");
const { createSubmission } = require("../submission/submissionService");
const passwordHash = require("../../utils/passwordHash.js");

// Helper function to retry operations with exponential backoff
async function retryOperation(operation, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      // Check if it's a transient transaction error
      if (
        error.code === 112 ||
        error.codeName === "WriteConflict" ||
        (error.errorLabels &&
          error.errorLabels.includes("TransientTransactionError"))
      ) {
        if (attempt === maxRetries) {
          throw error; // Re-throw on final attempt
        }

        // Exponential backoff: wait 2^attempt * 100ms
        const delay = Math.pow(2, attempt) * 100;
        console.log(
          `WriteConflict detected, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // If it's not a transient error, throw immediately
      throw error;
    }
  }
}

// 1. Create or update user and KYC
async function createUserAndKYC(payload) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userData = payload.user;
    if (!userData.password) throw new Error("Password is required");

    // Find existing user
    let user = await User.findOne({
      $or: [{ email: userData.email }, { phoneNumber: userData.phoneNumber }],
    });

    // Create new user if doesn't exist
    if (!user) {
      userData.password = await passwordHash.hashPassword(userData.password);
      user = new User({
        ...userData,
        isverified: payload.isVerified || false,
        isKYCVerified: true,
        role: "user",
        status: payload.status || "active",
      });
      await user.save({ session });
    }

    // Handle KYC
    let kyc = null;
    const kycData = payload.kyc || {};
    if (kycData && kycData.nin) {
      kyc = await KYCDocument.findOne({ userId: user._id });
      const kycPayload = {
        fullName: user.fullName,
        userId: user._id,
        religion: kycData.religion,
        residentialaddress: payload.address?.street || "",
        state: payload.address?.state || "",
        lga: payload.address?.ward || "",
        bankAccountNumber: kycData.bankAccountNumber,
        bankName: kycData.bankName,
        accountName: kycData.accountName,
        nin: kycData.nin,
        photo: kycData.photo,
        dateOfBirth: kycData.dob,
        community: payload.address?.city || "",
        status: "verified",
      };

      if (kyc) {
        Object.assign(kyc, kycPayload);
        await kyc.save({ session });
      } else {
        kyc = new KYCDocument(kycPayload);
        await kyc.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();
    return { user, kyc };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}

// 2. Create service provider record
async function createServiceProviderRecord(payload, user, kyc) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const spData = {
      user: user._id,
      ...(kyc && { kyc: kyc._id }),
      profession: payload.profession,
      category: payload.category,
      specialization: payload.specialization,
      skills: payload.skills,
      yearsOfExperience: payload.yearsOfExperience,
      serviceDescription: payload.serviceDescription,
      businessName: payload.businessName,
      businessRegistrationNumber: payload.businessRegistrationNumber,
      serviceAreas: payload.serviceAreas,
      availability: payload.availability,
      operatingHours: payload.operatingHours,
      licenses: payload.licenses,
      isVerified: payload.isVerified,
      ministry: payload.ministry || undefined,
      assignedBy: payload.assignedBy || undefined,
      educationLevels: payload.educationLevel,
      assignmentDate: payload.assignmentDate || undefined,
      portfolio: payload.portfolio,
      rating: payload.rating,
      status: payload.status,
      address: payload.address,
    };

    const serviceProvider = new ServiceProvider(spData);
    await serviceProvider.save({ session });

    await session.commitTransaction();
    session.endSession();
    return serviceProvider;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}

// 3. Create submission record
async function createSubmissionRecord(payload, serviceProvider, user) {
  const submission = await createSubmission({
    ministry: payload.ministry || undefined,
    agentId: payload.assignedBy || undefined,
    category: "services",
    status: "pending",
    professionCategory: payload.category,
    profession: payload.profession,
    submissionId: serviceProvider._id,
    serviceProviderId: user._id,
  });

  return submission;
}

// 4. Create transaction record
async function createTransactionRecord(
  payload,
  user,
  submission,
  serviceProvider
) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const transactionData = {
      userId: user._id,
      submissionId: submission._id,
      amount: payload.registrationFee || 0,
      reference: payload.paymentReference || `SP_REG_${Date.now()}_${user._id}`,
      status: payload.paymentStatus || "pending",
      paymentMethod: payload.paymentMethod || "online",
      gatewayReference: payload.gatewayReference,
      description: `Service Provider Registration - ${payload.profession}`,
      paymentDate: new Date(),
      metadata: {
        serviceProviderId: serviceProvider._id,
        profession: payload.profession,
        category: payload.category,
        registrationType: "services",
      },
    };

    const transaction = new TransactionServiceHub(transactionData);
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();
    return transaction;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}

// Main orchestrator function
async function createServiceProvider(payload) {
  return retryOperation(async () => {
    try {
      console.log("Starting service provider creation process...");

      // Step 1: Create user and KYC
      console.log("Step 1: Creating user and KYC...");
      const { user, kyc } = await createUserAndKYC(payload);
      console.log("User created/updated:", user._id);

      // Step 2: Create service provider record
      console.log("Step 2: Creating service provider record...");
      const serviceProvider = await createServiceProviderRecord(
        payload,
        user,
        kyc
      );
      console.log("Service provider created:", serviceProvider._id);

      // Step 3: Create submission record
      console.log("Step 3: Creating submission record...");
      const submission = await createSubmissionRecord(
        payload,
        serviceProvider,
        user
      );
      console.log("Submission created:", submission._id);

      // Step 4: Create transaction record
      console.log("Step 4: Creating transaction record...");
      const transaction = await createTransactionRecord(
        payload,
        user,
        submission,
        serviceProvider
      );
      console.log("Transaction created:", transaction._id);

      console.log("Service provider creation completed successfully!");
      return { user, serviceProvider, submission, transaction };
    } catch (err) {
      console.error("Error in createServiceProvider:", err);
      throw err;
    }
  });
}
async function getServiceProviderByMinistry(ministryId, options = {}) {
  try {
    const { filter = {}, sort = "-createdAt", page = 1, limit = 10 } = options;

    // Use the filter directly (it may be an $or query)
    const query = filter;

    const skip = (page - 1) * limit;

    console.log("query:", JSON.stringify(query, null, 2));

    const serviceProviders = await ServiceProvider.find(query)
      .sort(sort)
      .skip(skip)
      .populate("user")
      .populate("kyc")
      .limit(limit);

    return serviceProviders;
  } catch (error) {
    throw error;
  }
}

// async function getServiceProviderById(id) {
//   try {
//     const serviceProvider = await ServiceProvider.findById(id);
//     return serviceProvider;
//   } catch (error) {
//     throw error;
//   }
// }

async function getServiceProviderById(id) {
  try {
    const serviceProvider = await ServiceProvider.findById(id)
      .populate("user", "fullName email phoneNumber gender")
      .populate("kyc", "fullName nin photo dateOfBirth")
      .populate("ministry", "name description")
      .populate("assignedBy", "fullName email");

    if (!serviceProvider) {
      throw new Error("Service provider not found");
    }

    // Get certifications for the service provider
    const certifications = await mongoose.model("Certifications").find({
      entityId: serviceProvider.user._id,
    });

    // Return the same structure as search endpoint
    return {
      ...serviceProvider.toObject(),
      certifications,
    };
  } catch (error) {
    throw error;
  }
}
async function getServiceProviders(filter = {}, options = {}) {
  const { page = 1, limit = 10, sort = "-createdAt" } = options;
  const skip = (page - 1) * limit;
  const [properties, total] = await Promise.all([
    ServiceProvider.find(filter).sort(sort).skip(skip).limit(limit),
    ServiceProvider.countDocuments(filter),
  ]);
  return { properties, total };
}

async function updateServiceProvider(id, data) {
  try {
    const updatedServiceProvider = await ServiceProvider.findByIdAndUpdate(
      id,
      data,
      { new: true }
    );
    return updatedServiceProvider;
  } catch (error) {
    throw error;
  }
}

// Search and filter service providers
async function searchAndFilterServiceProviders(searchParams = {}) {
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
    } = searchParams;

    // Build the filter object
    const filter = {};

    // Text search across multiple fields (only for non-aggregation queries)
    if (search) {
      // Escape regex special characters to prevent regex errors
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(escapedSearch, "i");
      filter.$or = [
        { profession: searchRegex },
        { specialization: searchRegex },
        { businessName: searchRegex },
        { serviceDescription: searchRegex },
        { "address.street": searchRegex },
        { "address.city": searchRegex },
        { "address.state": searchRegex },
      ];
    }

    // Exact match filters
    if (profession) {
      if (Array.isArray(profession)) {
        // For array of professions, use case-insensitive regex for each
        filter.profession = {
          $in: profession.map(
            (prof) =>
              new RegExp(prof.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
          ),
        };
      } else {
        // For single profession, use case-insensitive regex
        filter.profession = new RegExp(
          profession.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          "i"
        );
      }
    }

    if (category) {
      if (Array.isArray(category)) {
        // For array of categories, use case-insensitive regex for each
        filter.category = {
          $in: category.map(
            (cat) => new RegExp(cat.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
          ),
        };
      } else {
        // For single category, use case-insensitive regex
        filter.category = new RegExp(
          category.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          "i"
        );
      }
    }

    if (specialization) {
      if (Array.isArray(specialization)) {
        // For array of specializations, use case-insensitive regex for each
        filter.specialization = {
          $in: specialization.map(
            (spec) =>
              new RegExp(spec.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
          ),
        };
      } else {
        // For single specialization, use case-insensitive regex
        filter.specialization = new RegExp(
          specialization.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          "i"
        );
      }
    }

    if (skills && skills.length > 0) {
      filter.skills = { $in: skills };
    }

    if (availability) {
      if (Array.isArray(availability)) {
        // For array of availability statuses, use case-insensitive regex for each
        filter.availability = {
          $in: availability.map(
            (avail) =>
              new RegExp(avail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
          ),
        };
      } else {
        // For single availability status, use case-insensitive regex
        filter.availability = new RegExp(
          availability.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          "i"
        );
      }
    }

    if (isVerified !== undefined) {
      filter.isVerified = isVerified;
    }

    if (status) {
      if (Array.isArray(status)) {
        // For array of statuses, use case-insensitive regex for each
        filter.status = {
          $in: status.map(
            (stat) =>
              new RegExp(stat.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
          ),
        };
      } else {
        // For single status, use case-insensitive regex
        filter.status = new RegExp(
          status.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          "i"
        );
      }
    }

    if (approvalstatus) {
      if (Array.isArray(approvalstatus)) {
        // For array of approval statuses, use case-insensitive regex for each
        filter.approvalstatus = {
          $in: approvalstatus.map(
            (approval) =>
              new RegExp(approval.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
          ),
        };
      } else {
        // For single approval status, use case-insensitive regex
        filter.approvalstatus = new RegExp(
          approvalstatus.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          "i"
        );
      }
    }

    if (ministry) {
      if (Array.isArray(ministry)) {
        filter.ministry = { $in: ministry };
      } else {
        filter.ministry = ministry;
      }
    }

    if (educationLevels) {
      if (Array.isArray(educationLevels)) {
        // For array of education levels, use case-insensitive regex for each
        filter.educationLevels = {
          $in: educationLevels.map(
            (edu) => new RegExp(edu.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
          ),
        };
      } else {
        // For single education level, use case-insensitive regex
        filter.educationLevels = new RegExp(
          educationLevels.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          "i"
        );
      }
    }

    // Location filters
    if (state) {
      filter["address.state"] = new RegExp(state, "i");
    }

    if (city) {
      filter["address.city"] = new RegExp(city, "i");
    }

    if (zip) {
      filter["address.zip"] = zip;
    }

    // Rating filters
    if (minRating !== undefined || maxRating !== undefined) {
      filter["rating.average"] = {};
      if (minRating !== undefined) {
        filter["rating.average"].$gte = parseFloat(minRating);
      }
      if (maxRating !== undefined) {
        filter["rating.average"].$lte = parseFloat(maxRating);
      }
    }

    // Experience filters
    if (minExperience !== undefined || maxExperience !== undefined) {
      filter.yearsOfExperience = {};
      if (minExperience !== undefined) {
        filter.yearsOfExperience.$gte = parseInt(minExperience);
      }
      if (maxExperience !== undefined) {
        filter.yearsOfExperience.$lte = parseInt(maxExperience);
      }
    }

    // Date filters
    if (createdAfter || createdBefore) {
      filter.createdAt = {};
      if (createdAfter) {
        filter.createdAt.$gte = new Date(createdAfter);
      }
      if (createdBefore) {
        filter.createdAt.$lte = new Date(createdBefore);
      }
    }

    if (assignedAfter || assignedBefore) {
      filter.assignmentDate = {};
      if (assignedAfter) {
        filter.assignmentDate.$gte = new Date(assignedAfter);
      }
      if (assignedBefore) {
        filter.assignmentDate.$lte = new Date(assignedBefore);
      }
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Check if we need to search by user name (which requires aggregation)
    const needsUserSearch = search || userName; // Always use aggregation when there's a search or userName parameter

    // If using aggregation, remove search conditions from filter to avoid conflicts
    if (needsUserSearch && filter.$or) {
      delete filter.$or;
    }

    if (needsUserSearch) {
      console.log("Using aggregation pipeline for search:", {
        search,
        userName,
      });
      console.log("Filter object:", JSON.stringify(filter, null, 2));
      // Simplified aggregation pipeline for user name search
      const pipeline = [
        // Lookup user data
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "userData",
          },
        },
        // Apply filters
        {
          $match: {
            $and: [
              // Apply other filters (profession, category, etc.)
              ...(Object.keys(filter).length > 0 ? [filter] : []),
              // Apply search conditions
              {
                $or: [
                  // Original search fields (only if search parameter is provided)
                  ...(search
                    ? [
                        {
                          profession: new RegExp(
                            search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                            "i"
                          ),
                        },
                        {
                          specialization: new RegExp(
                            search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                            "i"
                          ),
                        },
                        {
                          businessName: new RegExp(
                            search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                            "i"
                          ),
                        },
                        {
                          serviceDescription: new RegExp(
                            search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                            "i"
                          ),
                        },
                        {
                          "address.street": new RegExp(
                            search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                            "i"
                          ),
                        },
                        {
                          "address.city": new RegExp(
                            search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                            "i"
                          ),
                        },
                        {
                          "address.state": new RegExp(
                            search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                            "i"
                          ),
                        },
                        // User name search (also included in general search)
                        {
                          "userData.fullName": new RegExp(
                            search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                            "i"
                          ),
                        },
                      ]
                    : []),
                  // Specific user name search (if userName parameter is provided)
                  ...(userName
                    ? [
                        {
                          "userData.fullName": new RegExp(
                            userName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                            "i"
                          ),
                        },
                      ]
                    : []),
                ],
              },
            ],
          },
        },
        // Add additional lookups if populate is true
        ...(populate
          ? [
              {
                $lookup: {
                  from: "kycdocuments",
                  localField: "kyc",
                  foreignField: "_id",
                  as: "kycData",
                },
              },
              {
                $lookup: {
                  from: "ministries",
                  localField: "ministry",
                  foreignField: "_id",
                  as: "ministryData",
                },
              },
              {
                $lookup: {
                  from: "users",
                  localField: "assignedBy",
                  foreignField: "_id",
                  as: "assignedByData",
                },
              },
              // Lookup certifications for the service provider
              {
                $lookup: {
                  from: "certifications",
                  localField: "user",
                  foreignField: "entityId",
                  as: "certifications",
                },
              },
            ]
          : []),
        // Project fields
        {
          $project: {
            user: { $arrayElemAt: ["$userData", 0] },
            ...(populate && {
              kyc: { $arrayElemAt: ["$kycData", 0] },
              ministry: { $arrayElemAt: ["$ministryData", 0] },
              assignedBy: { $arrayElemAt: ["$assignedByData", 0] },
              certifications: 1, // Include all certifications for the service provider
            }),
            profession: 1,
            category: 1,
            specialization: 1,
            skills: 1,
            yearsOfExperience: 1,
            availability: 1,
            isVerified: 1,
            status: 1,
            approvalstatus: 1,
            rating: 1,
            address: 1,
            businessName: 1,
            serviceDescription: 1,
            educationLevels: 1,
            createdAt: 1,
            updatedAt: 1,
            assignmentDate: 1,
          },
        },
        // Apply sorting
        {
          $sort:
            sort === "-createdAt"
              ? { createdAt: -1 }
              : sort === "createdAt"
              ? { createdAt: 1 }
              : sort === "-rating.average"
              ? { "rating.average": -1 }
              : sort === "rating.average"
              ? { "rating.average": 1 }
              : sort === "-yearsOfExperience"
              ? { yearsOfExperience: -1 }
              : sort === "yearsOfExperience"
              ? { yearsOfExperience: 1 }
              : sort === "profession"
              ? { profession: 1 }
              : sort === "-profession"
              ? { profession: -1 }
              : { createdAt: -1 },
        },
        // Apply pagination
        { $skip: skip },
        { $limit: parseInt(limit) },
      ];

      // Execute aggregation and get total count
      const [serviceProviders, totalResult] = await Promise.all([
        ServiceProvider.aggregate(pipeline),
        ServiceProvider.aggregate([
          ...pipeline.slice(0, -2), // Remove skip and limit for count
          { $count: "total" },
        ]),
      ]);

      // Debug: Let's see what user names exist in the database
      const debugPipeline = [
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "userData",
          },
        },
        {
          $project: {
            fullName: { $arrayElemAt: ["$userData.fullName", 0] },
            profession: 1,
          },
        },
        { $limit: 5 },
      ];

      const debugResults = await ServiceProvider.aggregate(debugPipeline);
      console.log(
        "Debug - Sample user names in database:",
        debugResults.map((r) => ({
          fullName: r.fullName,
          profession: r.profession,
        }))
      );
      console.log("Debug - Search term:", search);
      console.log(
        "Debug - Search regex:",
        search
          ? new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
          : "N/A"
      );

      // Test simple search without other filters
      const simpleTestPipeline = [
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "userData",
          },
        },
        {
          $match: {
            "userData.fullName": new RegExp(
              search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
              "i"
            ),
          },
        },
        {
          $project: {
            fullName: { $arrayElemAt: ["$userData.fullName", 0] },
            profession: 1,
          },
        },
        { $limit: 3 },
      ];

      const simpleTestResults = await ServiceProvider.aggregate(
        simpleTestPipeline
      );
      console.log("Debug - Simple name search results:", simpleTestResults);

      const total = totalResult.length > 0 ? totalResult[0].total : 0;

      return {
        serviceProviders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
          hasNext: skip + parseInt(limit) < total,
          hasPrev: parseInt(page) > 1,
        },
        filters: searchParams,
      };
    } else {
      console.log("Using regular find query for non-name searches");
      // Use regular find query for non-name searches
      let query = ServiceProvider.find(filter);

      // Apply sorting
      if (sort) {
        query = query.sort(sort);
      }

      // Apply pagination
      query = query.skip(skip).limit(parseInt(limit));

      // Apply population
      if (populate) {
        query = query
          .populate("user", "fullName email phoneNumber gender")
          .populate("kyc", "fullName nin photo dateOfBirth")
          .populate("ministry", "name description")
          .populate("assignedBy", "fullName email");

        // Add certifications lookup for regular queries
        // We need to use aggregation for certifications since it's not a direct reference
        const serviceProviders = await query.exec();

        // Get certifications for each service provider
        const serviceProvidersWithCertifications = await Promise.all(
          serviceProviders.map(async (provider) => {
            const certifications = await mongoose.model("Certifications").find({
              entityId: provider.user._id,
            });
            return {
              ...provider.toObject(),
              certifications,
            };
          })
        );

        return {
          serviceProviders: serviceProvidersWithCertifications,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
            hasNext: skip + parseInt(limit) < total,
            hasPrev: parseInt(page) > 1,
          },
          filters: searchParams,
        };
      }

      // Execute query and get total count
      const [serviceProviders, total] = await Promise.all([
        query.exec(),
        ServiceProvider.countDocuments(filter),
      ]);
    }

    return {
      serviceProviders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      },
      filters: searchParams,
    };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getServiceProviderByMinistry,
  createServiceProvider,
  getServiceProviderById,
  getServiceProviders,
  updateServiceProvider,
  searchAndFilterServiceProviders,
};

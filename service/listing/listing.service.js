const { Product } = require("../../models/Product");
const { Business } = require("../../models/Business");
const Property = require("../../models/Property");
const { Service } = require("../../models/Service");
const mongoose = require("mongoose");
const levenshtein = require("fast-levenshtein"); // Levenshtein distance package
const pluralize = require("pluralize"); // Pluralize package to handle singular/plural
const FuzzySet = require("fuzzyset.js");

class ListingService {
  // Normalize search term to handle singular/plural and remove extra spaces
  normalizeSearchTerm(searchTerm) {
    return pluralize.singular(
      searchTerm
        .trim()
        .replace(/[\s-]+/g, " ")
        .toLowerCase()
    );
  }

  // Apply fuzzy search using Levenshtein distance for better typo handling
  applyFuzzySearch(items, fields, search) {
    if (!search) return items;

    const normalizedSearch = this.normalizeSearchTerm(search);

    return items.filter((item) => {
      const combinedText = fields
        .map((field) => item[field] || "")
        .join(" ")
        .toLowerCase();

      const normalizedText = this.normalizeSearchTerm(combinedText);

      // Levenshtein distance threshold (adjust if needed)
      const threshold = 2; // Allow for up to 2 character differences

      // Check if the Levenshtein distance is within the threshold
      const distance = levenshtein.get(normalizedSearch, normalizedText);
      if (distance <= threshold) {
        return true;
      }

      // Case-insensitive regex match for normal search
      const regex = new RegExp(normalizedSearch, "i");
      return regex.test(normalizedText);
    });
  }
  // Apply fuzzy search with logging to check the distance

  // Fetch data for listings and handle pagination the very first
  async getAllListings(query = {}) {
    try {
      const {
        type,
        search,
        minPrice,
        maxPrice,
        category,
        location,
        status,
        ownerId,
        featured,
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = -1,
      } = query;

      const baseFilter = {};

      if (minPrice || maxPrice) {
        baseFilter.price = {};
        if (minPrice) baseFilter.price.$gte = Number(minPrice);
        if (maxPrice) baseFilter.price.$lte = Number(maxPrice);
      }

      if (category && !type) {
        baseFilter.category = category;
      }

      if (type === "properties" && category) {
        baseFilter.propertyType = category;
      } else if (type === "businesses" && category) {
        baseFilter.businessType = category;
      } else if (type === "products" && category) {
        baseFilter.category = category;
      } else if (type === "services" && category) {
        baseFilter.serviceCategory = category;
      }

      if (location) {
        baseFilter.location = { $regex: location, $options: "i" };
      }

      if (status) {
        baseFilter.status = status;
      }

      if (ownerId) {
        baseFilter.ownerId = ownerId;
      }

      // Add featured filter
      if (featured !== undefined) {
        baseFilter.featured = featured;
      }

      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder };

      const fetchData = async (Model, filter) => {
        const data = await Model.find(filter)
          .collation({ locale: "en", strength: 2 })
          .sort(sort)
          .exec();
        return data;
      };

      const filterAndPaginate = (items) => {
        const paginated = items.slice(skip, skip + Number(limit));
        return { data: paginated, count: items.length };
      };

      let results = {};
      let total = {};

      const process = async (Model, typeKey, fields) => {
        const items = await fetchData(Model, baseFilter);
        const filtered = this.applyFuzzySearch(items, fields, search);
        const { data, count } = filterAndPaginate(filtered);
        results[typeKey] = data;
        total[typeKey] = count;
      };

      const typeMap = {
        products: { model: Product, fields: ["prodName", "description"] },
        businesses: {
          model: Business,
          fields: ["legalname", "businessDescription"],
        },
        properties: {
          model: Property,
          fields: ["title", "propertyType", "description", "address"],
        },
        services: {
          model: Service,
          fields: ["serviceName", "description", "serviceCategory"],
        },
      };

      if (!type || type === "all") {
        await Promise.all(
          Object.entries(typeMap).map(([key, val]) =>
            process(val.model, key, val.fields)
          )
        );

        total.total =
          total.products + total.businesses + total.properties + total.services;
      } else {
        const entry = typeMap[type];
        if (!entry) throw new Error("Invalid listing type");
        await process(entry.model, type, entry.fields);
        total.total = total[type];
      }

      return {
        data: results,
        pagination: {
          total: total.total,
          totalPages: Math.ceil(total.total / limit),
          currentPage: page,
          limit,
        },
        filters: {
          search,
          minPrice,
          maxPrice,
          category,
          location,
          status,
          ownerId,
        },
        sort: {
          field: sortBy,
          order: sortOrder === 1 ? "asc" : "desc",
        },
      };
    } catch (error) {
      console.error("Error in getAllListings:", error);
      throw error;
    }
  }

  // Fetch data for listings and handle pagination second
  // async getAllListings(query = {}) {
  //   try {
  //     const {
  //       type,
  //       search,
  //       minPrice,
  //       maxPrice,
  //       category,
  //       location,
  //       status,
  //       ownerId,
  //       featured,
  //       page = 1,
  //       limit = 10,
  //       sortBy = "createdAt",
  //       sortOrder = -1,
  //     } = query;

  //     const baseFilter = {};

  //     if (minPrice || maxPrice) {
  //       baseFilter.price = {};
  //       if (minPrice) baseFilter.price.$gte = Number(minPrice);
  //       if (maxPrice) baseFilter.price.$lte = Number(maxPrice);
  //     }

  //     if (category && !type) {
  //       baseFilter.category = category;
  //     }

  //     if (type === "properties" && category) {
  //       baseFilter.propertyType = category;
  //     } else if (type === "businesses" && category) {
  //       baseFilter.businessType = category;
  //     } else if (type === "products" && category) {
  //       baseFilter.category = category;
  //     } else if (type === "services" && category) {
  //       baseFilter.serviceCategory = category;
  //     }

  //     if (location) {
  //       baseFilter.location = { $regex: location, $options: "i" };
  //     }

  //     if (status) {
  //       baseFilter.status = status;
  //     }

  //     if (ownerId) {
  //       baseFilter.ownerId = ownerId;
  //     }

  //     if (featured !== undefined) {
  //       baseFilter.featured = featured;
  //     }

  //     const skip = (page - 1) * limit;

  //     // Custom sort: prioritize featured_until if featured === true
  //     const dynamicSort = {};
  //     if (featured && type === "products") {
  //       dynamicSort.featured_until = -1;
  //     } else {
  //       dynamicSort[sortBy] = sortOrder;
  //     }

  //     const fetchData = async (Model, filter) => {
  //       const data = await Model.find(filter)
  //         .collation({ locale: "en", strength: 2 })
  //         .sort(dynamicSort)
  //         .exec();
  //       return data;
  //     };

  //     const filterAndPaginate = (items) => {
  //       const paginated = items.slice(skip, skip + Number(limit));
  //       return { data: paginated, count: items.length };
  //     };

  //     let results = {};
  //     let total = {};

  //     const process = async (Model, typeKey, fields) => {
  //       const items = await fetchData(Model, baseFilter);
  //       const filtered = this.applyFuzzySearch(items, fields, search);
  //       const { data, count } = filterAndPaginate(filtered);
  //       results[typeKey] = data;
  //       total[typeKey] = count;
  //     };

  //     const typeMap = {
  //       products: { model: Product, fields: ["prodName", "description"] },
  //       businesses: {
  //         model: Business,
  //         fields: ["legalname", "businessDescription"],
  //       },
  //       properties: {
  //         model: Property,
  //         fields: ["title", "propertyType", "description", "address"],
  //       },
  //       services: {
  //         model: Service,
  //         fields: ["serviceName", "description", "serviceCategory"],
  //       },
  //     };

  //     if (!type || type === "all") {
  //       await Promise.all(
  //         Object.entries(typeMap).map(([key, val]) =>
  //           process(val.model, key, val.fields)
  //         )
  //       );
  //       total.total =
  //         total.products + total.businesses + total.properties + total.services;
  //     } else {
  //       const entry = typeMap[type];
  //       if (!entry) throw new Error("Invalid listing type");
  //       await process(entry.model, type, entry.fields);
  //       total.total = total[type];
  //     }

  //     return {
  //       data: results,
  //       pagination: {
  //         total: total.total,
  //         totalPages: Math.ceil(total.total / limit),
  //         currentPage: page,
  //         limit,
  //       },
  //       filters: {
  //         search,
  //         minPrice,
  //         maxPrice,
  //         category,
  //         location,
  //         status,
  //         ownerId,
  //       },
  //       sort: {
  //         field: featured && type === "products" ? "featured_until" : sortBy,
  //         order: "desc",
  //       },
  //     };
  //   } catch (error) {
  //     console.error("Error in getAllListings:", error);
  //     throw error;
  //   }
  // }

  // Fetch data for listings and handle pagination
  // async getAllListings(query = {}) {
  //   try {
  //     const {
  //       type,
  //       search,
  //       minPrice,
  //       maxPrice,
  //       category,
  //       location,
  //       status,
  //       ownerId,
  //       featured,
  //       page = 1,
  //       limit = 10,
  //       sortBy = "createdAt",
  //       sortOrder = -1,
  //     } = query;

  //     const baseFilter = {};

  //     if (minPrice || maxPrice) {
  //       baseFilter.price = {};
  //       if (minPrice) baseFilter.price.$gte = Number(minPrice);
  //       if (maxPrice) baseFilter.price.$lte = Number(maxPrice);
  //     }

  //     if (category && !type) {
  //       baseFilter.category = category;
  //     }

  //     if (type === "properties" && category) {
  //       baseFilter.propertyType = category;
  //     } else if (type === "businesses" && category) {
  //       baseFilter.businessType = category;
  //     } else if (type === "products" && category) {
  //       baseFilter.category = category;
  //     } else if (type === "services" && category) {
  //       baseFilter.serviceCategory = category;
  //     }

  //     if (location) {
  //       baseFilter.location = { $regex: location, $options: "i" };
  //     }

  //     if (status) {
  //       baseFilter.status = status;
  //     }

  //     if (ownerId) {
  //       baseFilter.ownerId = ownerId;
  //     }

  //     if (featured !== undefined) {
  //       baseFilter.featured = featured;
  //     }

  //     const skip = (page - 1) * limit;

  //     // Custom sort: prioritize featured_until if featured === true
  //     const dynamicSort = {};
  //     if (featured && type === "products") {
  //       dynamicSort.featured_until = -1;
  //     } else {
  //       dynamicSort[sortBy] = sortOrder;
  //     }

  //     const fetchData = async (Model, filter) => {
  //       const data = await Model.find(filter)
  //         .collation({ locale: "en", strength: 2 })
  //         .sort(dynamicSort)
  //         .exec();
  //       return data;
  //     };

  //     const filterAndPaginate = (items) => {
  //       const paginated = items.slice(skip, skip + Number(limit));
  //       return { data: paginated, count: items.length };
  //     };

  //     let results = {};
  //     let total = {};

  //     const process = async (Model, typeKey, fields) => {
  //       const items = await fetchData(Model, baseFilter);
  //       const filtered = this.applyFuzzySearch(items, fields, search);
  //       const { data, count } = filterAndPaginate(filtered);
  //       results[typeKey] = data;
  //       total[typeKey] = count;
  //     };

  //     const typeMap = {
  //       products: { model: Product, fields: ["prodName", "description"] },
  //       businesses: {
  //         model: Business,
  //         fields: ["legalname", "businessDescription"],
  //       },
  //       properties: {
  //         model: Property,
  //         fields: ["title", "propertyType", "description", "address"],
  //       },
  //       services: {
  //         model: Service,
  //         fields: ["serviceName", "description", "serviceCategory"],
  //       },
  //     };

  //     if (!type || type === "all") {
  //       await Promise.all(
  //         Object.entries(typeMap).map(([key, val]) =>
  //           process(val.model, key, val.fields)
  //         )
  //       );
  //       total.total =
  //         total.products + total.businesses + total.properties + total.services;
  //     } else {
  //       const entry = typeMap[type];
  //       if (!entry) throw new Error("Invalid listing type");
  //       await process(entry.model, type, entry.fields);
  //       total.total = total[type];
  //     }

  //     return {
  //       data: results,
  //       pagination: {
  //         total: total.total,
  //         totalPages: Math.ceil(total.total / limit),
  //         currentPage: page,
  //         limit,
  //       },
  //       filters: {
  //         search,
  //         minPrice,
  //         maxPrice,
  //         category,
  //         location,
  //         status,
  //         ownerId,
  //       },
  //       sort: {
  //         field: featured && type === "products" ? "featured_until" : sortBy,
  //         order: "desc",
  //       },
  //     };
  //   } catch (error) {
  //     console.error("Error in getAllListings:", error);
  //     throw error;
  //   }
  // }

  async getFeaturedListings(query = {}) {
    return this.getAllListings({ ...query, featured: true });
  }

  async getListingById(id, type = null) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid listing ID");
      }

      if (type) {
        const ModelMap = {
          products: Product,
          businesses: Business,
          properties: Property,
          services: Service,
        };

        const Model = ModelMap[type];
        if (!Model) throw new Error("Invalid listing type");

        const listingWithUser = await Model.aggregate([
          { $match: { _id: new mongoose.Types.ObjectId(id) } },
          {
            $lookup: {
              from: "users",
              localField: "ownerId",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        ]);

        if (!listingWithUser.length) {
          throw new Error(`${type.slice(0, -1)} not found`);
        }

        return {
          data: listingWithUser[0],
          type,
        };
      }

      const [product, business, property, service] = await Promise.all([
        Product.findById(id),
        Business.findById(id),
        Property.findById(id),
        Service.findById(id),
      ]);

      const foundListing = product || business || property || service;
      if (!foundListing) {
        throw new Error("Listing not found in any collection");
      }

      let listingType;
      if (product) listingType = "products";
      else if (business) listingType = "businesses";
      else if (property) listingType = "properties";
      else if (service) listingType = "services";

      return {
        data: sortListingsByFeatured(foundListing),
        type: listingType,
      };
    } catch (error) {
      console.error("Error in getListingById:", error);
      throw error;
    }
  }
  async sortListingsByFeatured(listings) {
    // Create a shallow copy to avoid modifying the original array
    const sortedListings = [...listings];

    sortedListings.sort((a, b) => {
      // 1. Prioritize Featured Listings
      if (a.featured && !b.featured) {
        return -1; // 'a' (featured) comes before 'b' (not featured)
      }
      if (!a.featured && b.featured) {
        return 1; // 'b' (featured) comes before 'a' (not featured)
      }

      // If both are featured OR both are not featured, apply secondary sorting criteria.
      // In this case, we sort by creation date (newest first) and then by views (highest first).

      // 2. Sort by Creation Date (Newest First)
      // Convert dates to numbers for easy comparison
      const dateA = a.featured_until.getTime();
      const dateB = b.featured_until.getTime();

      if (dateA > dateB) {
        return -1; // 'a' is newer, comes before 'b'
      }
      if (dateA < dateB) {
        return 1; // 'b' is newer, comes before 'a'
      }

      // 3. Sort by Views (Highest First) - if creation dates are the same
      if (a.views > b.views) {
        return -1; // 'a' has more views, comes before 'b'
      }
      if (a.views < b.views) {
        return 1; // 'b' has more views, comes before 'a'
      }

      // If all criteria are the same, maintain original relative order (or stable sort behavior)
      return 0;
    });

    return sortedListings;
  }
  async deleteListingById(id, type = null) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid listing ID");
      }

      const ModelMap = {
        products: Product,
        businesses: Business,
        properties: Property,
        services: Service,
      };

      // If type is provided, only delete from that specific model
      if (type) {
        const Model = ModelMap[type];
        if (!Model) {
          throw new Error("Invalid listing type");
        }

        const listing = await Model.findById(id);
        if (!listing) {
          throw new Error(`${type.slice(0, -1)} not found`);
        }

        // Delete the listing
        await Model.findByIdAndDelete(id);
        return {
          success: true,
          message: `${type.slice(0, -1)} deleted successfully`,
          data: listing,
        };
      }

      // If no type provided, search and delete from all models
      const results = await Promise.all(
        Object.entries(ModelMap).map(async ([modelType, Model]) => {
          const listing = await Model.findById(id);
          if (listing) {
            await Model.findByIdAndDelete(id);
            return {
              type: modelType,
              data: listing,
            };
          }
          return null;
        })
      );

      const deletedListing = results.find((result) => result !== null);
      if (!deletedListing) {
        throw new Error("Listing not found in any category");
      }

      return {
        success: true,
        message: `${deletedListing.type.slice(0, -1)} deleted successfully`,
        data: deletedListing.data,
      };
    } catch (error) {
      console.error("Error deleting listing:", error);
      throw new Error(error.message || "Failed to delete listing");
    }
  }

  async updateListingById(id, updateData, type = null) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid listing ID");
      }
      const ModelMap = {
        products: Product,
        businesses: Business,
        properties: Property,
        services: Service,
      };

      // If type is provided, only update in that specific model
      if (type) {
        const Model = ModelMap[type];
        if (!Model) {
          throw new Error("Invalid listing type");
        }

        // Validate required fields based on type
        //this.validateUpdateData(updateData, type);

        const listing = await Model.findById(id);
        if (!listing) {
          throw new Error(`${type.slice(0, -1)} not found`);
        }

        // Update the listing
        const updatedListing = await Model.findByIdAndUpdate(
          id,
          { $set: updateData },
          { new: true, runValidators: true }
        );

        return {
          success: true,
          message: `${type.slice(0, -1)} updated successfully`,
          data: updateData,
        };
      }

      // If no type provided, search and update in all models
      // const results = await Promise.all(
      //   Object.entries(ModelMap).map(async ([modelType, Model]) => {
      //     const listing = await Model.findById(id);
      //     if (listing) {
      //       // Validate required fields based on type
      //       this.validateUpdateData(updateData, modelType);

      //       const updatedListing = await Model.findByIdAndUpdate(
      //         id,
      //         { $set: updateData },
      //         { new: true, runValidators: true }
      //       );

      //       return {
      //         type: modelType,
      //         data: updatedListing,
      //       };
      //     }
      //     return null;
      //   })
      // );

      // const updatedListing = results.find((result) => result !== null);
      // if (!updatedListing) {
      //   throw new Error("Listing not found in any category");
      // }

      return {
        success: true,
        message: `${updatedListing.type.slice(0, -1)} updated successfully`,
        data: updatedListing.data,
      };
    } catch (error) {
      console.error("Error updating listing:", error);
      throw new Error(error.message || "Failed to update listing");
    }
  }

  // Helper method to validate update data based on listing type
  validateUpdateData(updateData, type) {
    const requiredFields = {
      products: ["prodName", "price", "category"],
      businesses: ["legalname", "businessType", "businessDescription"],
      properties: ["title", "propertyType", "description", "address"],
      services: ["serviceName", "serviceCategory", "description"],
    };

    const fields = requiredFields[type];
    if (!fields) {
      throw new Error("Invalid listing type");
    }

    // Check if at least one required field is being updated
    const hasRequiredField = fields.some((field) => field in updateData);
    if (!hasRequiredField) {
      throw new Error(
        `Update must include at least one of the required fields: ${fields.join(
          ", "
        )}`
      );
    }

    // Validate price if it's being updated
    if (updateData.price !== undefined) {
      if (typeof updateData.price !== "number" || updateData.price < 0) {
        throw new Error("Price must be a positive number");
      }
    }

    // Validate status if it's being updated
    if (updateData.status !== undefined) {
      const validStatuses = ["active", "inactive", "pending", "sold", "rented"];
      if (!validStatuses.includes(updateData.status)) {
        throw new Error(`Status must be one of: ${validStatuses.join(", ")}`);
      }
    }

    // Validate featured status if it's being updated
    if (updateData.featured !== undefined) {
      if (typeof updateData.featured !== "boolean") {
        throw new Error("Featured status must be a boolean");
      }
    }
  }

  async getFeaturedServiceListingsWithActiveLicenseAndSorted() {
    // try {
    //   const activeListings = await Service.find({ featured: true })
    //     .populate({
    //       path: "entityId",
    //       model: "Users",
    //       populate: {
    //         path: "certification",
    //         model: "Certifications",
    //         match: {
    //           licenseActive: true,
    //           expirationDate: { $gte: new Date() },
    //         },
    //       },
    //     })
    //     .sort({ promotionDate: -1 })
    //     .exec();

    //   // Filter out listings where the populated user or certification didn't match the criteria
    //   const filteredListings = activeListings.filter(
    //     (listing) =>
    //       listing.userId &&
    //       listing.userId.certification &&
    //       listing.userId.certification.licenseActive === true
    //   );

    //   return filteredListings;
    // } catch (error) {
    //   console.error(
    //     "Error fetching featured listings with active license and sorting:",
    //     error
    //   );
    //   throw error;
    // }

    try {
      // Step 1: Find featured listings and populate their associated user.
      // Also sort by promotionDate from newest to oldest.
      const listings = await Service.find({ featured: true })
        .populate({
          path: "_id",
          model: "Users", // This MUST match the model name in your User schema definition
        })
        .sort({ promotionDate: -1 }) // Sort listings by promotionDate newest first
        .exec();

      // Step 2: Now that we have listings with populated users, we need to
      // find the active certifications for those users.
      // We'll gather all unique user IDs from the populated listings.
      const userIds = listings
        .filter((listing) => listing.userId) // Only consider listings with a valid user
        .map((listing) => listing.userId._id);

      // If no users, we can return early
      if (userIds.length === 0) {
        console.log("No users found for featured listings.");
        return [];
      }

      // Step 3: Find all active certifications for these users.
      // We look for certifications where:
      // - `entityId` is one of the `userIds`
      // - `status` is 'active'
      // - `expirationDate` is in the future or today
      const activeCertifications = await Certification.find({
        entityId: { $in: userIds },
        status: "active",
        expirationDate: { $gte: new Date() },
      }).select("entityId"); // We only need the entityId to link back to users/listings

      // Step 4: Create a Set of user IDs that have active certifications for quick lookup.
      const usersWithActiveCert = new Set(
        activeCertifications.map((cert) => cert.entityId.toString())
      );

      // Step 5: Filter the original populated listings based on whether their user has an active certification.
      const filteredListings = listings.filter((listing) => {
        return (
          listing.userId &&
          usersWithActiveCert.has(listing.userId._id.toString())
        );
      });

      console.log(filteredListings);
      return filteredListings;
    } catch (error) {
      console.error(
        "Error fetching featured listings using simpler populate method:",
        error
      );
      throw error;
    }
  }
}

module.exports = new ListingService();

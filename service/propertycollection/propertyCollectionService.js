const PropertyCollection = require("../../models/Propertycollection");
const { NotFoundError, BadRequestError } = require("../../utils/errorHandler");
const {
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  subMonths,
} = require("date-fns");

class PropertyCollectionService {
  async getDateRangeFilter(timeRange) {
    const now = new Date();
    let filter = {};

    switch (timeRange) {
      case "last-month":
        filter = {
          createdAt: {
            $gte: startOfMonth(subMonths(now, 1)),
            $lte: endOfMonth(subMonths(now, 1)),
          },
        };
        break;
      case "this-month":
        filter = {
          createdAt: {
            $gte: startOfMonth(now),
            $lte: endOfMonth(now),
          },
        };
        break;
      case "past-quarter":
        filter = {
          createdAt: {
            $gte: startOfQuarter(subMonths(now, 3)),
            $lte: endOfQuarter(subMonths(now, 3)),
          },
        };
        break;
      case "this-quarter":
        filter = {
          createdAt: {
            $gte: startOfQuarter(now),
            $lte: endOfQuarter(now),
          },
        };
        break;
      case "this-year":
        filter = {
          createdAt: {
            $gte: startOfYear(now),
            $lte: endOfYear(now),
          },
        };
        break;
      case "all-time":
        filter = {};
        break;
      default: // Default to all time
        filter = {};
    }

    return filter;
  }

  async getProperties(filter = {}, options = {}) {
    const { page = 1, limit = 10, sort = "createdAt: -1" } = options;
    const skip = (page - 1) * limit;

    console.log("range came here: " + filter.range);
    // Extract range and remove it from filter
    const range = filter.range || "all-time";
    const { range: _, ...cleanFilter } = filter;

    // Get date range filter...
    const dateFilter = await this.getDateRangeFilter(
      filter.range || "all-time"
    );

    // Combine filters
    const combinedFilter = {
      ...cleanFilter,
      ...dateFilter,
    };

    const [properties, total] = await Promise.all([
      PropertyCollection.find(combinedFilter)
        .sort(sort === "newest" ? { createdAt: -1 } : { createdAt: 1 })
        .skip(skip)
        .limit(limit),
      PropertyCollection.countDocuments(combinedFilter),
    ]);

    return { properties, total };
  }

  // ... rest of your methods remain the same ...

  async getPropertyStats() {
    try {
      // ["house", "land", "vehicle", "others", "institutions", "petroleum"],
      const institutionCount = await PropertyCollection.countDocuments({
        propertyType: "institutions",
      });
      const landCount = await PropertyCollection.countDocuments({
        propertyType: "land",
      });
      const vehicleCount = await PropertyCollection.countDocuments({
        propertyType: "vehicle",
      });
      const houseCount = await PropertyCollection.countDocuments({
        propertyType: "house",
      });
      const othersCount = await PropertyCollection.countDocuments({
        propertyType: "others",
      });
      const petroleumCount = await PropertyCollection.countDocuments({
        propertyType: "petroleum",
      });

      const allCount = await PropertyCollection.countDocuments();

      return {
        success: true,
        institutionCount,
        landCount,
        vehicleCount,
        houseCount,
        othersCount,
        petroleumCount,
        allCount,
      };
    } catch (error) {
      return {
        success: false,
        message: "Error retrieving property counts",
        error: error.message,
      };
    }
  }

  async getPropertyById(id) {
    try {
      const property = await PropertyCollection.findById(id);
      if (!property) {
        return "Property not found";
        //throw new NotFoundError("Property not found");
      }
      return property;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new BadRequestError("Error retrieving property: " + error.message);
    }
  }

  async createProperty(propertyData) {
    try {
      const property = new PropertyCollection(propertyData);
      const savedProperty = await property.save();
      return savedProperty;
    } catch (error) {
      throw new BadRequestError("Error creating property: " + error.message);
    }
  }

  async updateProperty(id, propertyData) {
    try {
      const property = await PropertyCollection.findByIdAndUpdate(
        id,
        propertyData,
        {
          new: true,
        }
      );
      if (!property) {
        throw new NotFoundError("Property not found");
      }
      return property;
    } catch (error) {
      throw new BadRequestError("Error updating property: " + error.message);
    }
  }
}

module.exports = new PropertyCollectionService();

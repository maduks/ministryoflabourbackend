const Property = require("../../models/Property");
const { PropertyCategory } = require("../../models/PropertyCategory");
const { NotFoundError, BadRequestError } = require("../../utils/errorHandler");
class PropertyService {
  async createProperties(propertyData, userId) {
    try {
      const property = new Property({
        ...propertyData,
        createdBy: userId,
      });
      return await property.save();
    } catch (error) {
      throw new BadRequestError("Failed to create property: " + error.message);
    }
  }

  async getPropertyById(id) {
    const property = await Property.findById(id).populate(
      "ownerId",
      "fullName email phone"
    );
    if (!property) {
      throw new NotFoundError("Property not found");
    }
    return property;
  }

  static async updateProperty(id, updateData, userId) {
    const property = await Property.findOneAndUpdate(
      { _id: id, createdBy: userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!property) {
      throw new NotFoundError("Property not found or unauthorized");
    }
    return property;
  }

  static async deleteProperty(id, userId) {
    const property = await Property.findOneAndDelete({
      _id: id,
      createdBy: userId,
    });
    if (!property) {
      throw new NotFoundError("Property not found or unauthorized");
    }
    return property;
  }

  async getProperties(filter = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      Property.find(filter)
        .skip(skip)
        .limit(limit)
        .populate("ownerId", "name email phone"),
      Property.countDocuments(filter),
    ]);

    return {
      properties,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  static async searchProperties(query, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      Property.find(
        { $text: { $search: query } },
        { score: { $meta: "textScore" } }
      )
        .sort({ score: { $meta: "textScore" } })
        .skip(skip)
        .limit(limit)
        .populate("createdBy", "name email phone"),
      Property.countDocuments({ $text: { $search: query } }),
    ]);

    return {
      properties,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  static async getPropertiesNearLocation(
    coordinates,
    maxDistance = 5000,
    page = 1,
    limit = 10
  ) {
    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      Property.find({
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates,
            },
            $maxDistance: maxDistance,
          },
        },
      })
        .skip(skip)
        .limit(limit)
        .populate("createdBy", "name email phone"),
      Property.countDocuments({
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates,
            },
            $maxDistance: maxDistance,
          },
        },
      }),
    ]);

    return {
      properties,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async setFeatured(propertyId, featured, featured_until) {
    try {
      const property = await Property.findByIdAndUpdate(
        propertyId,
        { featured: featured, featured_until: featured_until },
        { new: true }
      );
      if (!property) {
        throw new NotFoundError("Property not found");
      }
      return property;
    } catch (error) {
      console.error("Error setting featured status: ", error);
      throw error;
    }
  }

  async getPropertiesCategories() {
    try {
      const cate = await PropertyCategory.find().exec();
      return cate;
    } catch (error) {}
  }
}
module.exports = new PropertyService();

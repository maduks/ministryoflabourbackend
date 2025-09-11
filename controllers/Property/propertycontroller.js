const PropertyService = require("../../service/property/property.service");
const { SuccessResponse } = require("../../utils/successHandler");
const { BadRequestError, NotFoundError } = require("../../utils/errorHandler");

class PropertyController {
  static async createProperty(req, res, next) {
    try {
      const property = await PropertyService.createProperties(
        req.body,
        req.body._id
      );
      new SuccessResponse("Property created successfully", property, 201).send(
        res
      );
    } catch (error) {
      console.log(error);
      //new BadRequestError("You must fill all");
      // next(error);
    }
  }

  static async getProperty(req, res, next) {
    try {
      const property = await PropertyService.getPropertyById(req.params.id);
      new SuccessResponse("Property retrieved successfully", property).send(
        res
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateProperty(req, res, next) {
    try {
      const property = await PropertyService.updateProperty(
        req.params.id,
        req.body,
        req.user._id
      );
      new SuccessResponse("Property updated successfully", property).send(res);
    } catch (error) {
      next(error);
    }
  }

  static async deleteProperty(req, res, next) {
    try {
      const property = await PropertyService.deleteProperty(
        req.params.id,
        req.user._id
      );
      new SuccessResponse("Property deleted successfully", property).send(res);
    } catch (error) {
      next(error);
    }
  }

  static async getProperties(req, res, next) {
    try {
      const { page = 1, limit = 10, ...filters } = req.query;
      const result = await PropertyService.getProperties(
        filters,
        parseInt(page),
        parseInt(limit)
      );
      new SuccessResponse("Properties retrieved successfully", result).send(
        res
      );
    } catch (error) {
      next(error);
    }
  }

  static async searchProperties(req, res, next) {
    try {
      const { q: query, page = 1, limit = 10 } = req.query;
      if (!query) throw new BadRequestError("Search query is required");

      const result = await PropertyService.searchProperties(
        query,
        parseInt(page),
        parseInt(limit)
      );
      new SuccessResponse("Search results retrieved successfully", result).send(
        res
      );
    } catch (error) {
      next(error);
    }
  }

  static async getNearbyProperties(req, res, next) {
    try {
      const { lat, lng, distance = 5000, page = 1, limit = 10 } = req.query;
      if (!lat || !lng)
        throw new BadRequestError("Latitude and longitude are required");

      const result = await PropertyService.getPropertiesNearLocation(
        [parseFloat(lng), parseFloat(lat)],
        parseInt(distance),
        parseInt(page),
        parseInt(limit)
      );
      new SuccessResponse(
        "Nearby properties retrieved successfully",
        result
      ).send(res);
    } catch (error) {
      next(error);
    }
  }

  static async setFeatured(req, res, next) {
    try {
      const { id } = req.params;
      const { featured, featured_until } = req.body;

      if (typeof featured !== "boolean") {
        throw new BadRequestError("featured must be a boolean value");
      }

      const updatedProperty = await PropertyService.setFeatured(
        id,
        featured,
        featured_until
      );
      new SuccessResponse(
        "Property featured status updated successfully",
        updatedProperty
      ).send(res);
    } catch (error) {
      next(error);
    }
  }

  static async getAllPropertyCategory(req, res, next) {
    try {
      const cate = await PropertyService.getPropertiesCategories();
      if (!cate)
        return res
          .status(404)
          .json({ message: "Could not fetch property categories" });
      res.status(200).json({ message: "success", data: cate });
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = PropertyController;

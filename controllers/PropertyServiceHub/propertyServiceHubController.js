const PropertyServiceHubService = require("../../service/propertyservicehub/propertyServiceHubService");

class PropertyServiceHubController {
  static async create(req, res, next) {
    try {
      const property = await PropertyServiceHubService.createPropertyServiceHub(
        req.body
      );
      res.status(201).json({ status: "success", data: { property } });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const property =
        await PropertyServiceHubService.getPropertyServiceHubById(
          req.params.id
        );
      if (!property) {
        return res.status(404).json({ status: "fail", message: "Not found" });
      }
      res.status(200).json({ status: "success", data: { property } });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const filter = {};
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sort: req.query.sort || "-createdAt",
      };
      const { properties, total } =
        await PropertyServiceHubService.getPropertyServiceHubs(filter, options);
      res.status(200).json({
        status: "success",
        results: properties.length,
        total,
        data: { properties },
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const property = await PropertyServiceHubService.updatePropertyServiceHub(
        req.params.id,
        req.body
      );
      if (!property) {
        return res.status(404).json({ status: "fail", message: "Not found" });
      }
      res.status(200).json({ status: "success", data: { property } });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const property = await PropertyServiceHubService.deletePropertyServiceHub(
        req.params.id
      );
      if (!property) {
        return res.status(404).json({ status: "fail", message: "Not found" });
      }
      res.status(200).json({ status: "success", message: "Deleted" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PropertyServiceHubController;

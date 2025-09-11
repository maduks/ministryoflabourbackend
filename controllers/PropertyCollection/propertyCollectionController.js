const PropertyCollectionService = require("../../service/propertycollection/propertyCollectionService");
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|pdf|doc|docx|xls|xlsx/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(
      console.log("An error occurred")
      //   new AppError(
      //     "Error: File upload only supports the following filetypes - " +
      //       filetypes,
      //     400
      //   )
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
}).fields([
  { name: "propertyDeed", maxCount: 1 },
  { name: "propertyImages", maxCount: 10 },
  { name: "additionalDocuments", maxCount: 5 },
]);

class PropertyCollectionController {
  static async createProperty(req, res, next) {
    try {
      upload(req, res, async (err) => {
        if (err) {
          return next(new AppError(err.message, 400));
        }

        const propertyData = req.body;
        const files = req.files;
        const userId = "67d767837d8de9d7e504d1e7";

        // Convert string dates to Date objects
        if (propertyData.acquisitionDate) {
          propertyData.acquisitionDate = new Date(propertyData.acquisitionDate);
        }

        // Parse coordinates if provided
        if (propertyData.latitude && propertyData.longitude) {
          propertyData.coordinates = {
            type: "Point",
            coordinates: [
              parseFloat(propertyData.longitude),
              parseFloat(propertyData.latitude),
            ],
          };
        }

        const property = await PropertyCollectionService.createProperty(
          propertyData,
          files,
          userId
        );
        res.status(201).json({
          status: "success",
          data: {
            property,
          },
        });
      });
    } catch (error) {
      console.log(error);

      //res.status
      //next(error);
    }
  }

  static async getPropertyById(req, res, next) {
    //
    try {
      const property = await PropertyCollectionService.getPropertyById(
        req.params.id
      );
      if (property === "Property not found") {
        return res.status(404).json({
          status: "false",
          data: "Not found",
        });
      }

      res.status(200).json({
        status: "success",
        data: {
          property,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProperties(req, res, next) {
    try {
      const filter = {};
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sort: req.query.sort || "-createdAt",
        includeCount: true,
      };

      // Apply filters
      if (req.query.propertyType) {
        filter.propertyType = req.query.propertyType;
      }
      if (req.query.state) {
        filter.state = req.query.state;
      }
      if (req.query.lga) {
        filter.lga = req.query.lga;
      }
      if (req.query.status) {
        filter.status = req.query.status;
      }
      if (req.query.range) {
        filter.range = req.query.range;
      }

      const { properties, total } =
        await PropertyCollectionService.getProperties(filter, options);

      // Get the total count of matching records (for pagination)
      const totalPages = Math.ceil(total / options.limit);

      res.status(200).json({
        pagination: {
          currentPage: options.page,
          totalPages,
          total,
        },
        status: "success",
        results: properties.length,
        total,
        data: {
          properties,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProperty(req, res, next) {
    try {
      const property = await PropertyCollectionService.getPropertyById(
        req.params.id
      );
      if (!property) {
        return next(new AppError("No property found with that ID", 404));
      }

      res.status(200).json({
        status: "success",
        data: {
          property,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProperty(req, res, next) {
    try {
      const property = await PropertyCollectionService.updateProperty(
        req.params.id,
        req.body
      );
      if (!property) {
        return next(new AppError("No property found with that ID", 404));
      }

      res.status(200).json({
        status: "success",
        data: {
          property,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteProperty(req, res, next) {
    try {
      const property = await PropertyCollectionService.deleteProperty(
        req.params.id
      );
      if (!property) {
        return next(new AppError("No property found with that ID", 404));
      }

      res.status(204).json({
        status: "success",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPropertyStats(req, res, next) {
    try {
      const stats = await PropertyCollectionService.getPropertyStats();
      console.log(stats);
      res.status(200).json({
        status: "success...",
        data: {
          stats: stats,
          // stats: stats[0] || {},
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getNearbyProperties(req, res, next) {
    try {
      const { longitude, latitude, distance = 10000 } = req.query; // distance in meters

      if (!longitude || !latitude) {
        return next(new AppError("Please provide longitude and latitude", 400));
      }

      const properties = await Property.find({
        coordinates: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
            $maxDistance: parseInt(distance),
          },
        },
      });

      res.status(200).json({
        status: "success",
        results: properties.length,
        data: {
          properties,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PropertyCollectionController;

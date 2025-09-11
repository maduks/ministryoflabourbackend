const Template = require("../../models/Templates");

class TemplatesService {
  /**
   * Create a new template
   */
  async createTemplate(templateData) {
    try {
      const template = new Template(templateData);
      await template.save();
      return template;
    } catch (error) {
      throw new Error(`Error creating template: ${error.message}`);
    }
  }

  /**
   * Get all templates with filtering and pagination
   */
  async getAllTemplates(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        templateType,
        minCost,
        maxCost,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = options;

      // Build query
      const query = {};

      if (templateType) {
        query.templateType = templateType;
      }

      if (minCost || maxCost) {
        query.cost = {};
        if (minCost) {
          query.cost.$gte = minCost;
        }
        if (maxCost) {
          query.cost.$lte = maxCost;
        }
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;

      // Calculate skip
      const skip = (page - 1) * limit;

      // Execute query
      const templates = await Template.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit);

      // Get total count
      const total = await Template.countDocuments(query);

      return {
        templates,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      throw new Error(`Error fetching templates: ${error.message}`);
    }
  }

  /**
   * Get template by ID
   */
  async getTemplateById(templateId) {
    try {
      const template = await Template.findById(templateId);

      if (!template) {
        throw new Error("Template not found");
      }

      return template;
    } catch (error) {
      throw new Error(`Error fetching template: ${error.message}`);
    }
  }

  /**
   * Update template
   */
  async updateTemplate(templateId, updateData) {
    try {
      const template = await Template.findByIdAndUpdate(
        templateId,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!template) {
        throw new Error("Template not found");
      }

      return template;
    } catch (error) {
      throw new Error(`Error updating template: ${error.message}`);
    }
  }

  /**
   * Delete template
   */
  async deleteTemplate(templateId) {
    try {
      const template = await Template.findByIdAndDelete(templateId);

      if (!template) {
        throw new Error("Template not found");
      }

      return template;
    } catch (error) {
      throw new Error(`Error deleting template: ${error.message}`);
    }
  }

  /**
   * Get templates by type
   */
  async getTemplatesByType(templateType, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        minCost,
        maxCost,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = options;

      // Build query
      const query = { templateType };

      if (minCost || maxCost) {
        query.cost = {};
        if (minCost) {
          query.cost.$gte = minCost;
        }
        if (maxCost) {
          query.cost.$lte = maxCost;
        }
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;

      // Calculate skip
      const skip = (page - 1) * limit;

      // Execute query
      const templates = await Template.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit);

      // Get total count
      const total = await Template.countDocuments(query);

      return {
        templates,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      throw new Error(`Error fetching templates by type: ${error.message}`);
    }
  }

  /**
   * Get templates within cost range
   */
  async getTemplatesByCostRange(minCost, maxCost, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        templateType,
        sortBy = "cost",
        sortOrder = "asc",
      } = options;

      // Build query
      const query = {
        cost: {
          $gte: minCost,
          $lte: maxCost,
        },
      };

      if (templateType) {
        query.templateType = templateType;
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;

      // Calculate skip
      const skip = (page - 1) * limit;

      // Execute query
      const templates = await Template.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit);

      // Get total count
      const total = await Template.countDocuments(query);

      return {
        templates,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      throw new Error(
        `Error fetching templates by cost range: ${error.message}`
      );
    }
  }

  /**
   * Get template statistics
   */
  async getTemplateStats() {
    try {
      const stats = await Template.aggregate([
        {
          $group: {
            _id: null,
            totalTemplates: { $sum: 1 },
            totalCost: { $sum: "$cost" },
            averageCost: { $avg: "$cost" },
            minCost: { $min: "$cost" },
            maxCost: { $max: "$cost" },
            allArtisansCount: {
              $sum: {
                $cond: [{ $eq: ["$templateType", "all-artisans"] }, 1, 0],
              },
            },
            allServiceProvidersCount: {
              $sum: {
                $cond: [
                  { $eq: ["$templateType", "all-service-providers"] },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]);

      return (
        stats[0] || {
          totalTemplates: 0,
          totalCost: 0,
          averageCost: 0,
          minCost: 0,
          maxCost: 0,
          allArtisansCount: 0,
          allServiceProvidersCount: 0,
        }
      );
    } catch (error) {
      throw new Error(`Error fetching template stats: ${error.message}`);
    }
  }
}

module.exports = new TemplatesService();

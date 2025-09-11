const templatesService = require("../../service/templates/templatesService");

class TemplatesController {
  /**
   * Create a new template
   */
  async createTemplate(req, res) {
    try {
      const templateData = req.body;

      // Validate required fields
      const requiredFields = [
        "name",
        "description",
        "templateType",
        "cost",
        "maxDuration",
        "minDuration",
      ];
      for (const field of requiredFields) {
        if (!templateData[field]) {
          return res
            .status(400)
            .json({ success: false, message: `${field} is required` });
        }
      }

      // Validate template type
      const validTemplateTypes = ["all-artisans", "all-service-providers"];
      if (!validTemplateTypes.includes(templateData.templateType)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid template type. Must be one of: all-artisans, all-service-providers",
        });
      }

      // Validate numeric fields
      if (typeof templateData.cost !== "number" || templateData.cost < 0) {
        return res
          .status(400)
          .json({ success: false, message: "Cost must be a positive number" });
      }

      if (
        typeof templateData.maxDuration !== "number" ||
        templateData.maxDuration < 0
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Max duration must be a positive number",
          });
      }

      if (
        typeof templateData.minDuration !== "number" ||
        templateData.minDuration < 0
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Min duration must be a positive number",
          });
      }

      if (templateData.minDuration > templateData.maxDuration) {
        return res.status(400).json({
          success: false,
          message: "Min duration cannot be greater than max duration",
        });
      }

      const template = await templatesService.createTemplate(templateData);

      return res.status(201).json({
        success: true,
        message: "Template created successfully",
        data: template,
      });
    } catch (error) {
      console.error("Error in createTemplate:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get all templates
   */
  async getAllTemplates(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        templateType,
        minCost,
        maxCost,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        templateType,
        minCost: minCost ? parseFloat(minCost) : undefined,
        maxCost: maxCost ? parseFloat(maxCost) : undefined,
        sortBy,
        sortOrder,
      };

      const result = await templatesService.getAllTemplates(options);

      return res.status(200).json({
        success: true,
        message: "Templates retrieved successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error in getAllTemplates:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get template by ID
   */
  async getTemplateById(req, res) {
    try {
      const { templateId } = req.params;

      if (!templateId) {
        return res
          .status(400)
          .json({ success: false, message: "Template ID is required" });
      }

      const template = await templatesService.getTemplateById(templateId);

      return res.status(200).json({
        success: true,
        message: "Template retrieved successfully",
        data: template,
      });
    } catch (error) {
      console.error("Error in getTemplateById:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Update template
   */
  async updateTemplate(req, res) {
    try {
      const { templateId } = req.params;
      const updateData = req.body;

      if (!templateId) {
        return res
          .status(400)
          .json({ success: false, message: "Template ID is required" });
      }

      // Validate template type if provided
      if (updateData.templateType) {
        const validTemplateTypes = ["all-artisans", "all-service-providers"];
        if (!validTemplateTypes.includes(updateData.templateType)) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid template type. Must be one of: all-artisans, all-service-providers",
          });
        }
      }

      // Validate numeric fields if provided
      if (
        updateData.cost !== undefined &&
        (typeof updateData.cost !== "number" || updateData.cost < 0)
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Cost must be a positive number" });
      }

      if (
        updateData.maxDuration !== undefined &&
        (typeof updateData.maxDuration !== "number" ||
          updateData.maxDuration < 0)
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Max duration must be a positive number",
          });
      }

      if (
        updateData.minDuration !== undefined &&
        (typeof updateData.minDuration !== "number" ||
          updateData.minDuration < 0)
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Min duration must be a positive number",
          });
      }

      // Check duration logic if both are provided
      if (
        updateData.minDuration !== undefined &&
        updateData.maxDuration !== undefined
      ) {
        if (updateData.minDuration > updateData.maxDuration) {
          return res.status(400).json({
            success: false,
            message: "Min duration cannot be greater than max duration",
          });
        }
      }

      const template = await templatesService.updateTemplate(
        templateId,
        updateData
      );

      return res.status(200).json({
        success: true,
        message: "Template updated successfully",
        data: template,
      });
    } catch (error) {
      console.error("Error in updateTemplate:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Delete template
   */
  async deleteTemplate(req, res) {
    try {
      const { templateId } = req.params;

      if (!templateId) {
        return res
          .status(400)
          .json({ success: false, message: "Template ID is required" });
      }

      const template = await templatesService.deleteTemplate(templateId);

      return res.status(200).json({
        success: true,
        message: "Template deleted successfully",
        data: template,
      });
    } catch (error) {
      console.error("Error in deleteTemplate:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get templates by type
   */
  async getTemplatesByType(req, res) {
    try {
      const { templateType } = req.params;
      const {
        page = 1,
        limit = 10,
        minCost,
        maxCost,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      if (!templateType) {
        return res
          .status(400)
          .json({ success: false, message: "Template type is required" });
      }

      const validTemplateTypes = ["all-artisans", "all-service-providers"];
      if (!validTemplateTypes.includes(templateType)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid template type. Must be one of: all-artisans, all-service-providers",
        });
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        minCost: minCost ? parseFloat(minCost) : undefined,
        maxCost: maxCost ? parseFloat(maxCost) : undefined,
        sortBy,
        sortOrder,
      };

      const result = await templatesService.getTemplatesByType(
        templateType,
        options
      );

      return res.status(200).json({
        success: true,
        message: "Templates retrieved successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error in getTemplatesByType:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get templates by cost range
   */
  async getTemplatesByCostRange(req, res) {
    try {
      const { minCost, maxCost } = req.params;
      const {
        page = 1,
        limit = 10,
        templateType,
        sortBy = "cost",
        sortOrder = "asc",
      } = req.query;

      if (!minCost || !maxCost) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Min cost and max cost are required",
          });
      }

      const minCostNum = parseFloat(minCost);
      const maxCostNum = parseFloat(maxCost);

      if (isNaN(minCostNum) || isNaN(maxCostNum)) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Min cost and max cost must be valid numbers",
          });
      }

      if (minCostNum < 0 || maxCostNum < 0) {
        return res
          .status(400)
          .json({ success: false, message: "Cost values must be positive" });
      }

      if (minCostNum > maxCostNum) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Min cost cannot be greater than max cost",
          });
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        templateType,
        sortBy,
        sortOrder,
      };

      const result = await templatesService.getTemplatesByCostRange(
        minCostNum,
        maxCostNum,
        options
      );

      return res.status(200).json({
        success: true,
        message: "Templates retrieved successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error in getTemplatesByCostRange:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get template statistics
   */
  async getTemplateStats(req, res) {
    try {
      const stats = await templatesService.getTemplateStats();

      return res.status(200).json({
        success: true,
        message: "Template statistics retrieved successfully",
        data: stats,
      });
    } catch (error) {
      console.error("Error in getTemplateStats:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new TemplatesController();

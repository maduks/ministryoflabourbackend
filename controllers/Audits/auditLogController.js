const auditLogService = require("../../service/auditlog/auditLogService");

const auditLogController = {
  // Get all audit logs (with optional filters)
  async getAll(req, res) {
    try {
      const filter = req.query || {};
      const logs = await auditLogService.getLogs(filter);
      res.status(200).json({ success: true, data: logs });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get a single audit log by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const log = await auditLogService.getLogById(id);
      if (!log) {
        return res
          .status(404)
          .json({ success: false, error: "Audit log not found" });
      }
      res.status(200).json({ success: true, data: log });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Create a new audit log
  async create(req, res) {
    try {
      const log = await auditLogService.createLog(req.body);
      res.status(201).json({ success: true, data: log });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // Delete an audit log by ID
  async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await auditLogService.deleteLog(id);
      if (!deleted) {
        return res
          .status(404)
          .json({ success: false, error: "Audit log not found" });
      }
      res.status(200).json({ success: true, data: deleted });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

module.exports = auditLogController;

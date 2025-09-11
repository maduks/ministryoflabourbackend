const { AuditLogger } = require("../../models/AuditLogMinistry");

class AuditLogService {
  async createLog(logData) {
    try {
      const log = await AuditLogger.create(logData);
      return log;
    } catch (error) {
      throw error;
    }
  }
  async getLogsByDateRange(startDate, endDate, filter = {}, options = {}) {
    try {
      const dateFilter = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);

      const query = { ...filter };
      if (Object.keys(dateFilter).length > 0) {
        query.timestamp = dateFilter;
      }

      const logs = await AuditLogger.find(query, null, options)
        .sort({ timestamp: -1 })
        .populate("user", "fullName role");
      return logs;
    } catch (error) {
      throw error;
    }
  }

  async getLogs(filter = {}, options = {}) {
    try {
      const logs = await AuditLogger.find(filter, null, options)
        .sort({
          createdAt: -1,
        })
        .populate("user", "fullName role");
      return logs;
    } catch (error) {
      throw error;
    }
  }

  async getLogById(id) {
    try {
      const log = await AuditLogger.findById(id);
      return log;
    } catch (error) {
      throw error;
    }
  }

  async deleteLog(id) {
    try {
      const deleted = await AuditLogger.findByIdAndDelete(id);
      return deleted;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuditLogService();

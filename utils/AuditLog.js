const { AuditLogger } = require("../models/AuditLogMinistry");
class AuditLog {
  async log(action, user, resource, status, details = null, ip = null) {
    try {
      await AuditLogger.create({
        user,
        action,
        resource,
        status,
        details: details instanceof Error ? details.toString() : details,
        ipAddress: ip === null ? this.getClientIp() : ip, // Implement this based on your framework
      });
    } catch (error) {
      console.error("Failed to write audit log:", error);
      // Consider fallback logging mechanism here
    }
  }

  // Helper to get client IP (implementation depends on your framework)
  getClientIp() {
    // Example for Express:
    // return req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    return null;
  }
}

module.exports = new AuditLog();

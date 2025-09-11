const rateLimit = require("express-rate-limit");
// Limit login attempts to 5 per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 5 requests per windowMs
  headers: true,
  standardHeaders: true, // Send rate limit info in standard headers
  legacyHeaders: false, // Disable deprecated headers
  message: { message: "Too many login attempts. Try again later." },
});

module.exports = loginLimiter;

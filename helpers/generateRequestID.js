const crypto = require('crypto');
const { toZonedTime } = require('date-fns-tz');

// Exported function to generate request ID
const generateRequestId = () => {
  // Get current date and time in Africa/Lagos timezone
  const now = new Date();
  const myTimeZone = toZonedTime(now, 'Africa/Lagos');

  // Format the date and time in the format YYYYMMDDHHII
  const year = myTimeZone.getFullYear();
  const month = String(myTimeZone.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(myTimeZone.getDate()).padStart(2, '0');
  const hours = String(myTimeZone.getHours()).padStart(2, '0');
  const minutes = String(myTimeZone.getMinutes()).padStart(2, '0');

  const dateTimeString = `${year}${month}${day}${hours}${minutes}`;

  // Generate a random string (let's say 6 characters)
  const randomString = crypto.randomBytes(3).toString('hex'); // 3 bytes = 6 hex characters

  // Combine dateTime string and random string
  const requestId = `${dateTimeString}${randomString}`;

  return requestId;
};

module.exports = generateRequestId;

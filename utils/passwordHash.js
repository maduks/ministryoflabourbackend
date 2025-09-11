const bcrypt = require("bcryptjs");
const passwordHash = {
  async hashPassword(plainPassword) {
    const saltRounds = 10; // Adjust based on security requirements (higher for more security)
    try {
      const salt = await bcrypt.genSalt(saltRounds);
      const hash = await bcrypt.hash(plainPassword, salt);
      return hash;
    } catch (err) {
      console.error("Error hashing password:");
      throw new Error("Password hashing failed"); // Handle errors appropriately
    }
  },
  async comparePasswords(plainPassword, hashedPassword) {
    try {
      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
      return isMatch;
    } catch (err) {
      console.error("Error comparing passwords:");
    //  throw new Error("Password comparison failed"); // Handle errors appropriately
    }
  },
};

module.exports = passwordHash;

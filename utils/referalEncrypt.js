const mongoose = require("mongoose");
const base62Chars =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Function to convert an ObjectId to a Base62 string with a fixed length
function encodeObjectIdToBase62(objectId, desiredLength = 16) {
  const buffer = objectId.id; // Access the raw 12-byte buffer of the ObjectId
  let decimalValue = BigInt(`0x${buffer.toString("hex")}`); // Convert buffer to BigInt
  let base62String = "";

  // Convert the decimal value to a Base62 string
  while (decimalValue > 0) {
    const remainder = decimalValue % BigInt(62);
    base62String = base62Chars[Number(remainder)] + base62String;
    decimalValue = decimalValue / BigInt(62);
  }

  // Ensure the string has the exact desir iredLength, base62Chars[0]);

  return base62String;
}

// Function to decode a Base62 string back to an ObjectId
function decodeBase62ToObjectId(base62String) {
  let decimalValue = BigInt(0);

  // Convert Base62 string back to a decimal value
  for (let i = 0; i < base62String.length; i++) {
    const index = base62Chars.indexOf(base62String[i]);
    if (index === -1) throw new Error("Invalid Base62 character detected");
    decimalValue = decimalValue * BigInt(62) + BigInt(index);
  }

  // Convert the decimal value to a 12-byte buffer and create an ObjectId
  const hexString = decimalValue.toString(16).padStart(24, "0");
  const buffer = Buffer.from(hexString, "hex");
  return new mongoose.Types.ObjectId(buffer);
}

module.exports = {
  encodeObjectIdToBase62,
  decodeBase62ToObjectId,
};
// Example usage
// const objectId = new mongoose.Types.ObjectId();
// console.log("Original ObjectId:", objectId);

// const encoded = encodeObjectIdToBase62(objectId);
// console.log("Encoded Base62:", encoded);

// const decodedObjectId = decodeBase62ToObjectId(encoded);
// console.log("Decoded ObjectId:", decodedObjectId);

// console.log("Match:", objectId.equals(decodedObjectId)); // Should be true

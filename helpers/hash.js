const { sha512 } = require("js-sha512");

const shaHash=(dataToHash)=> {
    // Construct the key dynamically using the provider and service
    const hashed = sha512(dataToHash)

    return hashed
  }
  
 
     
 module.exports = shaHash
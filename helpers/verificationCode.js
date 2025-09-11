const generateNumericCode = ( length = 4) => {
    let code = '';
    const digits = '0123456789';
    
    for (let i = 0; i < length; i++) {
      code += digits[Math.floor(Math.random() * 10)];
    }
    
    return code;
  }
  
  const  generateMultipleNumericCodes = (numCodes = 5, codeLength = 6)=> {
    const codes = [];
    
    for (let i = 0; i < numCodes; i++) {
      codes.push(generateNumericCode(codeLength));
    }
    
    return codes;
  }
  
  module.exports = {generateNumericCode}

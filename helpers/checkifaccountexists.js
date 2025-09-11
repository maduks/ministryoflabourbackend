const { Wallet } = require("../models/Wallet"); // Assuming your model file is in models/Wallet.js

async function checkAccountNumberExists(walletID) {
  try {

    const wallet = await Wallet.findById({_id:walletID});

     if(
      !wallet.accountdetails.reference &&
      !wallet.accountdetails.accountnumber &&
      !wallet.accountdetails.bankname &&
      !wallet.accountdetails.bankcode &&
      !wallet.accountdetails.callbackurl
    ){
       return false
    }else{
        return wallet.accountdetails; // Account number is already linked to another wallet
    }

  } catch (error) {
    console.error("Error checking account number:", error);
    throw new Error("Error checking account number");
  }
}

module.exports = checkAccountNumberExists;

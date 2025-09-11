
 // Commission rates
 const commissionRates = {
    // For MTN    
    "MTN DATA RECHARGE": 1,
    "MTN AIRTIME RECHARGE": 0.5,
    
    //For AIRTEL
    "AIRTEL AIRTIME RECHARGE": 1.7,
    "AIRTEL DATA RECHARGE": 1.7,
    
    //For GLO
    "GLO AIRTIME RECHARGE": 0.5,
    "GLO DATA RECHARGE": 0.5,
    
    //For ETISALAT
    "ETISALAT AIRTIME RECHARGE": 0.5,
    "ETISALAT DATA RECHARGE": 0.5,
    
    //For DSTV
    "DSTV CABLE SUBSCRIPTIONS": 0.2,
    //For GOTV
    "GOTV CABLE SUBSCRIPTIONS": 0.4,
    //For STARTIMES
    "STARTIMES CABLE SUBSCRIPTIONS": 0.4,  
    
    //AEDC ELECTRICITY
    "ABUJA-ELECTRIC ELECTRICITY PREPAID": 0.2,
    //IKEJA ELECTRICITY
    "IKEJA-ELECTRIC ELECTRICITY PREPAID": 0.3,
     //EKO ELECTRICITY
    "EKO-ELECTRIC ELECTRICITY PREPAID TOKEN": 0.2,
     //KANO ELECTRICITY
    "KANO-ELECTRIC ELECTRICITY PREPAID TOKEN": 0.1,
       //PORTHARCOURT ELECTRICITY
    "PORTHARCOURT-ELECTRIC ELECTRICITY PREPAID TOKEN": 0.1,
       //JOS ELECTRICITY
    "JOS-ELECTRIC ELECTRICITY PREPAID TOKEN": 0.1,
       //IBADAN ELECTRICITY
    "IBADAN-ELECTRIC ELECTRICITY PREPAID TOKEN": 0.1,
       //KADUNA ELECTRICITY
    "KADUNA-ELECTRIC ELECTRICITY PREPAID TOKEN": 0.1,
       //ENUGU ELECTRICITY
    "ENUGU-ELECTRIC ELECTRICITY PREPAID TOKEN": 0.1,
       //BENIN ELECTRICITY
    "BENIN-ELECTRIC ELECTRICITY PREPAID TOKEN": 0.1,
       //ABA ELECTRICITY
    "ABA-ELECTRIC ELECTRICITY PREPAID TOKEN": 0.1,
       //YOLA ELECTRICITY
    "YOLA-ELECTRIC ELECTRICITY PREPAID": 0.7,
    
  }
const calculateCommission=(data)=> {
    // Construct the key dynamically using the provider and service
    const key = `${data.provider} ${data.service} ${data.type}`;
    
      // Check if the key exists in the commissionRates object
    if (commissionRates[key] !== undefined) {
      return commissionRates[key]; // Return the specific commission rate
    } else {
      console.log(`No commission rate found for ${key}`);
    }
  }
  
 
     
 module.exports = calculateCommission
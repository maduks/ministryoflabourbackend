function transformJson(inputData) {
    // Set the 'code' based on 'statusCode'
    let code = inputData.responseCode == "0" ? "000" : inputData.responseCode;  // Set '000' if statusCode is '200', else 'error'

    return {
     
            code: code,  // Use the dynamically set code
            content: {
                Customer_Name: inputData.details.customerName,
                Address: inputData.details.address ?? "Not Available",
                MeterNumber: inputData.details.meterNo ?? inputData.accountNumber,
                Min_Purchase_Amount: parseInt(inputData.details.minPayable),  // Ensure it's a number
                Outstanding: parseInt(inputData.details.accountBalance),  // Ensure it's a number
                Customer_Arrears: null,  // No mapping in the input for this value
                Meter_Type: "POSTPAID",  // Static value
                WrongBillersCode: false  // Static value
            }



     
        
    };
}
//transformResponse(response,fee)
module.exports = transformJson;
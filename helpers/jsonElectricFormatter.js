function transformResponse(originalResponse,tran_fee) {
    // Extract necessary values from the original response
    const {  transactionId,merchantTransactionReference, fee, additionalProperties } = originalResponse;

    // Extract properties from additionalProperties
    const {
        customerAccountNumber,
        customerName,
        customerPhoneNumber,
        totalPayment,
        referenceNumber,
    } = additionalProperties;

    // Create the new structure
    const transformedResponse = {
        code: "000", // Fixed code as per the required structure
        content: {
            transactions: {
                status: "Completed", // Assuming the transaction was delivered
                product_name: "Abuja Electricity Distribution Company- AEDC", // Based on the provided message
                unique_element: customerAccountNumber, // Using customerAccountNumber for uniqueness
                unit_price: parseFloat(totalPayment), // Assuming totalPayment is the amount paid
                quantity: 1, // Since this is a single transaction, quantity is 1
                service_verification: null, // No verification mentioned, setting to null
                channel: "api", // Assuming the transaction was through an API
                fee: tran_fee, // Assuming fee is the commission; modify as per your needs
                total_amount: parseFloat(totalPayment) - fee, // Subtract commission from totalPayment
                discount: null, // No discount mentioned, setting to null
                type: "Electricity Bill", // Type of transaction (Electricity Bill) 
                email: "pickwave2024@gmail.com", // Placeholder email, modify as needed
                phone: customerPhoneNumber, // Using the phone number from the additional properties
                name: customerName || null, // Using customerName if available, otherwise null
                convinience_fee: 0, // No convenience fee mentioned, setting to 0
                amount: parseFloat(totalPayment) + parseFloat(tran_fee), // The amount being paid
                platform: "api", // Platform is API (assuming)
                method: "api", // Payment method is API
                transactionID: transactionId, // Transaction ID from the original response
                reference: referenceNumber
            }
        },
        Token: merchantTransactionReference,
        transaction_date: new Date().toISOString()
    };

    return transformedResponse;
}

module.exports = transformResponse;
//const transformedData = transformResponse(originalResponse);
//console.log(JSON.stringify(transformedData, null, 2)); // Pretty print the transformed data

function transSmeformResponse(originalResponse,amount,details) {

    try{
    // Extract necessary values from the original response
    const { code, description } = originalResponse;

    // Extract properties from additionalProperties
    const {
        ReferenceID,
        MobileNumber,
    } = description;


    // Create the new structure
    const transformedResponse = {
        response:{
        code: code ==101 ? "000":code, // Fixed code as per the required structure
        content: {
            transactions: {
                status: "Completed", // Assuming the transaction was delivered
                product_name: details, // Based on the provided message
                unique_element: MobileNumber, // Using customerAccountNumber for uniqueness
                unit_price: parseFloat(amount), // Assuming totalPayment is the amount paid
                quantity: 1, // Since this is a single transaction, quantity is 1
                service_verification: null, // No verification mentioned, setting to null
                channel: "api", // Assuming the transaction was through an API
                fee: 0, // Assuming fee is the commission; modify as per your needs
                amount:  parseFloat(amount),
                total_amount: parseFloat(amount), // Subtract commission from totalPayment
                discount: null, // No discount mentioned, setting to null
                type: "Data Services", // Type of transaction (Electricity Bill) 
                email: "pickwave2024@gmail.com", // Placeholder email, modify as needed
                phone: MobileNumber, // Using the phone number from the additional properties
                convinience_fee: 0, // No convenience fee mentioned, setting to 0
                amount: parseFloat(amount), // The amount being paid
                platform: "api", // Platform is API (assuming)
                method: "api", // Payment method is API
                transactionId: ReferenceID, // Transaction ID from the original response
                reference: ReferenceID
            }
        },
        transaction_date: new Date().toISOString(),
        requestId: ReferenceID,
        amount: parseFloat(amount),
    }
    };

    return transformedResponse;}
    catch(error){
        console.error("Error in transSmeformResponse: ", error);
        return {
            code: "999",
            content: {
                transactions: {
                    status: "Failed",
                    error: error.message,
                }
            },
            transaction_date: new Date().toISOString(),
            requestId: ReferenceID,
            amount: parseFloat(amount),
        };
    }
}

module.exports = transSmeformResponse;
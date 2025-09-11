const { body, param } = require("express-validator");
//AUTH USERS VALIDATIONS
const userRegDataValidation = [
  body("password")
    .exists({ checkFalsy: true })
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage("Password must contain at least one letter and one number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Password must contain at least one special character"),
  body("email")
    .exists({ checkFalsy: true })
    .withMessage("Email field is required")
    .isEmail()
    .withMessage("Provide a valid email"),
  // body("isverified")
  //   .exists({ checkFalsy: false })
  //   .withMessage("Verification field is required")
  //   .isBoolean()
  //   .withMessage("Verification field is invalid"),
  body("fullName")
    .exists({ checkFalsy: true })
    .isString()
    .withMessage("Name field is required"),
  // body("pin")
  //   .exists({ checkFalsy: false })
  //   .withMessage("Pin field is required"),
  // body("referrerId")
  //   .exists({ checkFalsy: false })
  //   .withMessage("ReferrerId field is required"),
  body("phoneNumber")
    .optional()
    .isString()
    .withMessage("Phone number should be string")
    .custom((value) => {
      if (value.length !== 11) {
        return Promise.reject("Phone number should be 11 digits");
      } else {
        return true;
      }
    }),
];

const userLoginDataValidation = [
  body("email")
    .exists({ checkFalsy: true })
    .withMessage("Email field is required")
    .isEmail()
    .withMessage("Provide a valid email"),
  body("password")
    .exists({ checkFalsy: true })
    .withMessage("Password is required")
    .isLength({ min: 5 })
    .withMessage("Password should be at least 5 characters"),
];

const userResetRequestDataValidation = [
  body("email")
    .exists({ checkFalsy: true })
    .withMessage("Email field is required"),
];

const userResetDataValidation = [
  body("email")
    .isEmail()
    .withMessage("Email is required and must be a valid email"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage("Password must contain at least one letter and one number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Password must contain at least one special character")
    .notEmpty()
    .withMessage("Password is required"),
];
const userResetVerifyDataValidation = [
  body("email")
    .exists({ checkFalsy: true })
    .withMessage("Email field is required"),
  body("resetToken")
    .exists({ checkFalsy: true })
    .withMessage("Token is required"),
];

const userVerificationValidation = [
  body("userID")
    .exists()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("UserID field is invalid"),
  body("veri_code")
    .exists({ checkFalsy: true })
    .withMessage("Verification code is required")
    .isNumeric()
    .withMessage("Verification code should be numeric")
    .isLength({ min: 4, max: 4 })
    .withMessage("Verification code should be 4 digits long"),
];

//AUTH ADMIN VALIDATIONS

const useradminRegDataValidation = [
  body("password")
    .exists({ checkFalsy: true })
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage("Password must contain at least one letter and one number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Password must contain at least one special character"),
  body("email")
    .exists({ checkFalsy: true })
    .withMessage("Email field is required")
    .isEmail()
    .withMessage("Provide a valid email"),
  body("isverified")
    .exists({ checkFalsy: false })
    .withMessage("Verification field is required")
    .isBoolean()
    .withMessage("Verification field is invalid"),
  body("fullName")
    .exists({ checkFalsy: true })
    .isString()
    .withMessage("Name field is required"),
  body("phoneNumber")
    .optional()
    .isString()
    .withMessage("Phone number should be string")
    .custom((value) => {
      if (value.length !== 11) {
        return Promise.reject("Phone number should be 11 digits");
      } else {
        return true;
      }
    }),
];

const useradminLoginDataValidation = [
  body("email")
    .exists({ checkFalsy: true })
    .withMessage("Email field is required")
    .isEmail()
    .withMessage("Provide a valid email"),
  body("password")
    .exists({ checkFalsy: true })
    .withMessage("Password is required")
    .isLength({ min: 5 })
    .withMessage("Password should be at least 5 characters"),
];

const useradminResetRequestDataValidation = [
  body("email")
    .exists({ checkFalsy: true })
    .withMessage("Email field is required"),
];

const useradminResetDataValidation = [
  body("email")
    .isEmail()
    .withMessage("Email is required and must be a valid email"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage("Password must contain at least one letter and one number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Password must contain at least one special character")
    .notEmpty()
    .withMessage("Password is required"),
];
const useradminResetVerifyDataValidation = [
  body("email")
    .exists({ checkFalsy: true })
    .withMessage("Email field is required"),
  body("resetToken")
    .exists({ checkFalsy: true })
    .withMessage("Token is required"),
];

//KYC VALIDATIONS
const kycValidation = [
  body("userId")
    .exists({ checkFalsy: true })
    .withMessage("User ID is required"),
  body("bankVerificationNumber")
    .exists({ checkFalsy: true })
    .withMessage("BVN is required")
    .custom((value) => {
      if (value.length !== 11) {
        return Promise.reject("Invalid BVN");
      } else {
        return true;
      }
    }),
  // body("dateOfBirth")
  //   .exists({ checkFalsy: true })
  //   .withMessage("Date of birth is required"),
  // body("documentIssuedDate")
  //   .exists({ checkFalsy: true })
  //   .withMessage("Document Issued date is required"),
  // body("documentExpiryDate")
  //   .exists({ checkFalsy: true })
  //   .withMessage("Document Expiry date is required"),
  body("documentType")
    .isIn(["Passport", "DriverLicense", "National ID", "cac"])
    .withMessage("Invalid document type")
    .exists({ checkFalsy: true })
    .withMessage("Document type is required"),
  body("documentImage")
    .exists({ checkFalsy: true })
    .withMessage("Document image is required"),
  body("status")
    .exists({ checkFalsy: true })
    .withMessage("Status  is required"),
  body("name").exists({ checkFalsy: true }).withMessage("Name  is required"),
];

const kycRetrieveValidation = [
  body("userId").exists({ checkFalsy: true }).withMessage("UserId is required"),
];
const kycStatusValidation = [
  body("status")
    .exists({ checkFalsy: true })
    .withMessage("Kyc status is required"),
];

//Transactions validations

const getTransactionValidation = [
  body("walletId").isMongoId().withMessage("Wallet ID format is invalid"),
  body("walletId")
    .exists({ checkFalsy: true })
    .withMessage("Wallet ID is required"),
];

//WALLET VALIDATIONS

const createWalletValidation = [
  body("userId")
    .exists({ checkFalsy: true })
    .withMessage("User ID is required"),
];

const retrieveWalletValidation = [
  body("userId")
    .exists({ checkFalsy: true })
    .withMessage("User ID is required"),
];

const fundingValidation = [
  body("amount")
    .exists({ checkFalsy: true })
    .withMessage("Description is required"),

  param("walletId")
    .exists({ checkFalsy: false })
    .withMessage("WalletId field is required")
    .isMongoId()
    .withMessage("WalletId field is invalid"),
];

const depositWalletValidation = [
  body("description")
    .exists({ checkFalsy: true })
    .withMessage("Description is required"),

  body("amount")
    .exists({ checkFalsy: true })
    .withMessage("Description is required"),

  body("category")
    .exists({ checkFalsy: true })
    .withMessage("Category is required"),

  body("banktransactions")
    .exists({ checkNull: false })
    .withMessage("Banktransactions is required"), // Ensure Banktransactions exists, can be null

  body("billstransactions")
    .exists({ checkNull: false })
    .withMessage("Billstransactions must exist"), // Ensure Billstransactions exists, can be null

  body("walletId")
    .exists({ checkFalsy: false })
    .withMessage("WalletId field is required")
    .isMongoId()
    .withMessage("WalletId field is invalid"),
];

const withdrawWalletValidation = [
  body("category")
    .exists({ checkFalsy: true })
    .withMessage("Category is required"),
  body("description")
    .exists({ checkFalsy: true })
    .withMessage("Description is required"),
  body("amount")
    .exists({ checkFalsy: true })
    .withMessage("Amount field is required"),
  body("walletId")
    .exists({ checkFalsy: false })
    .withMessage("WalletId field is required")
    .isMongoId()
    .withMessage("WalletId field is invalid"),
  body("banktransactions")
    .exists({ checkNull: false })
    .withMessage("Banktransactions is required"), // Ensure Banktransactions exists, can be null
];

const transferFundsValidation = [
  body("senderWalletId")
    .exists({ checkFalsy: false })
    .withMessage("Sender's WalletId field is required")
    .isMongoId()
    .withMessage("Sender's WalletId field is invalid"),
  body("receiverWalletId")
    .exists({ checkFalsy: false })
    .withMessage("Receiver's WalletId field is required")
    .isMongoId()
    .withMessage("Receiver's field is invalid"),
  body("category")
    .exists({ checkFalsy: true })
    .withMessage("Category is required"),
  body("description")
    .exists({ checkFalsy: true })
    .withMessage("Description is required"),
  body("amount")
    .exists({ checkFalsy: true })
    .withMessage("Amount field is required"),
];

// PROFILE VALIDATIONS
const getProfileValidation = [
  param("id").isMongoId().withMessage("Invalid user ID format"),
  // body("userId")
  //   .exists({ checkFalsy: true })
  //   .withMessage("User ID is required"),
];

const updateProfileValidation = [
  param("id").isMongoId().withMessage("Invalid user ID format"),
];

const deactivateUserAccountValidation = [
  param("id").isMongoId().withMessage("Invalid user ID format"),
];

const activateUserAccountValidation = [
  param("id").isMongoId().withMessage("Invalid user ID format"),
];

/******************************** BILLS VALIDATIONS  *******************************/
//CABLE PAY VALIDATION
const cablePayValidatePayment = [
  body("walletId")
    .isMongoId()
    .withMessage("walletId must be a valid MongoDB ObjectId"),

  body("billersCode")
    .isString()
    .notEmpty()
    .withMessage("billersCode is required and must be a string"),

  body("provider")
    .isIn(["dstv", "gotv", "startimes", "showmax"]) //  these are valid providers
    .withMessage(
      "provider must be one of the following: dstv, gotv, startimes"
    ),

  body("variation_code")
    .isString()
    .notEmpty()
    .withMessage("variation_code is required and must be a string"),

  body("serviceID")
    .isString()
    .notEmpty()
    .withMessage("serviceID is required and must be a string"),

  body("amount")
    .isFloat({ min: 0 })
    .withMessage("amount must be a positive number"),

  body("phone")
    .isMobilePhone("any")
    .withMessage("phone must be a valid mobile number"),

  body("subscription_type")
    .isIn(["change", "renewal"])
    .withMessage('subscription_type must be either "change" or "renewal"'),

  body("quantity").isInt({ min: 1 }).withMessage("quantity must be at least 1"),
];
//CABLE VERIFY VALIDATION
const cableVerifyValidateIUC = [
  body("iucnumber")
    .isString()
    .notEmpty()
    .withMessage("Iucnumber is required and must be a string")
    .isLength({ min: 6, max: 12 })
    .withMessage("Iucnumber must be between 6 and 12 characters long"),

  body("provider")
    .isIn(["dstv", "gotv", "startimes"]) // Assuming these are valid providers
    .withMessage(
      "provider must be one of the following: dstv, gotv, startimes"
    ),
];

//AIRTIME PAYMENT VALIDATION

const airtimePurchaseValidation = [
  body("walletId")
    .exists({ checkFalsy: true })
    .withMessage("User ID is required"),
  body("phone")
    .exists({ checkFalsy: true })
    .withMessage("Phone number is required"),
  // .isMobilePhone("en-US")
  // .withMessage("Invalid phone number"),
  body("amount")
    .exists({ checkFalsy: true })
    .withMessage("Amount is required")
    .isNumeric()
    .withMessage("Invalid amount"),
];

//DATA PAYMENT VALIDATION
const validateDataPayment = [
  body("walletId")
    .isMongoId()
    .withMessage("walletId must be a valid MongoDB ObjectId"),

  body("billersCode")
    .isString()
    .notEmpty()
    .withMessage("billersCode is required and must be a string")
    .isLength({ min: 10, max: 11 })
    .withMessage("billersCode must be 10 or 11 characters long"),

  body("variation_code")
    .isString()
    .notEmpty()
    .withMessage("variation_code is required and must be a string"),

  body("phone")
    .isMobilePhone("any")
    .withMessage("phone must be a valid mobile number"),

  body("amount")
    .isFloat({ min: 1 })
    .withMessage("amount must be a positive number greater than or equal to 1"),
];

//ELECTRICITY METER VALIDATION

const electricityVerifyMeterValidate = [
  body("meter_number")
    .exists({ checkFalsy: true })
    .withMessage("Meter number is required"),
  body("type")
    .exists({ checkFalsy: true })
    .withMessage("Meter type is required")
    .isIn(["prepaid"])
    .withMessage("Invalid Meter type provided."),
  body("provider")
    .isIn([
      "ikeja-electric",
      "eko-electric",
      "kano-electric",
      "portharcourt-electric",
      "jos-electric",
      "ibadan-electric",
      "kaduna-electric",
      "abuja-electric",
      "enugu-electric",
      "benin-electric",
      "aba-electric",
      "yola-electric",
      "AHB",
    ]) // Assuming these are valid providers
    .withMessage("Unknown provider supplied."),
];

const electricityPayValidatePayment = [
  body("provider")
    .isIn([
      "ikeja-electric",
      "eko-electric",
      "kano-electric",
      "portharcourt-electric",
      "jos-electric",
      "ibadan-electric",
      "kaduna-electric",
      "abuja-electric",
      "enugu-electric",
      "benin-electric",
      "aba-electric",
      "yola-electric",
    ]) // Assuming these are valid providers
    .withMessage("Unknown provider supplied."),
  body("meter_number")
    .exists({ checkFalsy: true })
    .withMessage("Meter number is required"),
  // body("variation_code")
  //  .exists({ checkFalsy: true })
  //.withMessage("Variation code is required"),
  body("walletId")
    .exists({ checkFalsy: true })
    .withMessage("User ID is required"),
  //body("phone")
  //  .exists({ checkFalsy: true })
  // .withMessage("Phone number is required"),
  // .isMobilePhone("en-US")
  // .withMessage("Invalid phone number"),
  body("amount")
    .exists({ checkFalsy: true })
    .withMessage("Amount is required")
    .isNumeric()
    .withMessage("Invalid amount"),
];

module.exports = {
  userRegDataValidation,
  userLoginDataValidation,
  kycValidation,
  kycRetrieveValidation,
  kycStatusValidation,
  createWalletValidation,
  retrieveWalletValidation,
  depositWalletValidation,
  withdrawWalletValidation,
  transferFundsValidation,
  getProfileValidation,
  updateProfileValidation,
  deactivateUserAccountValidation,
  activateUserAccountValidation,
  airtimePurchaseValidation,
  cablePayValidatePayment,
  cableVerifyValidateIUC,
  validateDataPayment,
  userResetRequestDataValidation,
  userResetVerifyDataValidation,
  userResetDataValidation,
  electricityVerifyMeterValidate,
  electricityPayValidatePayment,
  getTransactionValidation,
  useradminLoginDataValidation,
  useradminResetRequestDataValidation,
  useradminResetVerifyDataValidation,
  useradminResetDataValidation,
  userVerificationValidation,
  fundingValidation,
};

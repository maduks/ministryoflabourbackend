const express = require("express");
const router = express.Router();
const KycController = require("../controllers/KycController/kycController");
// const {
//   kycValidation,
//   kycRetrieveValidation,
//   kycStatusValidation,
// } = require("../middleware/validateRequest");

router.post("/send", KycController.submitKyc);
router.post("/getBankList", KycController.getBankList);
router.post("/validateAccountNumber", KycController.validateAccountNumber);
// router.post("/matchprofile", KycController.checProfilekMatch);
router.post("/retrieve", KycController.getKyc);
router.post("/allkyc", KycController.getAllKyc);
router.post("/status/:userid", KycController.updateKycStatus);
module.exports = router;

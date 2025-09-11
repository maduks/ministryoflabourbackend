const express = require("express");
const router = express.Router();
const CollectionController = require("../controllers/collections/collectionController");
router.post("/get-banks", CollectionController.getBanks);
router.post("/validate-account", CollectionController.validateAccount);
router.post("/create-reserved-account", CollectionController.createReservedAccount);
router.post("/customer-payout", CollectionController.customerPayout);
router.post("/fetch-account", CollectionController.getAccountDetails);
module.exports = router;

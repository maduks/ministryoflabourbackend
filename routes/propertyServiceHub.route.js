const express = require("express");
const router = express.Router();
const PropertyServiceHubController = require("../controllers/PropertyServiceHub/propertyServiceHubController");

router.post("/", PropertyServiceHubController.create);
router.get("/", PropertyServiceHubController.getAll);
router.get("/:id", PropertyServiceHubController.getById);
router.put("/:id", PropertyServiceHubController.update);
router.delete("/:id", PropertyServiceHubController.delete);

module.exports = router;

const express = require("express");
const router = express.Router();
const CertController = require("../../controllers/Certification/certificationController");

router.post("/", CertController.createCertification);
router.get("/:id", CertController.getCertification);
router.get("/ministry/:id", CertController.getCertificationByMinistryId);

module.exports = router;

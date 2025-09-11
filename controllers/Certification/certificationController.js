const certificationService = require("../../service/certifications/certifications.service");
class CertificationController {
  async createCertification(req, res) {
    try {
      const newCertification = await certificationService.createCertification(
        req.body
      );
      if (
        newCertification ==
        "Certification already exists for this user with profession"
      ) {
        return res.status(400).json({
          message: "Certification already exists for this user with profession",
        });
      }
      res.status(201).json({ message: "success", data: newCertification });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create certification" });
    }
  }

  async getCertification(req, res) {
    try {
      const cert = await certificationService.getCertificationById(
        req.params.id
      );
      if (!cert)
        return res.status(404).json({ message: "Certificate not found" });
      res.status(200).json({ message: "success", data: cert });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to get certificate" });
    }
  }

  async getCertificationByMinistryId(req, res) {
    try {
      const cert = await certificationService.getCertificationByMinistryId(
        req.params.id
      );
      if (cert == "Certifications not found....")
        return res.status(404).json({ message: "Certification not found" });
      res.status(200).json({ message: "success", data: cert });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to get certification" });
    }
  }
}

module.exports = new CertificationController();

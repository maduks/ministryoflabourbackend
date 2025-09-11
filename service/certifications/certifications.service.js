const { Certification } = require("../../models/Certifications");

class CertificationService {
  async createCertification(certData) {
    try {
      // Check if certification already exists for the same entityId, profession, and category
      const existingCertification = await Certification.findOne({
        entityId: certData.entityId,
        profession: certData.profession,
        category: certData.category,
      });

      if (existingCertification) {
        return "Certification already exists for this user with profession";
      }

      const newCertification = new Certification(certData);
      return await newCertification.save();
    } catch (error) {
      console.error("Error in createCertification:", error);
      throw error;
    }
  }

  async getCertificationById(userId) {
    try {
      const cert = await Certification.find({ entityId: userId })
        .populate("ministryId", "name")
        .exec();
      if (!cert || cert.length === 0) {
        return "Certifications not found....";
      }
      return cert;
    } catch (error) {
      console.error("Error in getCertificationById:", error);
      throw error;
    }
  }

  async getCertificationByMinistryId(ministryId) {
    try {
      const cert = await Certification.find({ ministryId: ministryId }).exec();
      if (!cert || cert.length === 0) {
        return "Certifications not found....";
      }
      return cert;
    } catch (error) {
      console.error("Error in getCertificationByMinistryId:", error);
      throw error;
    }
  }

  /**
   * Check if certification exists for entityId, profession, and category
   */
  async checkCertificationExists(entityId, profession, category) {
    try {
      const existingCertification = await Certification.findOne({
        entityId,
        profession,
        category,
      });

      return {
        exists: !!existingCertification,
        certification: existingCertification,
      };
    } catch (error) {
      console.error("Error in checkCertificationExists:", error);
      throw error;
    }
  }

  /**
   * Get certification by entityId, profession, and category
   */
  async getCertificationByEntityAndProfession(entityId, profession, category) {
    try {
      const certification = await Certification.findOne({
        entityId,
        profession,
        category,
      });

      if (!certification) {
        return null;
      }

      return certification;
    } catch (error) {
      console.error("Error in getCertificationByEntityAndProfession:", error);
      throw error;
    }
  }

  /**
   * Update existing certification
   */
  async updateCertification(certificationId, updateData) {
    try {
      const certification = await Certification.findByIdAndUpdate(
        certificationId,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!certification) {
        throw new Error("Certification not found");
      }

      return certification;
    } catch (error) {
      console.error("Error in updateCertification:", error);
      throw error;
    }
  }

  /**
   * Get all certifications with filtering
   */
  async getAllCertifications(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        entityId,
        profession,
        category,
        status,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = options;

      // Build query
      const query = {};

      if (entityId) {
        query.entityId = entityId;
      }

      if (profession) {
        query.profession = profession;
      }

      if (category) {
        query.category = category;
      }

      if (status) {
        query.status = status;
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;

      // Calculate skip
      const skip = (page - 1) * limit;

      // Execute query
      const certifications = await Certification.find(query)
        .populate("entityId", "fullName email phoneNumber")
        .populate("template", "name description")
        .sort(sort)
        .skip(skip)
        .limit(limit);

      // Get total count
      const total = await Certification.countDocuments(query);

      return {
        certifications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error("Error in getAllCertifications:", error);
      throw error;
    }
  }
}

module.exports = new CertificationService();

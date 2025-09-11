const ministryService = require("../../service/ministry/ministryService.service");
const userProfileService = require("../../service/userProfile/userProfileService");
const passwordHash = require("../../utils/passwordHash");
const auditLog = require("../../utils/AuditLog");
class MinistryController {
  async createMinistry(req, res) {
    try {
      const ministry = await ministryService.createMinistry(req.body);
      const user = req.headers["user-id"];
      if (!ministry) {
        auditLog.log(
          "CREATE",
          user,
          { name: "SUPER ADMIN", id: user },
          "FAILED",
          `Failed to add new ministry `,
          req.ip
        );
        return res.status(500).json({ message: "Could not create ministry" });
      }
      auditLog.log(
        "CREATE",
        user,
        { name: "SUPER ADMIN", id: user },
        "SUCCESS",
        `Added a new ministry:${ministry.name} `,
        req.ip
      );
      return res.status(200).json({ data: ministry, message: "success" });
    } catch (error) {
      console.log(error);
    }
  }

  async getAllMinistry(req, res) {
    try {
      const ministries = await ministryService.getAllMinistry();
      if (!ministries) {
        return res.status(500).json({ message: "Could not fetch ministries" });
      }

      return res.status(200).json({ data: ministries, message: "success" });
    } catch (error) {
      console.log(error);
    }
  }

  async getMinistry(req, res) {
    try {
      const { minId } = req.params;
      const ministry = await ministryService.getMinistry(minId);
      if (!ministry) {
        return res.status(500).json({ message: "Could not fetch ministry" });
      }

      return res.status(200).json({ data: ministry, message: "success" });
    } catch (error) {
      console.log(error);
    }
  }
  async updateMinistry(req, res) {
    try {
      const { minId } = req.params;
      const user = req.headers["user-id"];
      const updateData = {
        fullName: req.body.name,
        email: req.body.email,
        state: req.body.state,
        phoneNumber: req.body.phoneNumber,
        // logo: req.body.logo,
      };
      const minData = {
        name: req.body.name,
        slug: req.body.name.replace(/\s+/g, "-").toLowerCase(),
        minister: req.body.minister,
        description: req.body.description,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        logo: req.body.logo,
      };

      if (req.body?.password !== undefined)
        updateData.password = await passwordHash.hashPassword(
          req.body.password
        );
      console.log(minId);
      const minup = await ministryService.updateMinistry(minId, minData);
      await userProfileService.updateUserNoId(minId, updateData);

      auditLog.log(
        "UPDATE",
        user,
        { name: "SUPER ADMIN", id: user },
        "SUCCESS",
        `Updated ${minup.name} ministry data `,
        req.ip
      );
      return res.status(200).json({ message: "success", data: minup });
    } catch (error) {
      console.log(error);
    }
  }

  async deleteMinistry(req, res) {
    try {
      const { minId } = req.params;
      const user = req.headers["user-id"];

      console.log(user, minId);
      const deletedMin = await ministryService.deleteMinistry(minId);

      console.log(deletedMin);
      if (deletedMin === "Ministry not found") {
        return res.status(422).json({ message: "Ministry Not Found" });
      }
      if (deletedMin) {
        // const deletedUser = await userProfileService.deleteUserAccount(minId);
        auditLog.log(
          "DELETE",
          user,
          { name: "SUPER ADMIN", id: user },
          "SUCCESS",
          `Deleted ministry: ${deletedMin.fullName} `,
          req.ip
        );

        auditLog.log(
          "DELETE",
          user,
          { name: "SUPER ADMIN", id: user },
          "Success",
          `Ministry User deleted successfully with criteria: Ministry`
        );
      }

      return res.status(200).json({ message: "success" });
    } catch (error) {
      console.log(error);
    }
  }

  async getTotalMinistries(req, res) {
    try {
      const count = await ministryService.getTotalMinistries();
      return res.status(200).json({ total: count, message: "success" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error fetching total ministries" });
    }
  }
}

module.exports = new MinistryController();

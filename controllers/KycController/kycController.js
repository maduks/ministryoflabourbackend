// /controllers/kycController.js
const kycService = require("../../service/kyc/kyc.service");
const profileService = require("../../service/userProfile/userProfileService");
const { validationResult } = require("express-validator");
const calculateStringMatch = require("../../helpers/matchprofile");
const { sendCreateAccount } = require("../../utils/createaccountSocket");
const { default: axios } = require("axios");
class KycController {
  async submitKyc(req, res) {
    try {
      const errors = validationResult(req);
      const {
        fullName,
        userId,
        religion,
        maritalstatus,
        community,
        dateOfBirth,
        state,
        lga,
        residentialaddress,
        photo,
        bankAccountNumber,
        accountName,
        bankName,
        nin,
      } = req.body;
      if (!errors.isEmpty()) {
        // Create an object to store the first error for each field
        const firstErrorForField = {};

        // Loop through the errors array
        errors.array().forEach((error) => {
          if (!firstErrorForField[error.path]) {
            firstErrorForField[error.path] = error.msg;
          }
        });

        return res.status(400).json({ errors: firstErrorForField });
      }

      const kycData = {
        fullName: fullName,
        userId: userId,
        religion: religion,
        maritalstatus: maritalstatus,
        community: community,
        dateOfBirth: dateOfBirth,
        state: state,
        photo: photo,
        bankAccountNumber: bankAccountNumber,
        bankName: bankName,
        accountName: accountName,
        lga: lga,
        residentialaddress: residentialaddress,
        nin: nin,
      };
      //sendCreateAccount(userId);

      const kyc = await kycService.createKyc(kycData);
      profileService.updateUser(userId, { isKYCVerified: true });
      res.status(201).json({ kyc, message: "KYC submitted successfully" });
    } catch (error) {
      res.status(500).json({ errors: error.message });
    }
  }

  async getKyc(req, res) {
    try {
      const kyc = await kycService.getKycByUserId(req.body.userId);
      if (!kyc) {
        return res.status(404).json({ message: "KYC for user not found" });
      }
      res.json(kyc);
    } catch (error) {
      res.status(500).json({ errors: error.message });
    }
  }

  async getBankList(req, res) {
    try {
      const banks = await axios.post(
        "http://13.60.216.170:8000/api/collection/get-banks"
      );
      if (!banks) {
        return res.status(404).json({ message: "Bank list not found" });
      }
      //console.log(banks.data);
      res.status(200).json(banks.data);
    } catch (error) {
      res.status(500).json({ errors: error.message });
    }
  }

  async validateAccountNumber(req, res) {
    try {
      const { accountNumber, amount, bankUID } = req.body;
      const banks = await axios.post(
        "http://13.60.216.170:8000/api/collection/validate-account",
        {
          accountNumber,
          amount,
          bankUID,
        }
      );
      if (!banks) {
        return res.status(404).json({ message: "Bank list not found" });
      }
      //console.log(banks.data);
      res.status(200).json(banks.data);
    } catch (error) {
      res.status(500).json({ errors: error.message });
    }
  }

  async updateKycStatus(req, res) {
    try {
      const { status } = req.body;
      if (!status)
        return res.status(404).json({ message: "Kyc status is required" });
      const kyc = await kycService.updateKycStatus(req.params.userid, status);
      if (!kyc) {
        return res.status(404).json({ message: "KYC not found" });
      }
      res.json(kyc);
    } catch (error) {
      res.status(500).json({ errors: error.message });
    }
  }

  async checProfilekMatch(req, res) {
    try {
      const percentage = calculateStringMatch(
        req.body.fullName.toUpperCase(),
        req.body.accountName.toUpperCase()
      );
      if (percentage >= 40) {
        return res
          .status(200)
          .json({ message: "Profile Match found " + percentage });
      } else {
        return res
          .status(400)
          .json({ message: "Profile Match not found " + percentage });
      }
    } catch (error) {
      res.status(400).json({ message: "Error in Matching Profile. " + error });
    }
  }
  async getAllKyc(req, res) {
    try {
      const kyc = await kycService.getAllKyc();
      res.status(200).json({ kyc, status: "success" });
    } catch (error) {
      res.status(400).json({ errors: error.message });
    }
  }
}

module.exports = new KycController();

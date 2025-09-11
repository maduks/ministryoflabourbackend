const express = require("express");
const productController = require("../../controllers/Products/productsController");
const {
  getProfileValidation,
  updateProfileValidation,
  deactivateUserAccountValidation,
  activateUserAccountValidation,
} = require("../../middleware/validateRequest");
const router = express.Router();

// Get user's profile
router.post("/create", productController.createProduct);

router.post("/create/category", productController.createProductsCategory);
router.get("/retrieve/category", productController.getProductsCategory);
router.get("/", productController.getAllProducts);
router.get("/user/:id", productController.getProductUserById);
router.patch("/:id/set-featured", productController.setFeatured);
router.get("/:id", productController.getProductById);
module.exports = router;

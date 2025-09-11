const productService = require("../../service/products/product.service");
let productField_ = [
  "ownerId",
  "prodName",
  "category",
  "description",
  "certificationStatus",
  //"legalDocument",
];
class ProductController {
  async getAllProducts(req, res) {
    const products = await productService.getAllProducts();
    res.status(200).json({ products });
  }
  async getProductUserById(req, res) {
    const productId = req.params.id;
    const product = await productService.getProductByUserId(productId);
    res.status(200).json({ product });
  }
  async getProductById(req, res) {
    const productId = req.params.id;
    const product = await productService.getProductById(productId);
    res.status(200).json({ product });
  }
  async createProduct(req, res) {
    try {
      const missingFields = productField_.filter((field) => !req.body[field]);
      if (missingFields.length > 0) {
        return res.status(400).json({
          error: `Required fields missing: ${missingFields.join(", ")}`,
        });
      }
      const productData = req.body;
      const createdProduct = await productService.createProducts(productData);
      console.log("response here" + createdProduct);
      if (createdProduct) {
        res.status(201).json({
          product: createdProduct,
          status: "Product Created Successfully",
        });
      } else {
        res
          .status(400)
          .json({ error: "Failed to create product: " + createdProduct });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async setFeatured(req, res) {
    try {
      const { id } = req.params;
      const { featured, featured_until } = req.body;

      if (typeof featured !== "boolean") {
        return res.status(400).json({
          error: "isFeatured must be a boolean value",
        });
      }

      const updatedProduct = await productService.setFeatured(
        id,
        featured,
        featured_until
      );
      res.status(200).json({
        message: "Product featured status updated successfully",
        product: updatedProduct,
      });
    } catch (error) {
      res
        .status(error.message === "Product not found" ? 404 : 500)
        .json({ error: error.message });
    }
  }

  async createProductsCategory(req, res) {
    try {
      const newProductsCat = await productService.createProductCategory(
        req.body
      );
      res.status(201).json({
        message: "Products categories created successfully",
        data: newProductsCat,
      });
    } catch (error) {
      res.status(500).json({ errors: error.message });
    }
  }

  async getProductsCategory(req, res) {
    try {
      const prodCate = await productService.getAllProductsCategory();
      return res.status(200).json({ message: "Success", data: prodCate });
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new ProductController();

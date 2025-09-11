const { Product } = require("../../models/Product");
const { ProductCategory } = require("../../models/ProductCategory");
class ProductService {
  async getAllProducts() {
    const products = await Product.find().exec();
    return products;
  }
  async createProductCategory(data) {
    try {
      const prodCat = await ProductCategory.create(data);
      return prodCat;
    } catch (err) {
      console.log(err);
    }
  }

  async getAllProductsCategory() {
    try {
      const allProdCat = await ProductCategory.find().exec();
      return allProdCat;
    } catch (error) {
      console.log(error);
    }
  }
  async getProductByUserId(productId) {
    const product = await Product.find({ ownerId: productId }).exec();
    if (!product) return null;
    return product;
  }

  async getProductById(id) {
    const product = await Product.findById(id).populate(
      "ownerId",
      "fullName email phone"
    );
    if (!product) {
      throw new NotFoundError("Product not found");
    }
    return product;
  }

  async createProducts(productData) {
    try {
      const newProduct = new Product(productData);
      return await newProduct.save();
    } catch (error) {
      console.error("Error creating product: ", error);
    }
  }

  async setFeatured(productId, featured, featured_until) {
    try {
      const product = await Product.findByIdAndUpdate(
        productId,
        { featured: featured, featured_until: featured_until },
        { new: true }
      );
      if (!product) {
        throw new Error("Product not found");
      }
      return product;
    } catch (error) {
      console.error("Error setting featured status: ", error);
      throw error;
    }
  }
}
module.exports = new ProductService();

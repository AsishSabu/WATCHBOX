const asynchandler = require("express-async-handler");
const product = require("../../models/productModel");
const category = require("../../models/categoryModel");

// //----------------------load shop page ---------------------------------------
exports.loadShop = asynchandler(async (req, res) => {
  try {

    const categories = await category.find({ isListed: true });
    const listedCategoryIds = categories.map((category) => category._id);
    const products = await product
      .find({ categoryName: { $in: listedCategoryIds }, isListed: true })
      .populate("images")
      .limit(12);
    res.render("./user/pages/shop", {title:'WATCHBOX', products, categories });
  } catch (error) {
    throw new Error(error);
  }
});

// //--------------------------load product details-------------------------------

exports.loadProductDetails = asynchandler(async (req, res) => {
  try {
    const id = req.params.id;
    const Product = await product
      .findOne({ _id: id })
      .populate("images")
      .populate("categoryName");
    const relatedProducts = await product.find().populate("images");

    res.render("./user/pages/productDetails", {title:'WATCHBOX', Product, relatedProducts });
  } catch (error) {
    throw new Error(error);
  }
});

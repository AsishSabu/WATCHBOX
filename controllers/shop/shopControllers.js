const asynchandler = require("express-async-handler");
const product = require("../../models/productModel");
const category = require("../../models/categoryModel");
const User = require("../../models/userModels");

//----------------------load shop page ---------------------------------------
exports.loadShop = asynchandler(async (req, res) => {
  try {
    const user = req.user;
    const categories = await category.find({ isListed: true });
    const listedCategoryIds = categories.map((category) => category._id);
    const products = await product
      .find({ categoryName: { $in: listedCategoryIds }, isListed: true })
      .populate("images")
      .limit(12);

    let userWishlist;
    if (user) {
      if (user.wishlist) {
        userWishlist = user.wishlist;
      }
    } else {
      userWishlist = false;
    }

    res.render("./user/pages/shop", {
      title: "WATCHBOX",
      products,
      categories,
      userWishlist,
    });
  } catch (error) {
    throw new Error(error);
  }
});

//--------------------------load product details-------------------------------

exports.loadProductDetails = asynchandler(async (req, res) => {
  try {
    const id = req.params.id;
    const Product = await product
      .findOne({ _id: id })
      .populate("images")
      .populate("categoryName");
    const relatedProducts = await product.find().populate("images");
    res.render("./user/pages/productDetails", {
      title: "WATCHBOX/PRODUCTdETAILS",
      Product,
      relatedProducts,
    });
  } catch (error) {
    throw new Error(error);
  }
});

//-----------------------------load whishlist-------------------------------

exports.loadWhishlist = asynchandler(async (req, res) => {
  try {
    const user = req.user;
    const userWishlist = await User.findById({ _id: user.id }).populate({
      path: "wishlist",
      populate: {
        path: "images",
      },
    });
    res.render("./user/pages/whishlist", {
      title: "WATCHBOX/WHISLIST",
      wishlist: userWishlist.wishlist,
    });
  } catch (error) {}
});

//--------------------------------add to whislist----------------------------------------------

exports.addTowishlist = asynchandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id;
    // checking if the product already existing in the wishlist
    const user = await User.findById(userId);
    if (user.wishlist.includes(productId)) {
      console.log("product found");
      await User.findByIdAndUpdate(userId, { $pull: { wishlist: productId } });
      return res.json({
        success: false,
        message: "Product removed from wishlist",
      });
    }

    await User.findByIdAndUpdate(userId, { $push: { wishlist: productId } });
    res.json({ success: true, message: "Product Added to wishlist" });
  } catch (error) {
    throw new Error(error);
  }
});

exports.removeItemfromWishlist = asynchandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id;
    await User.findByIdAndUpdate(userId, { $pull: { wishlist: productId } });
    res.redirect("/whishlist");
  } catch (error) {
    throw new Error(error);
  }
});


const asynchandler = require("express-async-handler");
const product = require("../../models/productModel");
const Category = require("../../models/categoryModel");
const User = require("../../models/userModels");

//----------------------load shop page ---------------------------------------
exports.loadShop = asynchandler(async (req, res) => {

    try {
      const user = req.user;
      const page = req.query.p || 1;
      const limit = 12;

      const listedCategories = await Category.find({ isListed: true });
      const categoryMapping = {};

      listedCategories.forEach((category) => {
        categoryMapping[category.categoryName] = category._id;
      });
      const filter = { isListed: true };
     
      if (req.query.category) {
        // Check if the category name exists in the mapping
        if (categoryMapping.hasOwnProperty(req.query.category)) {
          filter.categoryName = categoryMapping[req.query.category];
        } else {
          filter.categoryName = cat;
        }
      }

      // Check if a search query is provided
      if (req.query.search) {
        filter.$or = [{ title: { $regex: req.query.search, $options: "i" } }];
        // if search and category both included in the query parameters
        if (req.query.search && req.query.category) {
          if (categoryMapping.hasOwnProperty(req.query.category)) {
            filter.categoryName = categoryMapping[req.query.category];
          } else {
            filter.categoryName = cat;
          }
        }
      }

      let sortCriteria = {};

      // Check for price sorting
      if (req.query.sort === "lowtoHigh") {
        sortCriteria.salePrice = 1;
      } else if (req.query.sort === "highToLow") {
        sortCriteria.salePrice = -1;
      }
      //filter by both category and price
      if (req.query.category && req.query.sort) {
        if (categoryMapping.hasOwnProperty(req.query.category)) {
          filter.categoryName = categoryMapping[req.query.category];
        } else {
          filter.categoryName = cat;
        }

        if (req.query.sort) {
          sortCriteria.salePrice = 1;
        }
        if (req.query.sort === "highToLow") {
          sortCriteria.salePrice = -1;
        }
      }
      const findProducts = await product.find(filter)
        .populate("images").populate("categoryName")
        .skip((page - 1) * limit)
        .limit(limit)
        .sort(sortCriteria);

      let userWishlist;
      let cartProductIds;
      if (user) {
        if (user.cart || user.wishlist) {
          cartProductIds = user.cart.map((cartItem) =>
            cartItem.product.toString()
          );
          userWishlist = user.wishlist;
        }
      } else {
        cartProductIds = null;
        userWishlist = false;
      }

      const count = await product.find(filter)
        // { categoryName: { $in: listedCategoryIds }, isListed: true })
        .countDocuments();
      let selectedCategory = [];
      if (filter.categoryName) {
        selectedCategory.push(filter.categoryName);
      }

      res.render("./user/pages/shop", {
          title: "WATCHBOX",
        products: findProducts,
        category: listedCategories,
        cartProductIds,
        user,
        userWishlist,
        currentPage: page,
        totalPages: Math.ceil(count / limit), // Calculating total pages
        selectedCategory,
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


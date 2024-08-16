const User = require("../../models/userModels");
const asynchandler = require("express-async-handler");
const Product = require("../../models/productModel");
const Orders = require("../../models/orderModel");
const graphHelpers = require("../../helpers/graphHelper");
require("dotenv").config();

// -------------------load Login------------------------

const loadLogin = asynchandler(async (req, res) => {
  try {
    res.render("./admin/pages/login", { title: "WATCHBOX/LOGIN" });
  } catch (error) {
    throw new Error(error);
  }
});

//-------------------verify admin--------------------------------

const verifyAdmin = asynchandler(async (req, res) => {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASS;
    const emailCheck = req.body.email;
    const user = await User.findOne({ email: emailCheck });
    if (user) {
      res.render("./admin/pages/login", {
        message: "You are not an Admin",
        title: "WATCHBOX/LOGIN",
      });
    } else if (emailCheck === email && req.body.password === password) {
      req.session.admin = email;
      res.redirect("/admin/index");
    } else {
      res.render("./admin/pages/login", {
        message: "check you email and password",
        title: "WATCHBOX/LOGIN",
      });
    }
  } catch (error) {
    throw new Error(error.message);
  }
});

//------------------load index-------------------------

const loadIndex = asynchandler(async (req, res) => {
  try {
    const [orderResult, soldResult, totalProductsResult, totalUsersResult] =
      await Promise.all([
        Orders.aggregate([
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
            },
          },
        ]),
        Product.aggregate([
          {
            $group: {
              _id: null,
              totalProducts: { $sum: "$sold" },
            },
          },
        ]),
        Product.aggregate([
          {
            $group: {
              _id: null,
              totalQuantity: { $sum: "$quantity" },
            },
          },
        ]),
        User.aggregate([{ $group: { _id: null, totalUsers: { $sum: 1 } } }]),
      ]);

    const totalOrders = orderResult.length > 0 ? orderResult[0].totalOrders : 0;
    const soldCount = soldResult.length > 0 ? soldResult[0].totalProducts : 0;
    const totalQuantity =
      totalProductsResult.length > 0 ? totalProductsResult[0].totalQuantity : 0;
    const totalUsers =
      totalUsersResult.length > 0 ? totalUsersResult[0].totalUsers : 0;

    //-------------graph deatails----------------------------

    const usersData = await graphHelpers.countUsers();
    const productSold = await graphHelpers.calculateProductSold();
    console.log(productSold,"........................");

    res.render("./admin/pages/index", {
      title: "WATCHBOX/INDEX",
      soldCount,
      totalOrders,
      totalQuantity,
      totalUsers,
      usersData,
      productSold,
    });
  } catch (error) {
    throw new Error("Error:", error);
  }
});

//---------------usermanagement------------------------

const userManagement = asynchandler(async (req, res) => {
  try {
    const findUsers = await User.find();
    res.render("./admin/pages/userlist", {
      users: findUsers,
      title: "WATCHBOX/USERLIST",
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

const searchUser = asynchandler(async (req, res) => {
  try {
    const data = req.body.search;

    const searching = await User.find({
      userName: { $regex: data, $options: "i" },
    });

    if (searching) {
      res.render("./admin/pages/userlist", {
        users: searching,
        title: "WATCHBOX/USERLIST",
      });
    } else {
      res.render("./admin/pages/userlist", { title: "Search" });
    }
  } catch (error) {
    throw new Error(error.message);
  }
});

//----------------block user----------------

const blockUser = asynchandler(async (req, res) => {
  try {
    const id = req.params.id;
    await User.findByIdAndUpdate(id, { isBlock: true }, { new: true });
    res.redirect("/admin/userlist");
  } catch (error) {
    throw new Error(error);
  }
});

//-----------------------unblock user----------------------

const unblockUser = asynchandler(async (req, res) => {
  try {
    const id = req.params.id;
    await User.findByIdAndUpdate(id, { isBlock: false }, { new: true });
    res.redirect("/admin/userlist");
  } catch (error) {
    throw new Error(error);
  }
});

//-------------------logout---------------- --------------------------------

const logout = asynchandler(async (req, res) => {
  try {
    req.session.admin = null;
    res.redirect("/admin");
  } catch (error) {
    throw new Error(error);
  }
});

//-----------------product page load ----------------------

module.exports = {
  loadLogin,
  loadIndex,
  verifyAdmin,
  userManagement,
  searchUser,
  blockUser,
  unblockUser,
  logout,
};

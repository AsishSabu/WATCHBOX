const expressAsyncHandler = require("express-async-handler");
const User = require("../../models/userModels");
const asynchandler = require("express-async-handler");
const Product = require("../../models/productModel");
const Orders = require("../../models/orderModel");
require("dotenv").config();

// -------------------load Login------------------------

const loadLogin = asynchandler(async (req, res) => {
  try {
    res.render("./admin/pages/login", { title: "WATCHBOX/LOGIN" });
  } catch (error) {
    console.log(error);
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
    console.log(error.message);
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

    console.log("Total number of orders:", totalOrders);
    console.log("Total number of sold products:", soldCount);
    console.log("Total quantity of all products:", totalQuantity);
    console.log("Total number of users:", totalUsers);

    res.render("./admin/pages/index", {
      title: "WATCHBOX/INDEX",
      soldCount,
      totalOrders,
      totalQuantity,
      totalUsers,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});


//---------------------load user list-------------------

// const userList=asynchandler(async(req,res)=>{
//     try {
//         res.render('./admin/pages/userlist',{title:"WATCHBOX/USERLIST"})

//     } catch (error) {
//         console.log(error.message)
//     }
// })

//---------------usermanagement------------------------

const userManagement = asynchandler(async (req, res) => {
  try {
    const findUsers = await User.find();
    res.render("./admin/pages/userlist", {
      users: findUsers,
      title: "WATCHBOX/USERLIST",
    });
  } catch (error) {
    console.log(error.message);
  }
});

const searchUser = asynchandler(async (req, res) => {
  try {
    const data = req.body.search;

    const searching = await User.find({
      userName: { $regex: data, $options: "i" },
    });
    console.log(searching);

    if (searching) {
      res.render("./admin/pages/userlist", {
        users: searching,
        title: "WATCHBOX/USERLIST",
      });
    } else {
      res.render("./admin/pages/userlist", { title: "Search" });
    }
  } catch (error) {
    console.log(error.message);
  }
});

//----------------block user----------------

const blockUser = asynchandler(async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    await User.findByIdAndUpdate(id, { isBlock: true }, { new: true });
    res.redirect("/admin/userlist");
  } catch (error) {}
});

//-----------------------unblock user----------------------

const unblockUser = asynchandler(async (req, res) => {
  try {
    const id = req.params.id;
    await User.findByIdAndUpdate(id, { isBlock: false }, { new: true });
    res.redirect("/admin/userlist");
  } catch (error) {
    console.log(error.message);
  }
});

//-------------------logout---------------- --------------------------------

const logout = asynchandler(async (req, res) => {
  try {
    console.log("hello i logout");
    req.session.admin = null;
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
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

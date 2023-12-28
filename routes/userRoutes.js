const express = require("express");
const userRoute = express();
const passport = require("passport");
const usercontroller = require("../controllers/shop/userController");
const shopController = require("../controllers/shop/shopControllers");
const cartController = require("../controllers/shop/cartController");
const {
  ensureAuthenticated,
  ensureNotAuthenticated,
} = require("../middleware/userAuth");
const checkoutController = require("../controllers/shop/checkoutController");
const addressController = require("../controllers/shop/addressControl");
const orderController = require("../controllers/shop/orderControllers");
const { validateID } = require("../middleware/idValidation")
const walletController = require("../controllers/shop/walletController");

userRoute.use((req, res, next) => {
  req.app.set("layout", "user/layout/user");
  next();
});

//-----------------------auth methods--------------------
/*    
    get methods
    */
userRoute.get("/", usercontroller.loadIndex);
userRoute.get("/login", ensureNotAuthenticated, usercontroller.loadLogin);
userRoute.get("/logout", ensureAuthenticated, usercontroller.logout);
userRoute.get("/register", ensureNotAuthenticated, usercontroller.loadRegister);
userRoute.get("/resendOtp", ensureNotAuthenticated, usercontroller.resendOtp);
userRoute.get("/verifyOtp", ensureNotAuthenticated, usercontroller.loadOtp);
userRoute.get( "/sendEmail",ensureNotAuthenticated,usercontroller.loadSendEmail);
userRoute.get( "/verifyEmail",ensureNotAuthenticated, usercontroller.LoadVerifyEmail);
userRoute.get("/reverifyEmail",ensureNotAuthenticated,usercontroller.reverifyEmail);
userRoute.get("/profile", ensureAuthenticated, usercontroller.loadProfile);
userRoute.post("/profile", ensureAuthenticated, usercontroller.editProfile);

/*
    post methods
    */
userRoute.post("/login",ensureNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/", // Redirect on successful login
    failureRedirect: "/login", // Redirect on failed login
    failureFlash: true, // enable flash messages
  })
);
userRoute.post("/register", usercontroller.insertUser);
userRoute.post("/verifyOtp", usercontroller.verifyOtp);
userRoute.post("/logout", usercontroller.logout);
userRoute.post("/sendEmail", usercontroller.sendEmail);
userRoute.post("/verifyEmail", usercontroller.verifyEmail);
userRoute.post("/checkEmail", usercontroller.checkEmail);
userRoute.post("/emailcheck", usercontroller.emailcheck);
userRoute.get("/forgotPassword", usercontroller.loadforgotPassword);
userRoute.post("/forgotPassword", usercontroller.forgotPassword);
userRoute.post("/resetPassword/:id", usercontroller.resetPassword);
userRoute.get("/newPassword", usercontroller.loadnewPassword);
userRoute.post("/newPassword", usercontroller.newPassword);
userRoute.get("/changePassword",ensureAuthenticated,usercontroller.changePassword);

//-------------------------whislist---------------------------------
userRoute.get("/whishlist", ensureAuthenticated, shopController.loadWhishlist);
userRoute.get("/addTo-wishlist/:id",validateID,ensureAuthenticated,shopController.addTowishlist);
userRoute.get("/removeWishlist/:id",validateID,ensureAuthenticated,shopController.removeItemfromWishlist);

//--------------------------shop page------------------------

userRoute.get("/shop", shopController.loadShop);

//-------------------------------productDetails page------------------------

userRoute.get("/viewProduct/:id",validateID,shopController.loadProductDetails);

//------------------------user Cart page---------------------------------------------------

userRoute.get("/cart", ensureAuthenticated, cartController.loadCart);
userRoute.get("/cart/add/:id",validateID,ensureAuthenticated,cartController.addToCart);
userRoute.get("/cart/remove/:id",validateID,ensureAuthenticated,cartController.removeProduct);
userRoute.get("/cart/inc/:id",validateID,ensureAuthenticated,cartController.incQuantity);
userRoute.get(
  "/cart/dec/:id",
  validateID,
  ensureAuthenticated,
  cartController.decQuantity
);

userRoute.get(
  "/getCartCount",
  ensureAuthenticated,
  cartController.getCartCount
);

userRoute.get("/checkProductAvailability", ensureAuthenticated, cartController.checkProductAvailability)
//---------------------------address Route------------

userRoute.get(
  "/addAddress",
  ensureAuthenticated,
  addressController.loadAddress
);
userRoute.post(
  "/addAddress",
  ensureAuthenticated,
  addressController.insertAddress
);
userRoute.get(
  "/savedAddress",
  ensureAuthenticated,
  addressController.loadSavedAddress
);
userRoute.get(
  "/editAddress/:id",
  validateID,
  ensureAuthenticated,
  addressController.loadEditAddress
);
userRoute.post(
  "/editAddress/:id",
  validateID,
  ensureAuthenticated,
  addressController.editAddress
);

//------------------------userr checkout mangement------------------------

userRoute.post("/checkout", ensureAuthenticated, checkoutController.checkoutPage);
userRoute.get(
  "/checkout/get",
  ensureAuthenticated,
  checkoutController.getCartData
);
userRoute.post(
  "/place-order",
  ensureAuthenticated,
  checkoutController.placeOrder
);
userRoute.get("/order-placed/:id", validateID, checkoutController.orderPlaced);
userRoute.post(
  "/verify-payment",
  ensureAuthenticated,
  checkoutController.verifyPayment
);
userRoute.post("/update", ensureAuthenticated, checkoutController.updatePage);
userRoute.post("/coupon", ensureAuthenticated, checkoutController.updateCoupon);
userRoute.post("/coupon/remove", ensureAuthenticated, checkoutController.removeAppliedCoupon)

//-------------------order controller------------------------------
userRoute.get("/order", ensureAuthenticated, orderController.orderPage);
userRoute.post(
  "/orders/:id",
  validateID,
  ensureAuthenticated,
  orderController.viewOrder
);
userRoute.put("/orders/:id", orderController.cancelOrder);
userRoute.put(
  "/orders/cancel/:id",
  validateID,
  ensureAuthenticated,
  orderController.cancelOrder
);
userRoute.post("/orders/return/:id", validateID, orderController.ReturnOrder);
userRoute.get("/orders/download/:id/:productId", orderController.donwloadInvoice);

//-------------------------wallet History------------------------------------

userRoute.get(
  "/walletHistory",
  ensureAuthenticated,
  walletController.viewWallet
);

userRoute.get("/test", (req, res) => {
  res.render("./user/pages/test", { title: "test" });
});

// 404 notfound page--
userRoute.get("*", (req, res) => {
  res.render("./user/pages/404", { title: "Error.." });
});

module.exports = userRoute;

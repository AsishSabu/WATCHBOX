const express = require("express");
const userRoute = express();
const usercontroller = require("../controllers/shop/userController");
const shopController = require("../controllers/shop/shopControllers");

userRoute.use((req, res, next) => {
  req.app.set("layout", "user/layout/user");
  next();
});

//-----------------------auth methods--------------------
/*    
    get methods
    */
userRoute.get("/", usercontroller.loadIndex);
userRoute.get("/login", usercontroller.loadLogin);
userRoute.get("/register", usercontroller.loadRegister);
userRoute.get("/resendOtp", usercontroller.resendOtp);
userRoute.get("/verifyOtp", usercontroller.loadOtp);
userRoute.get("/sendEmail", usercontroller.loadSendEmail);
userRoute.get("/verifyEmail", usercontroller.LoadVerifyEmail);
userRoute.get("/reverifyEmail", usercontroller.reverifyEmail);

/*
    post methods
    */
userRoute.post("/login", usercontroller.userLogin);
userRoute.post("/register", usercontroller.insertUser);
userRoute.post("/verifyOtp", usercontroller.verifyOtp);
userRoute.post("/logout", usercontroller.logout);
userRoute.post("/sendEmail", usercontroller.sendEmail);
userRoute.post("/verifyEmail", usercontroller.verifyEmail);




//--------------------------shop page------------------------

userRoute.get("/shop", shopController.loadShop);

//-------------------------------productDetails page------------------------

userRoute.get("/viewProduct/:id", shopController.loadProductDetails);

module.exports = userRoute;

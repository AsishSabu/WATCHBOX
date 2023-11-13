const express = require("express");
const userRoute = express();
const passport = require('passport')
const usercontroller = require("../controllers/shop/userController");
const shopController = require("../controllers/shop/shopControllers");
const cartController=require("../controllers/shop/cartController")
const {ensureAuthenticated,ensureNotAuthenticated}=require("../middleware/userAuth");
const adminRoute = require("./adminRoute");
const checkoutController=require('../controllers/shop/checkoutController')
const addressController=require('../controllers/shop/addressControl')
userRoute.use((req, res, next) => {
  req.app.set("layout", "user/layout/user");
  next();
});

//-----------------------auth methods--------------------
/*    
    get methods
    */
userRoute.get("/", usercontroller.loadIndex);
userRoute.get("/login", ensureNotAuthenticated,usercontroller.loadLogin);
userRoute.get("/logout",ensureAuthenticated,usercontroller.logout);
userRoute.get("/register", ensureNotAuthenticated, usercontroller.loadRegister);
userRoute.get("/resendOtp", ensureNotAuthenticated, usercontroller.resendOtp);
userRoute.get("/verifyOtp", ensureNotAuthenticated, usercontroller.loadOtp);
userRoute.get("/sendEmail", ensureNotAuthenticated, usercontroller.loadSendEmail);
userRoute.get("/verifyEmail", ensureNotAuthenticated, usercontroller.LoadVerifyEmail);
userRoute.get("/reverifyEmail",  ensureNotAuthenticated,usercontroller.reverifyEmail);

/*
    post methods
    */
userRoute.post('/login',ensureNotAuthenticated,
passport.authenticate('local', {
successRedirect: '/', // Redirect on successful login
failureRedirect: '/login', // Redirect on failed login
failureFlash: true, // enable flash messages
}));
userRoute.post("/register", usercontroller.insertUser);
userRoute.post("/verifyOtp", usercontroller.verifyOtp);
userRoute.post("/logout", usercontroller.logout);
userRoute.post("/sendEmail", usercontroller.sendEmail);
userRoute.post("/verifyEmail", usercontroller.verifyEmail);




//--------------------------shop page------------------------

userRoute.get("/shop", shopController.loadShop);

//-------------------------------productDetails page------------------------

userRoute.get("/viewProduct/:id", shopController.loadProductDetails);



//------------------------user Cart page--------------------------------------------------- 

userRoute.get('/cart',ensureAuthenticated,cartController.loadCart);
userRoute.get('/cart/add/:id',ensureAuthenticated,cartController.addToCart);
userRoute.get('/cart/remove/:id',ensureAuthenticated,cartController.removeProduct);
userRoute.get('/cart/inc/:id',ensureAuthenticated,cartController.incQuantity);
userRoute.get('/cart/dec/:id',ensureAuthenticated,cartController.decQuantity)
//---------------------------address Route------------

userRoute.get('/addAddress',ensureAuthenticated,addressController.loadAddress);
userRoute.post('/addAddress',ensureAuthenticated,addressController.insertAddress);

//------------------------userr checkout mangement------------------------    

userRoute.post('/checkout',ensureAuthenticated,checkoutController.cartPage)


// 404 notfound page--
// userRoute.get('*',(req,res)=>{
//   try {
//     res.render('./user/pages/404',{title:'Error..',})
//   } catch (error) {
//     throw new Error(error)
//   }
//  })

module.exports = userRoute;

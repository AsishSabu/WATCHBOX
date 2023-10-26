const User = require("../../models/userModels");
const otpSetup = require("../admin/otpSetup");
const otpDb = require("../../models/otpModel");
const asynchandler = require("express-async-handler");
const otpdb = require("../../models/otpModel");
const bcrypt=require('bcrypt');
const product=require('../../models/productModel')


//-------------------------loadlanding page---------------------
const loadIndex = asynchandler(async (req, res) => {


  try {
    const topProduct= await product.find({isListed:true}).populate("categoryName").populate("images");
   console.log(topProduct);
    res.render("./user/pages/index",{topProduct});
  } catch (error) {
    console.log(error.message);
  }
});

//------------------load login page--------
const loadLogin = asynchandler(async (req, res) => {
  try {
    res.render("./user/pages/login");
  } catch (error) {}
});

//-----------------load register page------------------------
const loadRegister = asynchandler(async (req, res) => {
  try {
    res.render("./user/pages/register");
  } catch (error) {}
});

//---------------------insert user to database-----------------------

const insertUser = asynchandler(async (req, res) => {
  try {
    const emailCheck = req.body.email;
    const checkData = await User.findOne({ email: emailCheck });

    if (checkData) {
      res.render("./user/pages/register", {
        message: "user is already registered, please try with another email",
      });
    } else {
      const userData = {
        userName: req.body.name,
        email: req.body.email,
        password: req.body.password,
      };
      req.session.userData = userData;

      //--------------------generating otp --------------------

      const OTP = otpSetup.generateNumericOTP();
      console.log(OTP);

      //--------------saving otp to databasse------------------------------

      const email = req.body.email;

      const otp = new otpdb({ email: email, otp: OTP });
      const otpSave = await otp.save();
      if (otpSave) {
        console.log("registered successfully");
      } else {
        console.log("registered unsuccessfully");
      }

      //------------------------otp sending to mail ------------------------------
      name = req.body.name;
      const otpSend = otpSetup.sendOtp(email, OTP, name);
    }

    try {
      return res.redirect("/verifyOtp");
    } catch (error) {
      console.log(error.message);
    }
  } catch (error) {
    throw new Error(error);
  }
});

//-----------------load Otp page------------------------

const loadOtp = asynchandler(async (req, res) => {
  try {
    email = req.session.userData.email;

    res.render("./user/pages/verifyOtp", { email: email });
  } catch (error) {
    console.log(error.message);
  }
});

//-------------------verfify otp from db----------------

const verifyOtp = async (req, res) => {
  try {
    const enteredOtp = req.body.otp;

    // Use the Mongoose model to search for the OTP in the database
    const otpRecord = await otpdb.findOne({ otp: enteredOtp });

    if (otpRecord) {
      res.redirect("/login");

      const user = new User({
        userName: req.session.userData.userName,
        email: req.session.userData.email,
        password: req.session.userData.password,
      });

      const userSave = await user.save();

      // const userSave = await User.create(user);
      if (userSave) {
        console.log("registered successfully");
      } else {
        console.log("registration error");
      }
    } else {
      res.render("./user/pages/verifyOtp", { email, message: "invalid otp" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("verify otp Error");
  }
};

//------------------resend otp----------------------------------------------------

const resendOtp = asynchandler(async (req, res) => {
  try {
    const OTP = otpSetup.generateNumericOTP();
    console.log(OTP);
    const email = req.session.userData.email;
    console.log(email);

    const otp = new otpdb({ email: email, otp: OTP });
    const otpSave = await otp.save();
    if (otpSave) {
      console.log("registered successfully");
    } else {
      console.log("registered unsuccessfully");
    }

    name = req.session.userData.name;
    const otpSend = otpSetup.sendOtp(email, OTP, name);

    try {
      return res.redirect("/verifyOtp");
    } catch (error) {
      console.log(error.message);
    }
  } catch (error) {}
});

//--------------------------------verify login--------------------------------  


const userLogin = asynchandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });  //---------------checking email already registered-----------------------
    console.log(user);
    if (!user) {
 return res.render('./user/pages/login',{message: "User not found. Please check your email"})
    } else {
      const passwordValid = await bcrypt.compare( password,user.password); //----------------compare enterd password and registered passwoerd-------


      if (!passwordValid) {
        return res.render("./user/pages/login", {
          message: "invalid password",
        });
      } else {
        if (user.isBlock)    //---------------------------checking user i s blocked --------------------    
         {                          
          return res.render("./user/pages/login", {
            message: "your permission declined",
          });
        } else {
            req.session.user_id = user._id;
          res.redirect("/");
        }
      }
    }
  } catch (error) {
    console.log(error.message);
  }
});


//--------------------------------logout----------------------------------------------------

const logout=asynchandler(async (req,res) => {
  try {
    
    req.session.destroy();    
     res.redirect('/')

    
  } catch (error) {
    console.log(error);
  }
});




module.exports = {
  loadIndex,
  loadLogin,
  loadRegister,
  insertUser,
  loadOtp,
  verifyOtp,
  resendOtp,
  userLogin,
  logout,

};

const User = require("../../models/userModels");
const otpSetup = require("../admin/otpSetup");
const otpDb = require("../../models/otpModel");
const asynchandler = require("express-async-handler");
const otpdb = require("../../models/otpModel");
const bcrypt = require("bcrypt");
const product = require("../../models/productModel");
const category = require("../../models/categoryModel");

//-------------------------loadlanding page---------------------
const loadIndex = asynchandler(async (req, res) => {
  try {
    const listedCategories = await category.find({ isListed: true });
    const listedCategoryIds = listedCategories.map((category) => category._id);
    const topProduct = await product
      .find({ categoryName: { $in: listedCategoryIds }, isListed: true })
      .populate("images")
      .limit(8);

    res.render("./user/pages/index", {title:'WATCHBOX', topProduct });
  } catch (error) {
    throw new Error(error);
  }
});

//------------------load login page--------
const loadLogin = asynchandler(async (req, res) => {
  try {
    const messages = req.flash();
    res.render("./user/pages/login", {title:'WATCHBOX', messages });
  } catch (error) {
    throw new Error(error);
  }
});

//-----------------load register page------------------------
const loadRegister = asynchandler(async (req, res) => {
  try {
    const messages = req.flash();
    res.render("./user/pages/register", {title:'WATCHBOX', messages });
  } catch (error) {
    throw new Error(error);
  }
});

//---------------------insert user to database-----------------------

const insertUser = asynchandler(async (req, res) => {
  try {
    const emailCheck = req.body.email;
    const checkData = await User.findOne({ email: emailCheck });

    if (checkData) {
      req.flash(
        "danger",
        "user is already registered, please try with another email"
      );
      res.redirect("/register");
    } else {
      const userData = new User({
        userName: req.body.name,
        email: req.body.email,
        password: req.body.password,
      }); /*--------
            accessing the details of the user
               */
      const userSave = await userData.save(); //-------------------user save to database-------------------
      req.session.userData = userData; //-------------------userdata take to the  session----------------

      //--------------------generating otp --------------------
      const OTP = otpSetup.generateNumericOTP();
      console.log(OTP);
      //--------------saving otp to databasse------------------------------
      const email = req.body.email;
      const otp = new otpdb({ email: email, otp: OTP });
      const otpSave = await otp.save();

      //------------------------otp sending to mail ------------------------------
      const name = req.body.name;
      const otpSend = otpSetup.sendOtp(email, OTP, name);
    }
    try {
      return res.redirect("/verifyOtp");
    } catch (error) {
      throw new Error(error);
    }
  } catch (error) {
    throw new Error(error);
  }
});

//-----------------load Otp page------------------------
const loadOtp = asynchandler(async (req, res) => {
  try {
    email = req.session.userData.email;
    const messages = req.flash();
    res.render("./user/pages/verifyOtp", {title:'WATCHBOX', email: email, messages });
  } catch (error) {
    throw new Error(error);
  }
});

//-------------------verfify otp from db----------------

const verifyOtp = async (req, res) => {
  try {
    const enteredOtp = req.body.otp;
    // Use the Mongoose model to search for the OTP in the database
    const otpRecord = await otpdb.findOne({ otp: enteredOtp });
    if (otpRecord) {
      const verifyOtp = await User.findOneAndUpdate(
        { email: otpRecord.email },
        { $set: { isVerified: true } }
      );
      req.flash("success", "succesfully registered");
      res.redirect("/login");
    } else {
      req.flash("danger", "enter a valid otp");
      res.redirect("/verifyOtp");
    }
  } catch (error) {
    throw new Error(error);
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
    const name = req.session.userData.name;
    const otpSend = otpSetup.sendOtp(email, OTP, name);
    try {
      return res.redirect("/verifyOtp");
    } catch (error) {
      throw new Error(error);
    }
  } catch (error) {
    throw new Error(error);
  }
});

//--------------------------------verify login--------------------------------
const userLogin = asynchandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email }); 
    console.log(user.isVerified);
    //---------------checking email already registered-----------------------

    // if (!user) {
    //   req.flash("danger", "User not found. Please check your email");
    //   res.redirect("/login");
    // } else {
    //   const passwordValid = await bcrypt.compare(password, user.password); //----------------compare enterd password and registered passwoerd-------

    //   if (!passwordValid) {
    //     req.flash("danger", "invalid password");
    //     res.redirect("/login");
    //   } else {
    //     if (user.isBlock) {
    //       //---------------------------checking user i s blocked --------------------
    //       req.flash("danger", "your permission declined");
    //       res.redirect("/login");
    //     } else if (!user.isVerified) {
    //       req.flash("danger", "please verify your account");
    //       res.redirect("/login");
    //     } else {
    //       req.session.user_id = user._id;

    //       res.redirect("/");
    //     }
    //   }
    // }
  } catch (error) {
    throw new Error(error);
  }
});

//--------------------------------logout----------------------------------------------------
const logout = asynchandler(async (req, res) => {
  try {
    req.logout(function (err) {
      if (err) {
        next(err);
      }
    });
    res.redirect("/");
  } catch (error) {
    throw new Error(error);
  }
});

//-------------------load--sendEmail----------------------------------------------------------------
const loadSendEmail = asynchandler(async (req, res) => {
  try {
    const messages = req.flash();
    res.render("./user/pages/otpVerification", {title:'WATCHBOX', messages });
  } catch (error) {
    throw new Error(error);
  }
});

//-------------------sendEmail----------------------------------------------------------------
const sendEmail = asynchandler(async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email: email }); //---------------checking email already registered-----------------------

    if (user.isVerified) {
      req.flash("danger", "you are already verified");
      res.redirect("/sendEmail");
    } else {
      req.session.verifyEmail = email;
      const OTP = otpSetup.generateNumericOTP();
      console.log(OTP);
      const otp = new otpdb({ email: email, otp: OTP });
      const otpSave = await otp.save();
      name = user.userName;
      const otpSend = otpSetup.sendOtp(email, OTP, name);
      try {
        res.redirect("/verifyEmail");
      } catch (error) {
        throw new Error(error);
      }
    }
  } catch (error) {
    throw new Error(error);
  }
});

//-----------------------load verify email----------------------------------

const LoadVerifyEmail = asynchandler(async (req, res) => {
  try {
    const email = req.session.verifyEmail;
    const messages = req.flash();
    res.render("./user/pages/emailVerification", {title:'WATCHBOX', email, messages });
  } catch (error) {
    throw new Error(error);
  }
});

//--------------------------verifyEmail------------------------

const verifyEmail = asynchandler(async (req, res) => {
  try {
    const enteredOtp = req.body.otp;
    const otpRecord = await otpdb.findOne({ otp: enteredOtp });
    if (otpRecord) {
      const verifyOtp = await User.findOneAndUpdate(
        { email: otpRecord.email },
        { $set: { isVerified: true } }
      );
      req.flash("success", "succesfully registered");
      res.redirect("/login");
    } else {
      req.flash("danger", "enter a valid otp");
      res.redirect("/verifyEmail");
    }
  } catch (error) {
    throw new Error(error);
  }
});

//----------------------------------resend verify email--------------------------------

const reverifyEmail = asynchandler(async (req, res) => {
  try {
    const OTP = otpSetup.generateNumericOTP();
    console.log(OTP);
    email = req.session.verifyEmail;
    const otp = new otpdb({ email: email, otp: OTP });
    const otpSave = await otp.save();
    const user = await User.findOne({ email: email });
    const otpSend = otpSetup.sendOtp(email, OTP, user.userName);
    try {
      return res.redirect("/verifyEmail");
    } catch (error) {
      throw new Error(error);
    }
  } catch (error) {
    throw new Error(error);
  }
});


//--------------------------profile page loader------------------------

const loadProfile=asynchandler(async(req,res)=>{
  try {
    const user=req.user;
    console.log(user);
    res.render('./user/pages/profile',{title:'WATCHBOX,user'})
  } catch (error) {
    throw new Error(error);
  }
})

//--------------------------edit the profile page------------------------

const editProfile=asynchandler(async(req,res)=>{
  try {
    console.log(req.body);
    const userId=req.user.id;
    const editedProfile=await User.findByIdAndUpdate({_id:userId},req.body)
    res.redirect('/profile')
  } catch (error) {
    throw new Error(error);
  }
})

const checkEmail=asynchandler(async(req,res)=>{
  try {
    const existingEmail=await User.find(req.body.email);
    if(existingEmail){
      res.json("email already registered")
    }else{
      res.json("");
    }
    
  } catch (error) {
    throw new Error(error);
  }
})

//------------------------exported modules------------------------
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
  loadSendEmail,
  sendEmail,
  LoadVerifyEmail,
  verifyEmail,
  reverifyEmail,
  loadProfile,
  editProfile,
  checkEmail
};

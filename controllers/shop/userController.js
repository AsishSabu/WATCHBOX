const User = require("../../models/userModels");
const otpSetup = require("../admin/otpSetup");
const otpDb = require("../../models/otpModel");
const asynchandler = require("express-async-handler");
const otpdb = require("../../models/otpModel");
const bcrypt = require("bcrypt");
const product = require("../../models/productModel");
const category = require("../../models/categoryModel");
const crypto = require("crypto");
const Banner = require("../../models/bannerModel");
const Wallet = require("../../models/walletModel");
const Orders = require("../../models/orderModel");
const {
  generateReferralCode,
  creditforRefferedUser,
  creditforNewUser,
} = require("../../helpers/referHelpers");
const { log } = require("util");

//-------------------------loadlanding page---------------------
const loadIndex = asynchandler(async (req, res) => {
  try {
    const listedCategories = await category.find({ isListed: true });
    const listedCategoryIds = listedCategories.map((category) => category._id);
    const topProduct = await product
      .find({ categoryName: { $in: listedCategoryIds }, isListed: true })
      .populate("images")
      .limit(8);
    console.log(topProduct);
    const banner = await Banner.find({ isActive: true }).limit(1);

    res.render("./user/pages/index", { title: "WATCHBOX", topProduct, banner });
  } catch (error) {
    throw new Error(error);
  }
});

//------------------load login page--------
const loadLogin = asynchandler(async (req, res) => {
  try {
    const messages = req.flash();
    res.render("./user/pages/login", { title: "WATCHBOX", messages });
  } catch (error) {
    throw new Error(error);
  }
});

//-----------------load register page------------------------
const loadRegister = asynchandler(async (req, res) => {
  try {
    const messages = req.flash();
    res.render("./user/pages/register", { title: "WATCHBOX", messages });
  } catch (error) {
    throw new Error(error);
  }
});

//---------------------insert user to database-----------------------

const insertUser = asynchandler(async (req, res) => {
       console.log("insertUser function called...................");

  try {
    const userData = new User({
      userName: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordChangedAt: Date.now(),
    });
    if (req.body.referalCode !== "") {
      userData.referralCode = req.body.referalCode;
    } else {
      userData.referralCode = "no referral code";
    }
    try {
      const existingEmail = await User.findOne({ email: req.body.email });

      if (existingEmail) {
        req.flash("danger", "email already registered please try with another");
        res.redirect("back");
      } else {
        /*--------
            accessing the details of the user
               */
        const userSave = await userData.save(); //-------------------user save to database-------------------
        req.session.userData = userData; //-------------------userdata take to the  session----------------

        const userWallet = await Wallet.create({ user: userData._id });
        const userwallet = await User.findByIdAndUpdate(userData._id, {
          wallet: userWallet._id,
        });
        //--------------------generating otp --------------------
        const OTP = await otpSetup.generateNumericOTP();
        console.log(OTP, "----otp");

        //--------------saving otp to databasse------------------------------
        const email = req.body.email;
        const otp = await new otpdb({ email: email, otp: OTP });
        const otpSave = await otp.save();

        //------------------------otp sending to mail ------------------------------
        const name = req.body.name;
        const otpSend = await otpSetup.sendOtp(email, OTP, name);
      }
    } catch (error) {
      throw new Error(error.message);
    }
    try {
      return res.redirect("/verifyOtp");
    } catch (error) {
      throw new Error(error);
    }
  } catch (error) {
    throw new Error(error.message);
  }
});

//-----------------load Otp page------------------------
const loadOtp = asynchandler(async (req, res) => {
  try {
    const email = req.session.userData.email;
    const messages = req.flash();
    res.render("./user/pages/verifyOtp", {
      title: "WATCHBOX",
      email: email,
      messages,
    });
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
      const user = await User.findOne({ email: otpRecord.email });
      let userFound = null;
      if (user.referralCode && user.referralCode !== "no referral code") {
        const referralCode = user.referralCode.trim();
        userFound = await creditforRefferedUser(referralCode, otpRecord.email);
        const creditNewUser = await creditforNewUser(user);
        user.referralCode = null;
        const newUser = await user.save();
      }
      const referalCode = await generateReferralCode(8);
      user.referralCode = referalCode;
      const newUser = await user.save();

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
    console.log(OTP, "----otp");
    const email = req.session.userData.email;
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
    res.render("./user/pages/otpVerification", { title: "WATCHBOX", messages });
  } catch (error) {
    throw new Error(error);
  }
});

//-------------------sendEmail----------------------------------------------------------------
const sendEmail = asynchandler(async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email: email }); //---------------checking email already registered-----------------------

    if (!user) {
      req.flash("danger", "please register first");
      res.redirect("/sendEmail");
    } else if (user.isVerified) {
      req.flash("danger", "you are already verified");
      res.redirect("/sendEmail");
    } else {
      req.session.verifyEmail = email;
      const OTP = otpSetup.generateNumericOTP();
      const otp = new otpdb({ email: email, otp: OTP });
      const otpSave = await otp.save();
      const name = user.userName;
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
    res.render("./user/pages/emailVerification", {
      title: "WATCHBOX",
      email,
      messages,
    });
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

const loadProfile = asynchandler(async (req, res) => {
  try {
    const user = req.user;
    const wallet = await Wallet.findOne({ user: req.user._id });
    const order = await Orders.findOne({ user: req.user._id }).count();

    const whishlist = await User.findById(user).populate("wishlist");
    const wishlistCount = whishlist.wishlist.length;
    res.render("./user/pages/profile", {
      title: "WATCHBOX",
      wallet,
      order,
      wishlistCount,
    });
  } catch (error) {
    throw new Error(error);
  }
});

//--------------------------edit the profile page------------------------

const editProfile = asynchandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const editedProfile = await User.findByIdAndUpdate(
      { _id: userId },
      req.body
    );
    res.redirect("/profile");
  } catch (error) {
    throw new Error(error);
  }
});

//-----------check email if already existing
const checkEmail = asynchandler(async (req, res) => {
  try {
    const existingEmail = await User.findOne({ email: req.body.email });

    if (existingEmail) {
      res.json("email already registered");
    } else {
      res.json("");
    }
  } catch (error) {
    throw new Error(error);
  }
});
//--------------load forgot password ----------------------------

const loadforgotPassword = asynchandler(async (req, res) => {
  try {
    const messages = req.flash();
    res.render("./user/pages/forgotPassword", { title: "WAT", messages });
  } catch (error) {
    throw new Error(error);
  }
});

// post method forgot----------------------

const forgotPassword = asynchandler(async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("danger", "enter a registered email addresss");
      res.redirect("back");
    } else {
      //generate a random reset token-------------------
      const resetToken = await user.createResetPasswordToken();
      await user.save();
      const name = user.userName;
      const sendToken = await otpSetup.sendToken(email, resetToken, name);
      req.flash("success", "verify link send to the email address");
      res.redirect("/forgotPassword");
    }
  } catch (error) {
    throw new Error(error);
  }
});
//----------------------email check-------------------------

const emailcheck = asynchandler(async (req, res) => {
  try {
    const existingEmail = await User.findOne({ email: req.body.email });

    if (!existingEmail) {
      res.json("please register your email address");
    } else {
      res.json("");
    }
  } catch (error) {
    throw new Error(error);
  }
});

//-------------------------reset password -----------------------------------

const resetPassword = asynchandler(async (req, res) => {
  try {
    const resetToken = req.params.id; //accessing the token

    const passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const tokenCheck = await User.findOne({ passwordResetToken });
    const time = tokenCheck.passwordResetTokenExpires;
    if (time < Date.now()) {
      // The reset token has expired
      req.flash("danger", "the link expired,try new one");
      res.redirect("/forgotPassword");
    } else {
      // The reset token is still valid
      req.session.email = tokenCheck.email;
      res.redirect("/newPassword");
    }
  } catch (error) {
    throw new Error(error);
  }
});

//---------------------------load the new password --------------------------------

const loadnewPassword = asynchandler(async (req, res) => {
  try {
    res.render("./user/pages/newPassword", { title: "WATCHBOX" });
  } catch (error) {
    throw new Error(error);
  }
});

//---------------------------setting the new password --------------------------------

const newPassword = asynchandler(async (req, res) => {
  try {
    const newPassword = req.body.newPassword;
    const email = req.session.email;
    const user = await User.findOne({ email });
    if (user) {
      const salt = bcrypt.genSaltSync(10);

      const password = await bcrypt.hash(newPassword, salt);
      user.password = password;
      user.passwordChangedAt = Date.now();
      user.passwordResetToken = undefined;
      user.passwordResetTokenExpires = undefined;
      await user.save();
      req.session.email = null;
      res.redirect("/login");
    } else {
      res.json("some internal error" + user);
    }
  } catch (error) {
    throw new Error(error);
  }
});

//-----------------------changing password page --------------------

const changePassword = asynchandler(async (req, res) => {
  try {
    const email = req.user.email;
    const user = await User.findOne({ email: email });
    const resetToken = await user.createResetPasswordToken();
    await user.save();
    const name = user.userName;
    const sendToken = await otpSetup.sendToken(email, resetToken, name);

    // Sending a response back to the client
    res.status(200).json({ message: "Password change initiated successfully" });
  } catch (error) {
    // Handle errors and send an error response
    throw new Error(error);
  }
});

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
  checkEmail,
  loadforgotPassword,
  forgotPassword,
  emailcheck,
  resetPassword,
  loadnewPassword,
  newPassword,
  changePassword,
};

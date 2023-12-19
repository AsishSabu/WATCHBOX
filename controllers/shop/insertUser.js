const User = require("../../models/userModels");
const otpSetup = require("../admin/otpSetup");
const asynchandler = require("express-async-handler");
const otpdb = require("../../models/otpModel");
const Wallet = require("../../models/walletModel");

//---------------------insert user to database-----------------------
const insertUser = asynchandler(async (req, res) => {
    try {
        const userData = new User({
            userName: req.body.name,
            email: req.body.email,
            password: req.body.password,
            passwordChangedAt: Date.now(),
        });
        if (req.body.referalCode !== "") {
            userData.referralCode = req.body.referalCode;
        }
        console.log(userData);

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
                console.log(userWallet);
                const userwallet = await User.findByIdAndUpdate(userData._id, { wallet: userWallet._id });
                console.log(userwallet);

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
        } catch (error) {
            throw new Error(error);
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

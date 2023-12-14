const Coupon = require("../../models/couponModel");
const asyncHandler = require("express-async-handler");




exports.loadAddCoupon = asyncHandler(async (req, res) => {
    try {
        const messages = req.flash();
        res.render("./admin/pages/addCoupon", { title: "addCoupon", messages, data: {} })
    } catch (error) {
        throw new Error(error)
    }
})



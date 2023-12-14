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

exports.addCoupon = asyncHandler(async (req, res) => { 
    try {
        console.log(req.body)
        const existingCoupon = await Coupon.findOne({ code: req.body.code });

        if (!existingCoupon) {
            const newCoupon = await Coupon.create({
                code: req.body.code,
                type: req.body.type,
                value: parseInt(req.body.value),
                description: req.body.description,
                expiryDate: req.body.expiryDate,
                minAmount: parseInt(req.body.minAmount),
                maxAmount: parseInt(req.body.maxAmount) || 0,
            });
            res.redirect("/admin/coupon");
        }
        req.flash("warning", "Coupon exists with same code");
        res.redirect("/addCoupon")

    } catch (error) {
        throw new Error(error)
    }
})

exports.loadCoupon = asyncHandler(async (req, res) => {
    try {
        const coupons = await Coupon.find()
        console.log(coupons);
        res.render("./admin/pages/coupon",{title:"coupons",coupons})
    } catch (error) {
        throw new Error(error)
    }
})


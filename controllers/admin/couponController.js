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
            res.redirect("/admin/coupons");
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

exports.listUnlist = asyncHandler(async (req, res) => {
    try {
        const couponId = req.params.id
        const coupon = await Coupon.findById(couponId)
        console.log(coupon.isListed);
        if (coupon.isListed) {
            coupon.isListed = false;
            coupon.save();
            return res.json({
                success: false,
                message: "coupon Unlisted",
            });
        } else {
            coupon.isListed = true;
            coupon.save();
            return res.json({
                success: true,
                message: "coupon Listed",
            });
        }
       

    } catch (error) {
        throw new Error(error)
    }
})

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
        const coupons = await Coupon.find().sort({ _id: -1 });
        res.render("./admin/pages/coupon",{title:"coupons",coupons})
    } catch (error) {
        throw new Error(error)
    }
})

exports.listUnlist = asyncHandler(async (req, res) => {
    try {
        const couponId = req.params.id
        const coupon = await Coupon.findById(couponId)
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
exports.editCoupon = asyncHandler(async (req, res) => {
    try {
        const coupons = await Coupon.findById(req.params.id);
        const messages=req.flash()
        res.render("./admin/pages/editCoupon",{title:"watchbox/editCoupon",data:coupons,messages})
    } catch (error) {
        throw new Error(error)
    }
})

exports.uploadCoupon = asyncHandler(async (req, res) => {
    try {
        const existingCoupon = await Coupon.findOne({ code: req.body.code, _id: { $ne: req.params.id } });
        if (existingCoupon) {
            req.flash("danger", "Coupon code already exists");
            return res.redirect("back");
        } else {
            const updatedCoupon = await Coupon.findByIdAndUpdate(req.params.id, req.body);
            return res.redirect("/admin/coupons");
        }
    } catch (error) {
        throw new Error(error);
    }
});

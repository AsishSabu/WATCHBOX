const Cart = require("../../models/cartModel");
const Product = require("../../models/productModel");
const User = require("../../models/userModels");
const asynchandler = require("express-async-handler");
const checkoutHelper=require("../../helpers/checkoutHelpers")
const {calculateCartTotals}=require("../../helpers/cartHelpers")







const cartPage=asynchandler(async(req,res)=>{
    try {
        const userid = req.user._id;
        const user = await User.findById(userid).populate("addresses");
        cartItems= await checkoutHelper.getCartItems(userid)

        if(cartItems){
            console.log(cartItems.products);
            const {subtotal,total}=calculateCartTotals(cartItems.products);
            res.render('./user/pages/checkout',{title:'WATCHBOX',address:user.addresses,product:cartItems.products ,total,subtotal})
           
        }
 
        
    } catch (error) {
        throw new Error(error)
    }

})


module.exports={cartPage}




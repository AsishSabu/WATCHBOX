const Cart=require("../../models/cartModel")
const Product=require("../../models/productModel")
const User=require("../../models/userModels")
const asynchandler = require("express-async-handler");


const loadCart=asynchandler(async(req,res)=>{
    const userId=req.user.id;
    const messages=req.flash();
  

    try {
        const cart=await Cart.findOne({user:userId}).populate({path:"products.product",populate:{path:"images",model:"Images"},}).exec();
       
        
        res.render("./user/pages/cart",{cartItems:cart})
    } catch (error) {
        console.log(error);
    }
})


// const addToCart=asynchandler(async)


module.exports={
    loadCart,
    // addToCart
}
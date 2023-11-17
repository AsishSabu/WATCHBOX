const Cart = require("../../models/cartModel");
const Product = require("../../models/productModel");
const User = require("../../models/userModels");
const asynchandler = require("express-async-handler");
const Orders=require("../../models/orderModel")
const {getOrders}=require("../../helpers/orderHelpers");



const orderPage=asynchandler(async(req,res)=>{
try {
    const userId = req.user._id;

    const user=await User.findById(userId)
    
    const orders = await getOrders(userId)
    console.log(orders.orderItems);

   

    res.render("./user/pages/orders",{title:"WATCHBOX",orders,user})
} catch (error) {
    throw new Error(error.message)
}

})
module.exports={
    orderPage
}
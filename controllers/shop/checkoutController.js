const Cart = require("../../models/cartModel");
const Product = require("../../models/productModel");
const User = require("../../models/userModels");
const asynchandler = require("express-async-handler");





const cartPage=asynchandler(async(req,res)=>{
    try {
        const address=0
        res.render('./user/pages/checkout',{title:'WATCHBOX',address})
        
    } catch (error) {
        throw new Error(error)
    }

})


module.exports={cartPage}




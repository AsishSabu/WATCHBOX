const asyncHandler = require("express-async-handler");
const Address = require("../models/addressModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

const getCartItems=asyncHandler(async(userId)=>{
    try {
        return await Cart.findOne({user:userId}).populate("products.product")
    } catch (error) {
        throw new Error(error)
    }
})

module.exports={
    getCartItems
}
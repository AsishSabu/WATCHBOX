
const Order =require("../models/orderModel");
const Product= require("../models/productModel");
const User=require("../models/userModels");
const expressAsyncHandler = require("express-async-handler");

exports.getOrders=expressAsyncHandler(async(userId)=>{
    
    const orders=await Order.find({user:userId}).populate({  path: "orderItems",
    select: "product status _id",
    populate: {
        path: "product",
        select: "title images",
        populate: {
            path: "images",
        },
    },})  .select("orderId orderedDate shippingAddress town")
    

  return orders;

})



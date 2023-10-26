const asynchandler = require("express-async-handler");
const product=require("../../models/productModel")
const category=require("../../models/categoryModel")

exports.loadShop=asynchandler(async(req,res)=>{
  try {
    
    res.render('./user/pages/shop')
  } catch (error) {
    console.log(error.message);
  }
})
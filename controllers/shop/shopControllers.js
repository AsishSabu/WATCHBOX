const asynchandler = require("express-async-handler");
const product=require("../../models/productModel")
const category=require("../../models/categoryModel")



// //----------------------load shop page ---------------------------------------
exports.loadShop=asynchandler(async(req,res)=>{
  try {
    const categories = await category.find({isListed:true});
  
    const products= await product.find({isListed:true}).populate("categoryName").populate("images")

    res.render('./user/pages/shop',{products,categories})
  } catch (error) {
    console.log(error.message);
  }
})

// //--------------------------load product details-------------------------------

exports.loadProductDetails = asynchandler(async(req, res)=>{
  try {
    const id = req.params.id;
 const Product = await product.findOne({_id:id}).populate("images").populate("categoryName");   
 const relatedProducts = await product.find().populate("images");

 res.render("./user/pages/productDetails", {Product,relatedProducts})
  } catch (error) {
    console.log(error.message);
  }
})
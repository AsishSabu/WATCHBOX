const Cart = require("../../models/cartModel");
const Product = require("../../models/productModel");
const User = require("../../models/userModels");
const asynchandler = require("express-async-handler");
const {incrementQuantity,decrementQuantity,calculateCartTotals} = require("../../helpers/cartHelpers")

const loadCart = asynchandler(async (req, res) => {
  const userId = req.user.id;
  const messages = req.flash();
  try {
    const cart = await Cart.findOne({ user: userId })
      .populate({
        path: "products.product",
        populate: { path: "images", model: "Images" },
      })
      .exec();
      
      if(cart){ 
        const {subtotal,total}=calculateCartTotals(cart.products);
        res.render("./user/pages/cart", {title:'WATCHBOX', cartItems: cart,subtotal,total,messages });
      }else{
      
        res.render("./user/pages/cart", {title:'WATCHBOX', cartItems:null,messages })
      }   
  } catch (error) {
    throw new Error(error);
  }
});

const addToCart = asynchandler(async (req, res) => {
 const productId = req.params.id;
  const userId = req.user.id;

  try {
      const product = await Product.findById(productId);

      if (!product) {
          return res.status(404).json({ message: "Product not found",count:1});
      }

      if (product.quantity <=0){
        return res.json({message:"out of stock",status:"danger",count:1});
      }

      
      let cart = await Cart.findOne({ user: userId });

      if (!cart) {
          cart = await Cart.create({ user: userId, products: [{ product: productId, quantity: 1 }] });
      } else {
          const existingProduct = cart.products.find((item) => item.product.equals(productId));

          if (existingProduct) {
              // Update the quantity of the existing product
              if(product.quantity <= existingProduct.quantity){
                return res.json({message:"out of stock",status:"danger",count:cart.products.length});
            }
              existingProduct.quantity += 1;
          } else {
              // Add a new product to the cart
          cart.products.push({ product: productId, quantity: 1 });
          }
          await cart.save();
          
          res.json({ message: "Product Added to Cart", count: cart.products.length, status: "success" });

      // Send a success response if needed
      }

  } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
  }
});

const removeProduct =asynchandler(async(req,res) => {
  const productId=req.params.id;
  const userId=req.user.id;

  try {
    const cart= await Cart.findOne({user:userId});
    if(cart){
      cart.products=cart.products.filter((product)=>product.product.toString()!==productId);
      
      await cart.save();
    }
    req.flash('success','item removed from cart')
    res.redirect('back');
    
  } catch (error) {
    throw new Error(error);
  }
})


//------------------------increment the quantity of cart----------------------------


const incQuantity=asynchandler(async(req,res)=>{
  try {
    
    const productId=req.params.id;
    const userId=req.user._id;
    await incrementQuantity(userId,productId,res);
  } catch (error) {
    throw new Error(error);
  }
})

//-------------decrerment quantity of product-----------------------

const decQuantity=asynchandler(async(req,res)=>{
  try {
    const productId=req.params.id;
    const userId=req.user._id;
    await decrementQuantity(userId,productId,res)
  } catch (error) {
    throw new Error(error);
  }
})


const getCartCount = asynchandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const userCart = await Cart.findOne({ user: userId });
    let count =0

    userCart.products.forEach(product=>{
      count+=product.quantity
    })
    // Return the count as JSON response
    res.json({ count });
  } catch (error) {
throw new Error(error);
  }
});

const checkProductAvailability = asynchandler(async (req, res) => { 
  try {
   
    const userId = req.user._id;
    const user = await Cart.findOne({user:userId}).populate('products').exec(); // Populate the product details
   for (const product of user.products) {
     const productId = product.product._id;
     const products = await Product.findById(productId);
     const quantity = products.quantity - product.quantity;
     if (quantity < 0) {
       return res.json({
         
         status: "danger",
      
       });
     }
    }
    res.json({
      
      status: "success",
    });
  } catch (error) {
    throw new Error(error)
  }
})


module.exports = {
  loadCart,
  addToCart,
  removeProduct,
  incQuantity,
  decQuantity,
  getCartCount,
  checkProductAvailability
};

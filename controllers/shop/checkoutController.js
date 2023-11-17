const Cart = require("../../models/cartModel");
const Product = require("../../models/productModel");
const User = require("../../models/userModels");
const Order=require("../../models/orderModel")
const OrderItems=require("../../models/orderItemsModel")
const asynchandler = require("express-async-handler");
const checkoutHelper = require("../../helpers/checkoutHelpers");
const { calculateCartTotals } = require("../../helpers/cartHelpers");
const { checkout } = require("../../routes/adminRoute");

const cartPage = asynchandler(async (req, res) => {
  try {
    const userid = req.user._id;
    const user = await User.findById(userid).populate("addresses");
    cartItems = await checkoutHelper.getCartItems(userid);
    const cartData = await Cart.findOne({ user: userid });

    if (cartItems) {
      console.log(cartItems.products);
      const { subtotal, total } = calculateCartTotals(cartItems.products);
      res.render("./user/pages/checkout", {
        title: "WATCHBOX",
        address: user.addresses,
        product: cartItems.products,
        total,
        subtotal,
        cartData,
      });
    }
  } catch (error) {
    throw new Error(error);
  }
});

/**
 * Get Cart Data
 */
const getCartData = asynchandler(async (req, res) => {
  try {
      const userId = req.user._id;
   
      const cartData = await Cart.findOne({ user: userId });
      console.log("in get cart data");
      
      res.json(cartData);
  } catch (error) {
      throw new Error(error);
  }
});

const placeOrder=asynchandler(async (req, res) => {
  try {
    console.log('reached in place order');
    const userId=req.user._id
    const {addressId,payment_method}=req.body;
    const newOrder = await checkoutHelper.placeOrder(userId,addressId,payment_method) 
   
    if(payment_method==="cash_on_delivery"){
      console.log('in cash on delivery');
      res.status(200).json({
        message:"order placed successfully",
        orderId:newOrder._id
      })
    }else {
      res.status(400).json({ message: "Invalid payment method" });
  }
    
  } catch (error) {
    throw new Error(error)
  }
})

//-------------------------order place------------------------------

const orderPlaced=asynchandler(async(req,res)=>{
  try {
    const orderId=req.params.id
    const userId = req.user._id;
    const order = await Order.findById(orderId).populate({
      path: "orderItems",
      populate: {
          path: "product",
      },
  });
  const cartItems=await checkoutHelper.getCartItems(req.user._id);
  console.log(cartItems);
  if(order.payment_method==="cash_on_delivery"){
    for(const item of order.orderItems){
     item.isPaid="cod";
     await item.save()
    }
  }
  if(cartItems){
    for (const cartItem of cartItems.products){
      const updateProduct = await Product.findById(cartItem.product._id);
      updateProduct.quantity -= cartItem.quantity;
      updateProduct.sold += cartItem.quantity;
      await updateProduct.save();
      await Cart.findOneAndDelete({ user: req.user._id });
    }
  }

  res.render('./user/pages/orderPlaced',{title:"WATCHBOX",order})
  } catch (error) {
    throw new Error(error)
  }
})

module.exports = {
  cartPage,
  getCartData,
placeOrder,
orderPlaced
};

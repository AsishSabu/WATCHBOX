const asyncHandler = require("express-async-handler");
const Address = require("../models/addressModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const OrderItems=require("../models/orderItemsModel");
const Order=require("../models/orderModel");
const {generateUniqueOrderID}=require("../utils/genreateOrderId")




exports.getCartItems=asyncHandler(async(userId)=>{
    try {
        return await Cart.findOne({user:userId}).populate("products.product")
    } catch (error) {
        throw new Error(error)
    }
})

//----------------------place an order-------------------------

exports.placeOrder=asyncHandler(async(userId,addressId,paymentMethod)=>{
    const cartItems= await exports.getCartItems(userId);
   
    if(!cartItems && cartItems.length){
        throw new Error('cart not found or empty');
    }

    const orders=[];
    let total=0;

    for(const cartItem of cartItems.products){
        const productTotal=parseFloat(cartItem.product.salePrice)*cartItem.quantity;
        total+=productTotal;
    
        const item = await OrderItems.create({
            quantity: cartItem.quantity,
            price: cartItem.product.salePrice,
            product: cartItem.product._id,
        });
       
        orders.push(item);
       
    }



    const address=await Address.findById(addressId);
    

    const existingOrdersIds= await Order.find().select("orderId");
  

    

    const newOrder = await Order.create({
        orderId: "OD" + generateUniqueOrderID(existingOrdersIds),
        orderItems: orders,
        shippingAddress: { name: address.name, address: address.address },
        state: address.state,
        town: address.town,
        postcode: address.postcode,
        phone: address.mobile,
        totalPrice: total.toFixed(2), // Ensure that totalPrice is of the correct data type
        user: userId,
        payment_method: paymentMethod,
      });
      

    return newOrder;
});


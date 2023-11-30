const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const User = require("../models/userModels");
const expressAsyncHandler = require("express-async-handler");
const OrderItem = require("../models/orderItemsModel");
const { status } = require("../utils/status");
const { ReturnOrder } = require("../controllers/shop/orderControllers");


exports.handleCancelledOrder = expressAsyncHandler(async (product) => {
  console.log(product.status);
  if (product.isPaid !== "pending") {
   
   
    const product = await Product.findById(order);
    console.log(product);
    
    // product.sold -= order.quantity;
    // product.quantity += order.quantity;
    // await product.save();
  }else{
    const quantity=product.quantity
    product.product.quantity+=quantity
    product.product.sold-=quantity
    product.status=status.cancelled
    await product.save()
    
    
    
  }

  return product
});

exports.getSingleOrder = expressAsyncHandler(async (orderId) => {
  console.log(orderId);
  const order = await Order.findOne({_id: orderId,
  })
    .populate({
      path: "orderItems.product",
      model:'Product',
      populate: { path: "images" },
    })
    .select("orderId orderItems orderedDate shippingAddress town createdAt") 
    .sort({
      createdAt: 1,
    });

return  order;
});



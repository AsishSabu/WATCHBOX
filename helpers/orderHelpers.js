const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const User = require("../models/userModels");
const expressAsyncHandler = require("express-async-handler");
const OrderItem = require("../models/orderItemsModel");
const { status } = require("../utils/status");

exports.getOrders = expressAsyncHandler(async (userId) => {
  const orders = await Order.find({ user: userId })
    .populate({
      path: "orderItems",
      select: "product status _id",
      populate: {
        path: "product",
        select: "title images",
        populate: {
          path: "images",
        },
      },
    })
    .select("orderId orderedDate shippingAddress town")
    .sort({
      orderedDate: -1,
    });

  return orders;
});

exports.handleCancelledOrder = expressAsyncHandler(async (order) => {
  if (order.isPaid !== "pending") {
    const product = await Product.findById(order.product);
    product.sold -= order.quantity;
    product.quantity += order.quantity;
    await product.save();
  }

  const orders = await Order.findOne({ orderItems: order._id });
});

exports.getSingleOrder = expressAsyncHandler(async (orderId) => {
  const order = await OrderItem.findById(orderId)
    .populate({
      path: "product",
      model: "Product",
      populate: {
        path: "images",
        model: "Images",
      },
    })
    .sort({
      createdAt: 1,
    });

  const orders = await Order.findOne({ orderItems: orderId }).select(
    "shippingAddress town orderedDate"
  );

  return { order, orders };
});

//---------------------cancel order------------------------

exports.cancelOrderByProductId = expressAsyncHandler(
  async (orderItemId, userId) => {
    try {
      const updatedOrder = await OrderItem.findByIdAndUpdate(orderItemId, {
        status: status.cancelled,
      });

      const product = updatedOrder.product._id;

      const cancelledProduct = await Product.findById(product);

      cancelledProduct.quantity += updatedOrder.quantity;
      cancelledProduct.sold -= updatedOrder.quantity;
      await cancelledProduct.save();

      return "redirectBack";
    } catch (error) {
      throw new Error(error);
    }

    // if (order.orderItems.every((item) => item.status === status.cancelled)) {
    //   return { message: "Order is already cancelled." };

    // } else if (order.payment_method === "cash_on_delivery") {

    //   // Update product quantities and sold counts for each order item
    //   for (const item of order.orderItems) {

    //     await OrderItem.findByIdAndUpdate(item._id, {
    //       status: status.cancelled,
    //     });

    //     const cancelledProduct = await Product.findById(item.product);
    //     cancelledProduct.quantity += item.quantity;
    //     cancelledProduct.sold -= item.quantity;
    //     await cancelledProduct.save();
    //   }

    //   // Update the order status
    //   order.status = status.cancelled;
    //   await order.save();

    //   return "redirectBack";
    // }
  }
);


//----------return order function-----------------------------


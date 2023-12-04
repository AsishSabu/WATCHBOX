const Cart = require("../../models/cartModel");
const Product = require("../../models/productModel");
const User = require("../../models/userModels");

const asynchandler = require("express-async-handler");
const Orders = require("../../models/orderModel");
const orderHelpers = require("../../helpers/orderHelpers");
const {status} = require("../../utils/status");

const orderPage = asynchandler(async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    const orders = await Orders.find({ user: userId })
      .populate({
        path: "orderItems.product",
        select: "title images",
        populate: { path: "images" },
      })
      .select("orderId orderItems orderedDate shippingAddress town");

    res.render("./user/pages/orders", { title: "WATCHBOX", orders, user });
  } catch (error) {
    throw new Error(error.message);
  }
});

//-----------------view single order ----------------

const viewOrder = asynchandler(async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user._id;
    const productId = req.body.productId;

    const order = await orderHelpers.getSingleOrder(orderId);
    const productIdString = String(productId); //finding matching productId from orderDb
    const productItem = order.orderItems.find(
      (item) => String(item.product._id) === productIdString
    );

    if (productItem) {
      const product = productItem.product;
      const quantity = productItem.quantity;
      const price = productItem.price;
      const status = productItem.status;
      res.render("./user/pages/viewOrder", {
        title: "WATCHBOX",
        order,
        product,
        quantity,
        price,
        status,
      });
    } else {
      res.send("error in view order");
    }
  } catch (error) {
    throw new Error(error.message);
  }
});

const cancelOrder = asynchandler(async (req, res) => {
  try {
    const orderId = req.params.id;
    const productId = req.body.productId;
    const order = await orderHelpers.getSingleOrder(orderId);
    const productIdString = String(productId); //finding matching productId from orderDb
    const productItem = order.orderItems.find(
      (item) => String(item.product._id) === productIdString
    );
    if (!productItem) {
      console.log("no product find to cancel");
    } else {
      productItem.status =status.cancelPending;
    //   const incQuantity = productItem.quantity;

    //   await Product.findByIdAndUpdate(productId, {
    //     $inc: { quantity: incQuantity, sold: -incQuantity },
    //   });
      await order.save();
    //   console.log(productItem);
      return res.redirect(`/order`);
    }
  } catch (error) {
    throw new Error(error);
  }
});

//---------------------order returning-----------------------------------------------

const ReturnOrder = asynchandler(async (req, res) => {
  try {
    const orderId = req.params.id;
    const productId = req.body.productId;
    const order = await orderHelpers.getSingleOrder(orderId);
    const productIdString = String(productId); //finding matching productId from orderDb
    const productItem = order.orderItems.find(
      (item) => String(item.product._id) === productIdString
    );
    if (!productItem) {
      console.log("no product find to cancel");
    } else {
      productItem.status =status.returnPending;
  
      await order.save();
  
      return res.redirect(`/order`);
    }
   
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  orderPage,
  viewOrder,
  cancelOrder,
  ReturnOrder,
};

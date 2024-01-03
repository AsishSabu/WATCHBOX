const expressHandler = require("express-async-handler");
const Order = require("../../models/orderModel");
const orderHelpers = require("../../helpers/orderHelpers");
const { status } = require("../../utils/status");
const AdminOrderHelpers = require("../../helpers/adminOrderHelpers.js");

const orderPage = expressHandler(async (req, res) => {
  try {
    const orders = await Order.find()
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
      .select(
        "orderId orderedDate shippingAddress city zip totalPrice payment_method"
      )
      .sort({ _id: -1 });

    res.render("admin/pages/orders", { title: "WATCHBOX", orders });
  } catch (error) {
    throw new Error(error);
  }
});

//-----------------------------taking the order details-----------------------------

const orderDetails = expressHandler(async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findOne({ orderId: orderId })
      .populate({
        path: "orderItems",
        modal: "OrderItems",
        populate: {
          path: "product",
          modal: "Product",
          populate: {
            path: "images",
            modal: "Images",
          },
        },
      })
      .populate({
        path: "user",
        modal: "User",
      });
    res.render("admin/pages/orderDetails", { title: "WATCHBOX", order });
  } catch (error) {
    throw new Error(error);
  }
});

//--------------------change order status--------------------

const orderStatus = expressHandler(async (req, res) => {
  const productId = req.params.id;
  const orderId = req.body.orderId;

  const newStatus = req.body.status;

  const order = await Order.findOne({ orderId })
    .populate({
      path: "orderItems.product",
      model: "Product",
      populate: { path: "images" },
    })
    .select(
      "orderId orderItems orderedDate shippingAddress town createdAt coupon discount totalPrice paidAmount"
    )
    .populate({
      path: "user",
      modal: "User",
    });
  if (!order) {
    return res.status(404).send("Order not found");
  } else {
    const productItem = order.orderItems.id(productId);

    if (
      req.body.status === status.shipped ||
      req.body.status === status.delivered
    ) {
      if (req.body.status === status.shipped) {
        productItem.status = newStatus;
        productItem.shippedDate = Date.now();
      } else if (req.body.status === status.delivered) {
        productItem.status = newStatus;
        productItem.deliveryDate = Date.now();
      }
      await order.save();
    } else if (req.body.status === status.cancelled) {
      await AdminOrderHelpers.handleCancelledOrder(productItem, order);
    }

    if (req.body.status === status.returnPending) {
      await AdminOrderHelpers.handleReturnedOrder(productItem, order);
    }
    await order.save();
    res.redirect("back");
  }
});

module.exports = {
  orderPage,
  orderDetails,
  orderStatus,
};

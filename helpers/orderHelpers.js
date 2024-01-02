const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const User = require("../models/userModels");
const expressAsyncHandler = require("express-async-handler");
const { status } = require("../utils/status");
const { ReturnOrder } = require("../controllers/shop/orderControllers");



exports.getSingleOrder = expressAsyncHandler(async (orderId) => {
  console.log(orderId);
  const order = await Order.findOne({_id: orderId,
  })
    .populate({
      path: "orderItems.product",
      model:'Product',
      populate: { path: "images" },
    })
    .select("orderId orderItems orderedDate shippingAddress town createdAt payment_method") 
    .sort({
      createdAt: 1,
    });

return  order;
});

exports.generateInvoice = expressAsyncHandler(async (orderId, productId) => {
  console.log("in generating invoice");
 
    const order = await Order.findOne({_id: orderId,
  })
    .populate({
      path: "orderItems.product",
      model:'Product',
      populate: { path: "images" },
    })
   
  console.log(order);
  const productItem = order.orderItems.id(productId);
console.log(productItem);
  const data = {
    content: [
      {
        text: "INVOICE",
        style: "header",
        alignment: "center",
        margin: [0, 0, 0, 20],
      },
      {
        columns: [
          {
            width: "*",
            stack: [
              { text: `Order Date: ${order.orderedDate.toLocaleDateString()}` },
              { text: `Order ID: ${order.orderId}` },
            ],
          },
          {
            width: "*",
            stack: [
              { text: `Delivered Date: ${productItem.deliveryDate.toLocaleDateString()}`, alignment: "right" },
            ],
          },
        ],
      },
      {
        columns: [
          {
            width: "*",
            text: [
              { text: "Billing Address:", style: "subheader" },
              {
                text: [
                  ` \n${order.shippingAddress.address}`,
                  order.town,
                  order.state,
                  order.postcode,
                  order.phone,
                ].join("\n"),
                style: "address",
              },
            ],
          },
          {
            width: "*",
            text: [
              { text: "Payment Information:", style: "subheader" },
              `\nPayment Method: ${order.payment_method}\nPayment Status: ${productItem.isPaid}`,
            ],
          },
        ],
        margin: [0, 20, 0, 10],
      },
      { text: "Order Summary:", style: "subheader", margin: [0, 20, 0, 10] },
      {
        table: {
          body: [
            [
              { text: "Product", style: "tableHeader" },
              { text: "Quantity", style: "tableHeader" },
              { text: "Price", style: "tableHeader" },
            ],
            [
              productItem.product.title,
              productItem.quantity,
              { text: `₹${parseFloat(productItem.price).toFixed(2)}`, alignment: "right" },
            ],
            ["Subtotal", "", { text: `₹${parseFloat(productItem.price * productItem.quantity).toFixed(2)}`, alignment: "right" }],
            ["Total", "", { text: `₹${parseFloat(productItem.price * productItem.quantity).toFixed(2)}`, alignment: "right" }],
          ],
        },
      },
      { text: "Thank you for shopping with us!", style: "thankYou", alignment: "center", margin: [0, 20, 0, 0] },
    ],
    styles: {
      header: {
        fontSize: 24,
        bold: true,
        decoration: "underline",
      },
      subheader: {
        fontSize: 16,
        bold: true,
      },
      address: {
        fontSize: 14,
      },
      info: {
        fontSize: 14,
      },
      tableHeader: {
        fillColor: "#337ab7",
        color: "#ffffff",
        alignment: "center",
        bold: true,
      },
      tableCell: {
        fillColor: "#f2f2f2",
        alignment: "center",
      },
      thankYou: {
        fontSize: 16,
        italic: true,
      },
    },
  };


  return data;
})




const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    requried: true,
  },
  orderItems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderItem",
      required: true,
    },
  ],
  shippingAddress: {
    name: {
      type: String,
      required: true,
    },
    address: { type: String, required: true },
  },
  state: {
    type: String,
    required: true,
  },
  town: {
    type: String,
    required: true,
  },
  postcode: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
  },
  totalPrice: {
    type: Number,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  orderedDate: {
    type: Date,
    default: Date.now(),
  },
  shippedDate: {
    type: Date,
  },
  deliveredDate: {
    type: Date,
  },
  payment_method: {
    type: String,
    required: true,
  },
 
  paidAmount: {
      type: Number,
      defualt: 0,
  },
});

module.exports = mongoose.model("Order", orderSchema);

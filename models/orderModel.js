const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
  },
  orderItems: [
    {
      quantity: {
        type: Number,
        required: true,
      },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      price: {
        type: Number,
        required: true,
      },
      status: {
        type: String,

        default: "Pending",
        required: true,
      },
      isPaid: {
        type: String,
        enum: ["paid", "cod", "pending"],
        default: "pending",
        required: true,
      },
      shippedDate: {
        type: Date,
      },
      deliveryDate: {
        type: Date,
      },
      createdAt: {
        type: Date,
        default: Date.now(),
      },
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
  
  payment_method: {
    type: String,
    required: true,
  },
  wallet: {
    type: Number,
    default: 0,
  },
  coupon: {
    type: Object,
  },
  discount: {
    type: Number,
  },


  paidAmount: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Order", orderSchema);

// const mongoose = require("mongoose");

// const orderItemSchema = new mongoose.Schema({
//   quantity: {
//     type: Number,
//     required: true,
//   },
//   product: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Product",
//   },
//   price: {
//     type: String,
//     required: true,
//   },
//   status: {
//     type: String,
//     required:true,
//     default: "Pending",
    
//   },
//   isPaid: {
//     type: String,
//     enum: ["paid", "cod", "pending"],
//     default: "pending",
//     required: true,
// },
//   shippedDate: {
//     type: Date,
//   },
//   deliveryDate: {
//     type: Date,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now(),
//   },
//   orderId:{
//     type: String,
//   }
// });

// module.exports = mongoose.model("OrderItem", orderItemSchema);

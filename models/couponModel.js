const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  isListed: {
    type: Boolean,
    default: true
  },
  usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  expiryDate: Date,
  minAmount: Number,
  maxAmount: Number,
});

module.exports = mongoose.model("Coupon", couponSchema);

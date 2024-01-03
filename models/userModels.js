const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    salt: String,
    isBlock: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    referralCode: {
      type: String,
      
    },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    cart: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cart",
      },
    ],
    wallet: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet" },
    addresses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
      },
    ],
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isNew) {
    const salt = bcrypt.genSaltSync(10);
    console.log(this.password);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

userSchema.methods.isPasswordMatched = async function (enteredPassword) {
  console.log(enteredPassword);
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.createResetPasswordToken = async function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetTokenExpires = Date.now() + 1 * 60 * 1000;
  console.log(resetToken, this.passwordResetTokenExpires);
  return resetToken;
};
const User = mongoose.model("User", userSchema);
module.exports = User;

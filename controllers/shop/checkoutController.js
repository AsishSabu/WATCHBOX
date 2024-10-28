const Cart = require("../../models/cartModel");
const Product = require("../../models/productModel");
const User = require("../../models/userModels");
const Order = require("../../models/orderModel");
const asynchandler = require("express-async-handler");
const checkoutHelper = require("../../helpers/checkoutHelpers");
const { calculateCartTotals } = require("../../helpers/cartHelpers");
const { checkout } = require("../../routes/adminRoute");
const Razorpay = require("razorpay");
const { generateRazorPay } = require("../../config/razorpay");
const Wallet = require("../../models/walletModel");
const WalletTransaction = require("../../models/transactionModel");
const Coupon = require("../../models/couponModel")
const moment =require("moment");

const checkoutPage = asynchandler(async (req, res) => {
  try {
    const userid = req.user._id;
    const user = await User.findById(userid).populate("addresses");
    const cartItems = await checkoutHelper.getCartItems(userid);
    const cartData = await Cart.findOne({ user: userid });
    const wallet = await Wallet.findOne({ user: userid });

    const availableCoupons = await Coupon.aggregate([
      {
        $match: {
          usedBy: [],
          isListed: true,
          expiryDate: { $gte: new Date() } // Use new Date() instead of Date.now
        }
      }
    ]);
       const coupons = availableCoupons
         .map((coupon) => coupon.code)
         .join(" | ");
       const couponMessage = {
         status: "text-info",
         message: "Try these coupons --" + coupons,
       };
    


    if (cartItems) {
      const { subtotal, total } = calculateCartTotals(cartItems.products);
      res.render("./user/pages/checkout", {
        title: "WATCHBOX/CHECKOUT",
        address: user.addresses,
        product: cartItems.products,
        total,
        subtotal,
        cartData,
        wallet,
        couponMessage,
        availableCoupons
      });
    }
  } catch (error) {
    throw new Error(error);
  }
});

/**
 * Get Cart Data
 */
const getCartData = asynchandler(async (req, res) => {
  try {
    const userId = req.user._id;

    const cartData = await Cart.findOne({ user: userId });
    res.json(cartData);
  } catch (error) {
    throw new Error(error);
  }
});

const placeOrder = asynchandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { addressId, payment_method, isWallet } = req.body;
    const userWithCart = await User.findById(userId).populate('cart.product');
    const coupon = (await Coupon.findOne({ code: req?.session?.coupon?.code, expiryDate: { $gt: Date.now() } })) || null;
    const newOrder = await checkoutHelper.placeOrder(
      userId,
      addressId,
      payment_method,
      isWallet,
      coupon
    );
    if (payment_method === "cash_on_delivery") {
      res.status(200).json({
        message: "Order placed successfully",
        orderId: newOrder._id,
      });
    } else if (payment_method === "online_payment") {
      const wallet = await Wallet.findOne({ user: userId });
      const user = await User.findById(req.user._id);
      let totalAmount = newOrder.totalPrice;

      if (isWallet) {
        totalAmount -= wallet.balance;
        newOrder.paidAmount = totalAmount;
        newOrder.wallet = wallet.balance;
        // Create a new wallet transaction
        const walletTransaction = await WalletTransaction.create({
          wallet: wallet._id,
          event: "Order Placed",
          orderId: newOrder.orderId,
          amount: newOrder.wallet,
          type: "debit",
        });

        // Associate the wallet transaction with the wallet
        wallet.transactions.push(walletTransaction._id);
        await wallet.save();
      } else {
        // If not using wallet, update paid amount and save order
        newOrder.paidAmount = totalAmount;
      }

      // Save the new order
      await newOrder.save();

      // Create Razorpay order
      var instance = new Razorpay({
        key_id: process.env.RAZORPAY_ID_KEY,
        key_secret: process.env.RAZORPAY_SECRET_KEY,
      });
      const rzp_order = instance.orders.create(
        {
          amount: totalAmount * 100,
          currency: "INR",
          receipt: newOrder.orderId,
        },
        (err, order) => {
          if (err) {
            res.status(500).json(err);
          }

          res.status(200).json({
            message: "Order placed successfully",
            rzp_order,
            order,
            user,
            walletAmount: wallet?.balance,
            orderId: newOrder._id,
          });
        }
      );
    } else if (payment_method === "wallet_payment") {
      try {
        const wallet = await Wallet.findOne({ user: userId });
        // Create a new wallet transaction
        const walletTransaction = await WalletTransaction.create({
          wallet: wallet._id,
          event: "Order Placed",
          orderId: newOrder.orderId,
          amount: newOrder.totalPrice,
          type: "debit",
        });
        // Associate the wallet transaction with the wallet
        wallet.transactions.push(walletTransaction._id);
        await wallet.save();

        // Save the new order
        newOrder.wallet = newOrder.totalPrice;
        await newOrder.save();

        res.status(200).json({
          message: "Order placed successfully",
          orderId: newOrder._id,
        });
      } catch (error) {
       throw new Error(error);
      }
    } else {
      res.status(400).json({ message: "Invalid payment method" });
    }
  } catch (error) {
    throw new Error(error);
  }
});

//-------------------------order place------------------------------

const orderPlaced = asynchandler(async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user._id;
    const coupon = (await Coupon.findOne({ code: req?.session?.coupon?.code })) || null;
    const order = await Order.findById(orderId).populate({
      path: "orderItems",
      populate: {
        path: "product",
      },
    });

    console.log(order,"................");
    
    const cartItems = await checkoutHelper.getCartItems(req.user._id);
    if (order.payment_method === "cash_on_delivery") {
      for (const item of order.orderItems) {
        item.isPaid = "cod";
        await order.save();
        if (coupon) {
          coupon.usedBy.push(userId);
          await coupon.save();
        }
      }
    } else if (order.payment_method === "online_payment") {
      for (const item of order.orderItems) {
        item.isPaid = "paid";
        await order.save();
      }
      if (coupon) {
        coupon.usedBy.push(userId);
        await coupon.save();
      }

      const wallet = await Wallet.findOne({ user: req.user._id });
      wallet.balance -= order.wallet;
      await wallet.save();
    } else if (order.payment_method === "wallet_payment") {
      for (const item of order.orderItems) {
        item.isPaid = "paid";
        await order.save();
      }
      if (coupon) {
        coupon.usedBy.push(userId);
        await coupon.save();
      }
      const wallet = await Wallet.findOne({ user: req.user._id });

      wallet.balance -= order.wallet;
      await wallet.save();
    }
    if (cartItems) {
      for (const cartItem of cartItems.products) {
        const updateProduct = await Product.findById(cartItem.product._id);
        updateProduct.quantity -= cartItem.quantity;
        updateProduct.sold += cartItem.quantity;
        await updateProduct.save();
        await Cart.findOneAndDelete({ user: req.user._id });
      }
    }
    req.session.coupon = null;

    res.render("./user/pages/orderPlaced", { title: "WATCHBOX", order,  moment});
  } catch (error) {
    throw new Error(error);
  }
});

//---------------------------------verify payment----------------------------------

const verifyPayment = asynchandler(async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      orderId,
      walletAmount,
      userId,
    } = req.body;
    const result = await checkoutHelper.verifyPayment(
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      orderId
    );

    if (result) {
      const wallet = await Wallet.findOneAndUpdate(
        { user: userId },
        {
          balance: walletAmount,
        }
      );
    }

    res.json(result);
  } catch (error) {
    throw new Error(error);
  }
});

const updatePage = asynchandler(async (req, res) => {
  try {
    const userid = req.user._id;
    const coupon = (await Coupon.findOne({ code: req.body.code, expiryDate: { $gt: Date.now() } })) || null;
    const user = await User.findById(userid).populate("addresses");
    const cartItems = await checkoutHelper.getCartItems(userid);
    const { subtotal, total, usedFromWallet, walletBalance,discount } =
      await checkoutHelper.calculateTotalPrice(
        cartItems,
        userid,
        req.body.payWithWallet,
        coupon
      );
    res.json({ total, subtotal, usedFromWallet, walletBalance,discount });
  } catch (error) {
    throw new Error(error);
  }
});


const updateCoupon = asynchandler(async (req, res) => {
  try {
    const userid = req.user._id;
    const coupon = await Coupon.findOne({
      code: req.body.code,
      expiryDate: { $gt: Date.now() },
    });

    const cartItems = await checkoutHelper.getCartItems(userid);
    const availableCoupons = await Coupon.find({
      expiryDate: { $gt: Date.now() },
      usedBy: { $nin: [userid] },
    })
      .select({ code: 1, _id: 0 })
      .limit(4);
    const { subtotal, total, discount } = await checkoutHelper.calculateTotalPrice(cartItems, userid, false, coupon);

    if (!coupon) {
      if (req.body.data === "onLoad" || req.body.data === "onUpdate") {
        const coupons = availableCoupons.map((coupon) => coupon.code).join(" | ");
        res.status(202).json({
          status: "info",
          message: "Try " + coupons,
          subtotal,
          total,
          discount,
        });
      } else {
        res.status(202).json({
          status: "danger",
          message: "The coupon is invalid or expired.",
          subtotal,
          total,
          discount,
        });
      }
    } else {
      if (coupon.usedBy.includes(userid)) {
        res.status(202).json({
          status: "danger",
          message: "The coupon is already used",
        });
      } else if (subtotal < coupon.minAmount) {
        res.status(200).json({
          status: "danger",
          message: `You need to spend at least ${coupon.minAmount} to get this offer.`,
        });
      } else if (subtotal > coupon.maxAmount) {
        res.status(200).json({
          status: "danger",
          message: `this coupon is only applicable for maximum Amount ${coupon.maxAmount} .`,
        });
      } else {
        req.session.coupon = coupon;
        res.status(200).json({
          status: "success",
          message: `${coupon.code} applied`,
          coupon: coupon,
          subtotal,
          total,
          discount,
        });
      }
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
});

const removeAppliedCoupon = asynchandler(async (req, res) => {
  req.session.coupon = null;
  res.status(200).json("Ok");
});


module.exports = {
  checkoutPage,
  getCartData,
  placeOrder,
  orderPlaced,
  verifyPayment,
  updatePage,
  updateCoupon,
  removeAppliedCoupon
};

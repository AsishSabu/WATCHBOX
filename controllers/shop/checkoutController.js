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

const cartPage = asynchandler(async (req, res) => {
  try {
    const userid = req.user._id;
    const user = await User.findById(userid).populate("addresses");
    const cartItems = await checkoutHelper.getCartItems(userid);
    const cartData = await Cart.findOne({ user: userid });
    const wallet = await Wallet.findOne({ user: userid });

    if (cartItems) {
      console.log(cartItems.products);
      const { subtotal, total } = calculateCartTotals(cartItems.products);
      res.render("./user/pages/checkout", {
        title: "WATCHBOX",
        address: user.addresses,
        product: cartItems.products,
        total,
        subtotal,
        cartData,
        wallet,
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
    console.log(" cart data", cartData);

    res.json(cartData);
  } catch (error) {
    throw new Error(error);
  }
});

const placeOrder = asynchandler(async (req, res) => {
  try {
    console.log("reached in place order");
    const userId = req.user._id;
    const { addressId, payment_method, isWallet } = req.body;
    console.log(req.body);
    const newOrder = await checkoutHelper.placeOrder(
      userId,
      addressId,
      payment_method,
      isWallet
    );

    if (payment_method === "cash_on_delivery") {
      res.status(200).json({
        message: "Order placed successfully",
        orderId: newOrder._id,
      });
    } else if (payment_method === "online_payment") {
      console.log("in online payment ");
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
        console.log("hi am in wallet");
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
        console.log("neworder", newOrder);

        res.status(200).json({
          message: "Order placed successfully",
          orderId: newOrder._id,
        });
      } catch (error) {
        console.error("Error processing wallet payment:", error);
        // Handle error appropriately
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
    console.log("in order placed");
    const orderId = req.params.id;
    const userId = req.user._id;
    const order = await Order.findById(orderId).populate({
      path: "orderItems",
      populate: {
        path: "product",
      },
    });
    const cartItems = await checkoutHelper.getCartItems(req.user._id);
    console.log(order);
    if (order.payment_method === "cash_on_delivery") {
      for (const item of order.orderItems) {
        item.isPaid = "cod";
        await order.save();
        console.log("After update:", item.isPaid);
      }
    } else if (order.payment_method === "online_payment") {
      console.log("in order placed online payment");
      for (const item of order.orderItems) {
        console.log(item);
        item.isPaid = "paid";
        await order.save();
        console.log("After update:", item.isPaid);
        console.log(order);
      }

      const wallet = await Wallet.findOne({ user: req.user._id });
      wallet.balance -= order.wallet;
      await wallet.save();
    } else if (order.payment_method === "wallet_payment") {
      for (const item of order.orderItems) {
        item.isPaid = "paid";
        await order.save();
        console.log("After update:", item.isPaid);
        console.log(order);
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

    res.render("./user/pages/orderPlaced", { title: "WATCHBOX", order });
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
    console.log(req.body, "...............................");
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
    console.log(userid);
    const user = await User.findById(userid).populate("addresses");
    const cartItems = await checkoutHelper.getCartItems(userid);

    console.log("cartItems", cartItems);
    const { subtotal, total, usedFromWallet, walletBalance } =
      await checkoutHelper.calculateTotalPrice(
        cartItems,
        userid,
        req.body.payWithWallet
      );
    console.log(total, subtotal, usedFromWallet, walletBalance);
    res.json({ total, subtotal, usedFromWallet, walletBalance });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  cartPage,
  getCartData,
  placeOrder,
  orderPlaced,
  verifyPayment,
  updatePage,
};

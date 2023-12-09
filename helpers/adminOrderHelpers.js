const Product = require("../models/productModel");
const user = require("../models/userModels");
const Order = require("../models/orderModel");
const Wallet = require("../models/walletModel");
const walletTransactions = require("../models/transactionModel");
const { status } = require("../utils/status");
const { logger } = require("../config/email");
const { Transaction } = require("mongodb");

exports.handleReturnedOrder = async (product, order) => {
  product.status = status.returned;
  const quantity = product.quantity;
  product.product.quantity += quantity;
  product.product.sold -= quantity;
  const price = product.price*product.quantity;
  await product.save();
  const events="returned"
  await handleReturnAmount(product, price, order,events);

  // const product = await Product.findById(order.product);
  // product.sold -= order.quantity;
  // product.quantity += order.quantity;
  // await product.save();
  // const orders = await Order.findOne({ orderItems: order._id });
  // console.log(orders);
  //  const orderTotal = parseInt(order.price * order.quantity);

  // await handleReturnAmount(order, orders, orderTotal);
};

//---------------------refund----------------------------------------------------------------

async function handleReturnAmount(product, price, order, events) {
  console.log("in handleReturnAmount");
  console.log(product);
  const wallet = await Wallet.findOne({ user: order.user._id });
    console.log(wallet, "wallet");
   

  const walletId = wallet._id;

  const updateWallet = await Wallet.findByIdAndUpdate(walletId, {
    $inc: { balance: price },
  });
  const transaction = await walletTransactions.create({
    wallet: walletId,
    amount: price,
    type: "credit",
    orderId: order.orderId,
    event: events,
  });
  // Associate the wallet transaction with the wallet
  wallet.transactions.push(transaction._id);
    await wallet.save();
    
   

  console.log("Refund completed successfully.");

  //     wallet.balance += orderTotal;
  //     await wallet.save();
  //     await createWalletTransaction(wallet, orderTotal, orders.orderId);
}

//----------cancel orders---------------------------------------------------

exports.handleCancelledOrder = async (product, order) => {
  console.log("......................", product);
  console.log(product.status);
  console.log(product.isPaid);
  console.log(product.product._id);
  const mainProduct = await Product.findById({ _id: product.product._id });
  console.log(mainProduct, "mainProduct");
  if (product.isPaid === "paid") {
      console.log("in cancel paid order");
        const quantity = product.quantity;
        mainProduct.quantity += quantity;
        mainProduct.sold -= quantity;
      await mainProduct.save();
      
        product.status = status.cancelled;
        await product.save();

    const price = product.price*product.quantity;
    const events = "cancelled";
    handleReturnAmount(product, price, order, events);
  } else {
      
      console.log(".......................................");
    const quantity = product.quantity;
    mainProduct.quantity += quantity;
    mainProduct.sold -= quantity;
    await mainProduct.save();
    product.status = status.cancelled;
    await product.save();
  }

  return product;
};

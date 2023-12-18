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

};

//---------------------refund----------------------------------------------------------------

async function handleReturnAmount(product, price, order, events) {
  try {
    console.log("In handleReturnAmount");

    // Initialize the amount to be refunded with the original price
    let amountToBeRefunded = price;

    // Calculate the total order amount based on the returned product's sale price and quantity
    const orderTotal = product.product.salePrice * product.quantity;
    console.log(orderTotal, "Order Total");

    // Check if there is a coupon applied to the order
    if (order.coupon) {
      console.log(orderTotal, "Order Total");

      // Extract information about the applied coupon
      const appliedCoupon = order.coupon;
      console.log(appliedCoupon, "Applied Coupon");

      // Check the type of the applied coupon
      if (appliedCoupon.type === "fixedAmount") {
        // Calculate the percentage of the order total
        const percentage = Math.round((orderTotal / (order.totalPrice + order.discount)) * 100);
        console.log(percentage, "Percentage");

        // Calculate the return amount based on the fixed amount coupon
        const returnAmount = orderTotal - (appliedCoupon.value * percentage) / 100;
        console.log(returnAmount, "Return Amount");

        // Update the amount to be refunded
        amountToBeRefunded = returnAmount;
      } else if (appliedCoupon.type === "percentage") {
        // Calculate the return amount based on the percentage coupon
        const returnAmount = orderTotal - (orderTotal * appliedCoupon.value) / 100;
        console.log(returnAmount, "Return Amount");

        // Update the amount to be refunded
        amountToBeRefunded = returnAmount;
      }

      console.log(amountToBeRefunded, "Amount to be Refunded");
    }

    // Find the user's wallet
    const wallet = await Wallet.findOne({ user: order.user._id });
    console.log(wallet, "Wallet");

    // Retrieve the wallet ID
    const walletId = wallet._id;

    // Update the wallet balance with the refunded amount
    await Wallet.findByIdAndUpdate(walletId, {
      $inc: { balance: amountToBeRefunded },
    });

    // Create a wallet transaction for the refund
    const transaction = await walletTransactions.create({
      wallet: walletId,
      amount: amountToBeRefunded,
      type: "credit",
      orderId: order.orderId,
      event: events,
    });

    // Associate the wallet transaction with the wallet
    wallet.transactions.push(transaction._id);

    // Save the updated wallet
    await wallet.save();

    console.log("Refund completed successfully.");
  } catch (error) {
    console.error("Error processing refund:", error.message);
    // Handle errors appropriately
  }
}


//----------cancel orders---------------------------------------------------


exports.handleCancelledOrder = async (product, order) => {
  try {
    console.log("in handle cancel order");
    console.log(product.status);


    // Find the main product using its ID
    const mainProduct = await Product.findById({ _id: product.product._id });
    console.log(mainProduct, "mainProduct");

    if (product.isPaid === "paid") {
      console.log("In cancel paid order");
      const quantity = product.quantity;

      // Adjust the quantity and sold values for the main product
      mainProduct.quantity += quantity;
      mainProduct.sold -= quantity;

      // Save the updated main product
      await mainProduct.save();

      // Update the status of the current product to "cancelled"
      product.status = status.cancelled;
      await product.save();

      // Calculate the total price of the cancelled product(s)
      const price = product.price * product.quantity;

      // Specify the event for handling the return amount
      const events = "cancelled";

      // Call the handleReturnAmount function to process the return
      await handleReturnAmount(product, price, order, events);
    } else {
      // Adjust the quantity and sold values for the main product
      const quantity = product.quantity;
      mainProduct.quantity += quantity;
      mainProduct.sold -= quantity;

      // Save the updated main product
      await mainProduct.save();

      // Update the status of the current product to "cancelled"
      product.status = status.cancelled;
      await product.save();
    }

    // Return the updated product
    return product;
  } catch (error) {
    console.error("Error handling cancelled order:", error.message);
    // Handle errors appropriately
    throw error; // Re-throw the error to propagate it further if needed
  }
};

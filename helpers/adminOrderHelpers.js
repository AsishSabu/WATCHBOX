const Product=require("../models/productModel");
const user=require("../models/userModels")
const OrderItems=require("../models/orderItemsModel");
const Order=require("../models/orderModel");
const Wallet=require("../models/walletModel")
const walletTransactions=require("../models/transactionModel")
const status=require("../utils/status");
const { logger } = require("../config/email");
const { Transaction } = require("mongodb");

exports.handleReturnedOrder= async (order) => {

    order.status = status.status.returned;
  
    const product = await Product.findById(order.product);
   
    product.sold -= order.quantity;
    product.quantity += order.quantity;
    await product.save();

    const orders = await Order.findOne({ orderItems: order._id });
    console.log(orders);

    const orderTotal = parseInt(order.price * order.quantity);
   
    await handleReturnAmount(order, orders, orderTotal);

    await order.save();
}


//---------------------refund----------------------------------------------------------------


async function handleReturnAmount(order, orders, orderTotal) {
    const wallet = await Wallet.findOne({ user: orders.user });
    
    const walletId=wallet._id;
    
    const updateWallet=await Wallet.findByIdAndUpdate(walletId,{$inc:{balance:order.price}})
    const transaction=new walletTransactions({
        wallet:walletId,
        amount:order.price,
        type:"credit",
        orderId:orders.orderId,
        event:"Return"
    })
   
    const transactionId = await transaction.save();

    await Wallet.findByIdAndUpdate(walletId, {
        $push: { transactions: transactionId },
    });
    console.log('Refund completed successfully.');

       
    //     wallet.balance += orderTotal;
    //     await wallet.save();
    //     await createWalletTransaction(wallet, orderTotal, orders.orderId);
    }

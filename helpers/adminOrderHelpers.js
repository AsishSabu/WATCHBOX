const Product=require("../models/productModel");
const user=require("../models/userModels")
const Order=require("../models/orderModel");
const Wallet=require("../models/walletModel")
const walletTransactions=require("../models/transactionModel")
const {status}=require("../utils/status");
const { logger } = require("../config/email");
const { Transaction } = require("mongodb");

exports.handleReturnedOrder= async (product,order) => {
 
    product.status = status.returned;
    const quantity=product.quantity;
    product.product.quantity+=quantity
    product.product.sold-=quantity
    const price=product.price;
    await product.save();

    await handleReturnAmount(product,price,order)
   
    // const product = await Product.findById(order.product);
    // product.sold -= order.quantity;
    // product.quantity += order.quantity;
    // await product.save();
    // const orders = await Order.findOne({ orderItems: order._id });
    // console.log(orders);
    //  const orderTotal = parseInt(order.price * order.quantity);
   
    // await handleReturnAmount(order, orders, orderTotal);

    
}


//---------------------refund----------------------------------------------------------------


async function handleReturnAmount(product,price,order) {
    console.log("...................................................");
    console.log(product);
    const wallet = await Wallet.findOne({ user:order.user._id });
    console.log(wallet);
    
    const walletId=wallet._id;
   
    
    const updateWallet=await Wallet.findByIdAndUpdate(walletId,{$inc:{balance:price}})
    const transaction=new walletTransactions({
        wallet:walletId,
        amount:price,
        type:"credit",
        orderId:order.orderId,
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


    //----------cancel orders---------------------------------------------------

    
exports.handleCancelledOrder = async (product) => {
    console.log("......................",product);
    console.log(product.status);
    console.log(product.isPaid);
    if (product.isPaid !== "paid") {
        
     
   
    }else{
        console.log('.................');
      const quantity=product.quantity
      product.product.quantity+=quantity
      product.product.sold-=quantity
      product.status=status.cancelled
      await product.save()
      
      
      
    }
  
    return product
  };
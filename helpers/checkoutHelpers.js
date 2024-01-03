const asyncHandler = require("express-async-handler");
const Address = require("../models/addressModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const Order=require("../models/orderModel");
const {generateUniqueOrderID}=require("../utils/genreateOrderId")
const Crypto = require("crypto");
const Wallet=require("../models/walletModel")




exports.getCartItems=asyncHandler(async(userId)=>{
    try {
        return await Cart.findOne({user:userId}).populate("products.product")
    } catch (error) {
        throw new Error(error)
    }
})

//----------------------place an order-------------------------

exports.placeOrder=asyncHandler(async(userId,addressId,paymentMethod,isWallet,coupon)=>{
    const cartItems= await exports.getCartItems(userId);
  
   
    if(!cartItems && cartItems.length){
        throw new Error('cart not found or empty');
    }

    const orders=[];
    let total=0;

    for(const cartItem of cartItems.products){
   
        const productTotal=parseFloat(cartItem.product.salePrice)*cartItem.quantity;
        total+=productTotal;
            const orderItems= {
            quantity: cartItem.quantity,
            price: cartItem.product.salePrice,
            product: cartItem.product._id,
        }
        orders.push(orderItems);
    
    }
    


    let discount;

    if (coupon) {
        if (coupon.type === "percentage") {
            discount = ((total * coupon.value) / 100).toFixed(2);
            if (discount > coupon.maxAmount) {
                discount = coupon.maxAmount;
                total -= discount;
            } else {
                total -= discount;
            }
        } else if (coupon.type === "fixedAmount") {
            discount = coupon.value;
            total -= discount;
        }
    }


    const address=await Address.findById(addressId);
    const existingOrdersIds= await Order.find().select("orderId");
    const newOrder = await Order.create({
        orderId: "OD" + generateUniqueOrderID(existingOrdersIds),
        orderItems: orders,
        shippingAddress: { name: address.name, address: address.address },
        state: address.state,
        town: address.town,
        postcode: address.postcode,
        phone: address.mobile,
        totalPrice: total.toFixed(2), // Ensure that totalPrice is of the correct data type
        user: userId,
        discount: discount,
        coupon: coupon ?? coupon,
        payment_method: paymentMethod,
    });
    
    return newOrder;
});


exports.calculateTotalPrice = asyncHandler(async (cartItems, userid, payWithWallet,coupon) => {

  
    const wallet = await Wallet.findOne({ user: userid });
    let subtotal = 0;
    for (const product of cartItems.products) {
        const productTotal = parseFloat(product.product.salePrice) * product.quantity;
        subtotal += productTotal;
    }
    let total;
    let usedFromWallet = 0;
    if (wallet && payWithWallet) {
        let discount = 0;
        total = subtotal;
        if (coupon) {
            if (coupon.type === "percentage") {
                discount = ((total * coupon.value) / 100).toFixed(2);
                if (discount > coupon.maxAmount) {
                    discount = coupon.maxAmount;
                    total -= discount;
                } else {
                    total -= discount;
                }
            } else if (coupon.type === "fixedAmount") {
                discount = coupon.value;
                total -= discount;
            }
        }

        if (total <= wallet.balance) {
            usedFromWallet = total;
            wallet.balance -= total;
            total = 0;
        } else {
            usedFromWallet = wallet.balance;
            total = subtotal - wallet.balance-discount;
            wallet.balance = 0;
        }
        return { subtotal, total, usedFromWallet, walletBalance: wallet.balance, discount: discount ? discount : 0 };
    } else {
        total = subtotal;
        let discount = 0;
        if (coupon) {
            if (coupon.type === "percentage") {
                discount = ((total * coupon.value) / 100).toFixed(2);
                if (discount > coupon.maxAmount) {
                    discount = coupon.maxAmount;
                    total -= discount;
                } else {
                    total -= discount;
                }
            } else if (coupon.type === "fixedAmount") {
                discount = coupon.value;
                total -= discount;
            }
        }
       
        return {
            subtotal,
            total,
            usedFromWallet,
            walletBalance: wallet ? wallet.balance : 0,
            discount: discount ? discount : 0,
        };
    }
});


/**
 * Verify payment using Razorpay
 */
exports.verifyPayment = asyncHandler(async (razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId) => { 
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = Crypto.createHmac("sha256", process.env.RAZORPAY_SECRET_KEY).update(sign.toString()).digest("hex");
    if (razorpay_signature === expectedSign) {
        return { message: "success", orderId: orderId };
    } else {
        throw new Error("Payment verification failed");
    }
});

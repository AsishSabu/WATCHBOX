const Razorpay = require('razorpay');
const crypto = require('crypto')

var instance = new Razorpay({
    key_id: process.env.RAZORPAY_ID_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY,
});

// creating a newOrder--
const generateRazorPay = (total, orderId) => {
    return new Promise((resolve, reject) => {
        
        var options = {
            amount: total * 100,
            currency: "INR",
            receipt: "" + orderId
        };

        instance.orders.create(options, function (err, order) {
            if (err) {
                console.log('error in creating order', err);
                reject(err);
            } else {
               resolve(order)
            }
        });

    })
}
module.exports = { generateRazorPay}
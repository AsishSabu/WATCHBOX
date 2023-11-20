const Cart = require("../../models/cartModel");
const Product = require("../../models/productModel");
const User = require("../../models/userModels");
const orderItem=require("../../models/orderItemsModel")
const asynchandler = require("express-async-handler");
const Orders=require("../../models/orderModel")
const {getOrders,getSingleOrder,cancelOrderById}=require("../../helpers/orderHelpers");



const orderPage=asynchandler(async(req,res)=>{
try {
    const userId = req.user._id;
    

    const user=await User.findById(userId)
    
    const orders = await getOrders(userId)
    

   

    res.render("./user/pages/orders",{title:"WATCHBOX",orders,user})
} catch (error) {
    throw new Error(error.message)
}

});

//-----------------view single order ----------------


const viewOrder=asynchandler(async(req,res)=>{
    try {
        const orderId=req.params.id
        console.log(orderId);
        const {order,orders}=await getSingleOrder(orderId)
        res.render("./user/pages/viewOrder",{title:"WATCHBOX",order,orders})
    } catch (error) {
        throw new Error(error.message)
    }
})

const cancelOrder = asynchandler(async (req, res) => {
    try {
        const orderId = req.params.id;
        

        const result = await cancelOrderById(orderId);

        if (result === "redirectBack") {
            res.redirect("back");
        } else {
            res.json(result);
        }
    } catch (error) {
        throw new Error(error);
    }
});

module.exports={
    orderPage,
    viewOrder,
    cancelOrder
}



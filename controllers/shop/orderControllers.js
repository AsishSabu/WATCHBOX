const Cart = require("../../models/cartModel");
const Product = require("../../models/productModel");
const User = require("../../models/userModels");
const orderItem=require("../../models/orderItemsModel")
const asynchandler = require("express-async-handler");
const Orders=require("../../models/orderModel")
const orderHelpers=require("../../helpers/orderHelpers");




const orderPage=asynchandler(async(req,res)=>{ 
try {
    const userId = req.user._id;
  
    const user=await User.findById(userId)  
   
    const orders = await Orders.find({ user: userId })
    .populate({
      path: "orderItems",
      select: "product status _id",
      populate: {
        path: "product",
        select: "title images",
        populate: {
          path: "images",
        },
      },
    })
    .select("orderId orderedDate shippingAddress town")
    .sort({
      orderedDate: -1,
    });
    console.log(orders);
    res.render("./user/pages/orders",{title:"WATCHBOX",orders,user})
} catch (error) {
    throw new Error(error.message)
}

});

//-----------------view single order ----------------


const viewOrder=asynchandler(async(req,res)=>{
    try {
        const orderId=req.params.id
       
        const {order,orders}=await orderHelpers.getSingleOrder(orderId)
        console.log(order);
        
        res.render("./user/pages/viewOrder",{title:"WATCHBOX",order,orders})
    } catch (error) {
        throw new Error(error.message)
    }
})

const cancelOrder = asynchandler(async (req, res) => {
    try {
        const orderItemId = req.params.id;

        const result =await orderHelpers.cancelOrderByProductId(orderItemId, req.user._id);
            

        if (result === "redirectBack") {
            
            res.redirect("back");
        } else {
            res.json(result);
        }
    } catch (error) {
        throw new Error(error);
    }
});

  //---------------------order returning-----------------------------------------------

  const ReturnOrder = asynchandler(async (req, res) => {
    try {
        const returnOrderItemId = req.params.id;
        const result = await orderHelpers. returnOrder(returnOrderItemId);

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
    cancelOrder,
    ReturnOrder
}



const expressHandler = require("express-async-handler");
const Order = require("../../models/orderModel");
const orderItem=require("../../models/orderItemsModel");
const {status}=require("../../utils/status");
const {handleCancelledOrder,handleReturnedOrder}=require("../../helpers/orderHelpers")

const orderPage = expressHandler(async (req, res) => {
  try {
        const orders = await Order.find()
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
            .select("orderId orderedDate shippingAddress city zip totalPrice")
            .sort({ orderedDate: -1 });
            res.render("admin/pages/orders", { title: "WATCHBOX", orders });
           
  } catch (error) {
    throw new Error(error);
  }
});



//-----------------------------taking the order details-----------------------------

const orderDetails=expressHandler(async (req, res) => {
        try {
            const orderId = req.params.id;
            const order = await Order.findOne({ orderId: orderId })
                .populate({
                    path: "orderItems",
                    modal: "OrderItems",
                    populate: {
                        path: "product",
                        modal: "Product",
                        populate: {
                            path: "images",
                            modal: "Images",
                        },
                    },
                })
                .populate({
                    path: "user",
                    modal: "User",
                });
            res.render("admin/pages/orderDetails", { title: "WATCHBOX", order });
        } catch (error) {
            throw new Error(error);
        }
    });

    //--------------------change order status--------------------

const orderStatus=expressHandler(async(req,res)=>{

    console.log('haiiii');
    const orderId = req.params.id;
    const newStatus = req.body.status
    
    
            const order = await orderItem.findByIdAndUpdate(orderId, { status: newStatus })
            console.log(order);
           
            if (req.body.status === status.shipped) {
                order.shippedDate = Date.now();
            } else if (req.body.status ===status.delivered) {
                order.deliveryDate = Date.now();
            }
          
            await order.save();
            if (req.body.status === status.cancelled) {
                await handleCancelledOrder(order);
            }
        
            if (order.status === status.returnPending) {
                await handleReturnedOrder(order);
            }
    
            res.redirect("back");

  });


            
module.exports = {
  orderPage,
  orderDetails,
  orderStatus
};

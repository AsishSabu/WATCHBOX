const expressAsyncHandler = require("express-async-handler");
const User=require("../../models/userModels");
const Wallet=require("../../models/walletModel")

exports.viewWallet=expressAsyncHandler(async(req,res)=>{
    try {
        const user=req.user;
        const findWallet = await User.findById(user).populate('wallet')
        let walletHistory = false;
        if(findWallet.wallet){
            const walletId=findWallet.wallet._id
            const walletTransaction=await Wallet.findById({_id:walletId}).populate({  path: 'transactions',
            options: {
                sort: { timestamp: -1 } 
            }});
            walletHistory=walletTransaction.transactions

        }
        const walletBalance=findWallet.wallet.balance
      
        res.render("./user/pages/viewWallet",{title:"WATCHBOX",walletHistory,walletBalance})
        
    } catch (error) {
        throw new Error(error)
    }
})
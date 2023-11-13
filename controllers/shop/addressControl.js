const Address=require('../../models/addressModel')
const asyncHandler=require("express-async-handler")
const User=require('../../models/userModels')

const loadAddress = asyncHandler(async(req,res)=>{
    try {
        res.render('./user/pages/addAddress',{title:'WATCHBOX'})
    } catch (error) {
        throw new Error(error)
    }
})

//-----------------------insertUser to database------------------------
const   insertAddress=asyncHandler(async(req,res)=>{
 
 try {
  
    const user=req.user;
    const address=await Address.create(req.body);
    user.addresses.push(address._id);
    await user.save();
    console.log(address);
    console.log(user);
 } catch (error) {
    throw new Error(error)
 }
})

module.exports={
    loadAddress,
    insertAddress
}
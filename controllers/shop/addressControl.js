const Address=require('../../models/addressModel')
const asyncHandler=require("express-async-handler")
const User=require('../../models/userModels')

const loadAddress = asyncHandler(async(req,res)=>{
    try {
        res.render('./user/pages/Address',{title:'WATCHBOX'})
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
    res.redirect('/savedAddress')
 } catch (error) {
    throw new Error(error)
 }
});


//-------------load saved address page------------------------

const loadSavedAddress = asyncHandler(async(req,res)=>{
    try {
        const user=req.user;
        const userWithAddresses = await User.findById(user).populate('addresses');
        const address = userWithAddresses.addresses
        res.render('./user/pages/savedAddress',{title:'WATCHBOX',address})
    } catch (error) {
        throw new Error(error)
    }
})

//-----------------------load edit address page------------------------

const loadEditAddress = asyncHandler(async(req,res)=>{
    try {
        const addressId=req.params.id;
        const address=await Address.findOne({_id:addressId});
        res.render("./user/pages/editAddress",{title:'WATCHBOX',address})
    } catch (error) {
        throw new Error(error)
    }
})

//----------------------------edit the address page------------------------


const editAddress=asyncHandler(async(req,res)=>{
    try {
       const userId=req.params.id
       const address=await Address.findOneAndUpdate({_id:userId},req.body);
       res.redirect('/savedAddress')
      
    } catch (error) {
        throw new Error(error)
    }
})

module.exports={
    loadAddress,
    insertAddress,
    loadSavedAddress,
    loadEditAddress,
    editAddress
}
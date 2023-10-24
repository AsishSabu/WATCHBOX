const expressAsyncHandler = require("express-async-handler");
const User = require("../models/userModels");
const asynchandler = require("express-async-handler");
require('dotenv').config();


// -------------------load Login------------------------

const  loadLogin=asynchandler(async(req,res)=>{
    try {

        res.render('./admin/pages/login',{title:"WATCHBOX/LOGIN"})

    } catch (error) {
        console.log(error);
    }

})


//-------------------verify admin--------------------------------

const verifyAdmin = asynchandler(async(req,res)=>{
    try {
        const email=process.env.ADMIN_EMAIL;
        const password=process.env.ADMIN_PASS;
        const emailCheck=req.body.email;
        const user=await User.findOne({email:emailCheck});
        if(user){
            res.render('./admin/pages/login',{message:'You are not an Admin',title:'WATCHBOX/LOGIN'})
        }else if(emailCheck === email && req.body.password === password){
            req.session.admin = email; 
            res.render('./admin/pages/index',{title:'WATCHBOX/INDEX'})
        }else{
            res.render('./admin/pages/login', {message: 'check you email and password',title:'WATCHBOX/LOGIN'})
        }
        
    } catch (error) {
        console.log(error.message);
        
    }
})




//------------------load index-------------------------

const loadIndex = asynchandler(async(req,res)=>{

    res.render('./admin/pages/index',{title:"WATCHBOX/INDEX"})

})



//---------------------load user list-------------------

const userList=asynchandler(async(req,res)=>{
    try {
        res.render('./admin/pages/userlist',{title:"WATCHBOX/USERLIST"})
        
    } catch (error) {
        console.log(error.message)
    }
})


//---------------usermanagement------------------------ 


const userManagement=asynchandler(async(req,res)=>{
    try {
        const findUsers=await User.find();
        res.render('./admin/pages/userlist',{users:findUsers,title:"WATCHBOX/USERLIST"})
    } catch (error) {
        console.log(error.message)
    }
})

const searchUser =asynchandler( async (req, res) => {
    try {
        const data=req.body.search;
     
        const searching=await User.find({userName:{$regex:data,$options:"i"}})
        console.log(searching);

        if(searching){
            res.render('./admin/pages/userlist',{users:searching,title:"WATCHBOX/USERLIST"})
        }else{
            res.render('./admin/pages/userlist',{title:'Search'})
        }
        
    } catch (error) {
        console.log(error.message);
    }
})

//----------------block user----------------

const blockUser=asynchandler(async (req,res) => {
    try {
        const id=req.params.id;
        console.log(id);
        await User.findByIdAndUpdate(id,{isBlock:true},{new:true});
        res.redirect('/admin/userlist');

        
    } catch (error) {
        
    }
})


//-----------------------unblock user----------------------

const unblockUser=asynchandler(async (req,res)=>{
   try {
    const id=req.params.id;
    await User.findByIdAndUpdate(id,{isBlock:false},{new:true});
  res.redirect('/admin/userlist')
   } catch (error) {
    console.log(error.message);
   }
})

//-------------------logout---------------- --------------------------------    


const logout =asynchandler(async (req,res) => {
    try {
        console.log('hello i logout')
        req.session.admin=null;
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message);
    }
})


//-----------------product page load ----------------------


const loadProduct=asynchandler(async(req, res)=>{
    try {
        res.render('./admin/pages/product',{title:'WATCHBOX/PRODUCT'})
    } catch (error) {
        console.log(error.message);
    }
})



module.exports= {
    loadLogin,
    loadIndex,
    verifyAdmin,
    userList,
    userManagement,
    searchUser,
    blockUser,
    unblockUser,
    logout,
    loadProduct,
  
}


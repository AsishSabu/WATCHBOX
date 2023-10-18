const express = require('express');
const userRoute= express();
const usercontroller=require('../controllers/userController');

userRoute.use((req,res,next)=>{
    req.app.set('layout','user/layout/user')
    next();
})

userRoute.get('/',usercontroller.loadIndex)
userRoute.get('/login',usercontroller.loadLogin)
userRoute.post('/login',usercontroller.userLogin)
userRoute.get('/register',usercontroller.loadRegister)
userRoute.post('/register',usercontroller.insertUser)
userRoute.get('/resendOtp',usercontroller.resendOtp)
userRoute.get('/verifyOtp',usercontroller.loadOtp)
userRoute.post('/verifyOtp',usercontroller.verifyOtp);
userRoute.post('/logout',usercontroller.logout)



module.exports= userRoute;

const express = require('express');
const adminRoute = express();
const adminController=require('../controllers/adminController');
const {isAdminLoggedOut, isAdminLoggedin}=require('../middleware/adminAuth')

adminRoute.use((req,res,next)=>{
    req.app.set('layout','admin/layout/admin')
    next(); 
})

//-------------------admin login ------------------------

adminRoute.get('/',isAdminLoggedOut,adminController.loadLogin)
adminRoute.post('/',adminController.verifyAdmin)
adminRoute.get('/logout',isAdminLoggedin,adminController.logout)


//-----------------------admin user management ------------------------ 

adminRoute.get('/index',isAdminLoggedin,adminController.loadIndex)
adminRoute.get('/userlist',isAdminLoggedin,adminController.userManagement)
adminRoute.post('/search',isAdminLoggedin,adminController.searchUser)
adminRoute.post('/blockUser/:id',isAdminLoggedin,adminController.blockUser)
adminRoute.post('/unblockUser/:id',isAdminLoggedin,adminController.unblockUser)







module.exports= adminRoute;
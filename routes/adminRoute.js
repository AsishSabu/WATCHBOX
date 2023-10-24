const express = require('express');
const adminRoute = express();
const adminController=require('../controllers/adminController');
const categoryController=require('../controllers/categoryController')
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


//-----------------------admin product management ----------------------------------------------------------------


adminRoute.get('/product',isAdminLoggedin,adminController.loadProduct)



//---------------------admin category management ----------------------------------------------------------------  

adminRoute.get('/category',isAdminLoggedin,categoryController.loadCategory)

adminRoute.get('/addCategory',isAdminLoggedin,categoryController.loadAddCategory)
adminRoute.post('/addCategory',isAdminLoggedin,categoryController.insertCategory)
adminRoute.get('/category/list/:id',isAdminLoggedin,categoryController.list)
adminRoute.get('/category/unlist/:id',isAdminLoggedin,categoryController.unList)
adminRoute.get('/:id',isAdminLoggedin,categoryController.loadEditCategory)
adminRoute.post('/:id',isAdminLoggedin,categoryController.editCategory)






module.exports= adminRoute;
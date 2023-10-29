const express = require('express');
const adminRoute = express();
const adminController=require('../controllers/admin/adminController');
const categoryController=require('../controllers/admin/categoryController')
const productController=require('../controllers/admin/productControllers');
const {uploadMultiple,uploadSingle,upload}=require('../config/upload')
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


adminRoute.get('/products',isAdminLoggedin,productController.loadProduct)
adminRoute.get('/addProduct',isAdminLoggedin,productController.addProduct)
adminRoute.post('/addProduct',uploadMultiple,productController.insertProduct)
adminRoute.post('/product/list/:id',isAdminLoggedin,productController.listProduct)
adminRoute.post('/product/unlist/:id',isAdminLoggedin,productController.unListProduct)
adminRoute.get('/product/editproduct/:id',isAdminLoggedin,productController.editProduct)



//---------------------admin category management ----------------------------------------------------------------  

adminRoute.get('/category',isAdminLoggedin,categoryController.categoryManagement)

adminRoute.get('/addCategory',isAdminLoggedin,categoryController.addCategory)
adminRoute.post('/addCategory',isAdminLoggedin,categoryController.insertCategory)
adminRoute.get('/category/list/:id',isAdminLoggedin,categoryController.list)
adminRoute.get('/category/unlist/:id',isAdminLoggedin,categoryController.unList)
adminRoute.get('/:id',isAdminLoggedin,categoryController.editCategory)
adminRoute.post('/:id',isAdminLoggedin,categoryController.updateCategory)






module.exports= adminRoute;
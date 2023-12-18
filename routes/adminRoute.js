const express = require("express");
const adminRoute = express();
const adminController = require("../controllers/admin/adminController");
const categoryController = require("../controllers/admin/categoryController");
const productController = require("../controllers/admin/productControllers");
const orderCOntroller = require("../controllers/admin/orderController");
const bannerController = require("../controllers/admin/bannerControl");
const salesController = require("../controllers/admin/salesReportController");
const couponController = require("../controllers/admin/couponController")


const { upload, handleError } = require("../config/upload");
const {isAdminLoggedOut,isAdminLoggedin,} = require("../middleware/adminAuth");


adminRoute.use((req, res, next) => {req.app.set("layout", "admin/layout/admin");next();});

//-------------------admin login ------------------------

adminRoute.get("/", isAdminLoggedOut, adminController.loadLogin);
adminRoute.post("/", adminController.verifyAdmin);
adminRoute.get("/logout", isAdminLoggedin, adminController.logout);

//-----------------------admin user management ------------------------

adminRoute.get("/index", isAdminLoggedin, adminController.loadIndex);
adminRoute.get("/userlist", isAdminLoggedin, adminController.userManagement);
adminRoute.post("/search", isAdminLoggedin, adminController.searchUser);
adminRoute.post("/blockUser/:id", isAdminLoggedin, adminController.blockUser);
adminRoute.post( "/unblockUser/:id",isAdminLoggedin,adminController.unblockUser);

//-----------------------admin product management ----------------------------------------------------------------

adminRoute.get("/products", isAdminLoggedin, productController.loadProduct);
adminRoute.get("/addProduct", isAdminLoggedin, productController.addProduct);
adminRoute.post("/addProduct",upload.fields([{ name: "images", maxCount: 4 }]),productController.insertProduct);
adminRoute.post("/product/list/:id",isAdminLoggedin,productController.listProduct);
adminRoute.post("/product/unlist/:id",isAdminLoggedin,productController.unListProduct);
adminRoute.get("/product/editProduct/:id",isAdminLoggedin,productController.editProduct);
adminRoute.post("/product/editProduct/:id",isAdminLoggedin,productController.updateProduct);
adminRoute.put("/product/editImage/:id",isAdminLoggedin,upload.single("images"),productController.editImage);
adminRoute.put("/product/editImage/upload/:id",upload.fields([{ name: "images", maxCount: 4 }]),isAdminLoggedin,productController.addNewImages);
adminRoute.delete("/product/deleteImage/:id",isAdminLoggedin,productController.deleteImage);
// adminRoute.post('/product/editProduct/editImage/:id',uploadSingle,isAdminLoggedin,productController.editProductImages)
// adminRoute.post("/editproduct/images/upload/new/:id", uploadMultiple, productController.addNewImages);

//---------------------admin category management ----------------------------------------------------------------

adminRoute.get("/category",isAdminLoggedin,
  categoryController.categoryManagement
);
adminRoute.get("/addCategory", isAdminLoggedin, categoryController.addCategory);
adminRoute.post(
  "/addCategory",
  isAdminLoggedin,
  categoryController.insertCategory
);
adminRoute.get("/category/list/:id", isAdminLoggedin, categoryController.list);
adminRoute.get(
  "/category/unlist/:id",
  isAdminLoggedin,
  categoryController.unList
);
adminRoute.get(
  "/editCategory/:id",
  isAdminLoggedin,
  categoryController.editCategory
);
adminRoute.post(
  "/editCategory/:id",
  isAdminLoggedin,
  categoryController.updateCategory
);

//-----------------order management -----------------------------------------------

adminRoute.get("/orders", isAdminLoggedin, orderCOntroller.orderPage);
adminRoute.get("/orders/:id", isAdminLoggedin, orderCOntroller.orderDetails);
adminRoute.put("/orders/update/:id", orderCOntroller.orderStatus);

//-----------------------banner Management--------------------------------

adminRoute.get("/banner", isAdminLoggedin, bannerController.bannerList);
adminRoute.get("/addBanner", isAdminLoggedin, bannerController.loadAddBanner);
adminRoute.post(
  "/addBanner",
  isAdminLoggedin,
  upload.single("mainImage"),
  bannerController.createBanner
);
adminRoute.post(
  "/banner/list/:id",
  isAdminLoggedin,
  bannerController.listBanner
);
adminRoute.post(
  "/banner/unlist/:id",
  isAdminLoggedin,
  bannerController.unlistBanner
);

//-----------------------salesreports--------------------

adminRoute.get(
  "/sales-reports",
  isAdminLoggedin,
  salesController.salesReportpage
);
// adminRoute.get("/sales-data-weekly", salesController.getSalesData);
adminRoute.get("/get/sales-report", isAdminLoggedin,salesController.generateSalesReport);
adminRoute.get("/sales-data", isAdminLoggedin, salesController.getSalesData);
adminRoute.get("/sales-data/weekly", isAdminLoggedin, salesController.getSalesDataWeekly);
adminRoute.get("/sales-data/yearly", isAdminLoggedin, salesController.getSalesDataYearly);


//-------------------------------coupon routes-------------------------------


adminRoute.get("/addCoupon", isAdminLoggedin, couponController.loadAddCoupon)
adminRoute.post("/addCoupon", isAdminLoggedin, couponController.addCoupon)
adminRoute.get("/coupons", isAdminLoggedin, couponController.loadCoupon)



// // 404 notfound page--
adminRoute.get("*", (req, res) => {
  try {
    res.render("./admin/pages/404", { title: "Error.." });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = adminRoute;

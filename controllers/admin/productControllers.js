const category = require("../../models/categoryModel");
const product = require("../../models/productModel");
const Images = require("../../models/imageModel");
const asynchandler = require("express-async-handler");
const sharp = require("sharp");
const path = require("path");

//-------------------------load product page    --------------------------------------

const loadProduct = asynchandler(async (req, res) => {
  try {
    const products = await product
      .find()
      .populate("categoryName")
      .populate("images");

    res.render("./admin/pages/product", {
      title: "WATCHBOX/PRODUCTS",
      products: products, // Pass the products to the view
    });
  } catch (error) {
    // Handle the error appropriately, e.g., render an error page or log the error
    console.error(error.message);
  }
});

//------------------------load add products------------------------

const addProduct = asynchandler(async (req, res) => {
  try {
    const Category = await category.find({ isListed: true });
    console.log(category);
    res.render("./admin/pages/addProduct", {
      title: "Add Product",
      catList: Category,
    });
  } catch (error) {
    console.log(error.message);
  }
});

//------------------insertProduct-----------------------------

const insertProduct = asynchandler(async (req, res) => {
  try {
    const imageUrls = [];

    // Check if req.files exists and has images
    if (req.files && req.files.images.length > 0) {
      const images = req.files.images;

      for (const file of images) {
        try {
          const imageBuffer = await sharp(file.path)
            .resize(600, 800)
            .toBuffer();
          const thumbnailBuffer = await sharp(file.path)
            .resize(300, 300)
            .toBuffer();
          const imageUrl = path.join("/admin/uploads", file.filename);
          const thumbnailUrl = path.join("/admin/uploads", file.filename);
          imageUrls.push({ imageUrl, thumbnailUrl });
        } catch (error) {
          console.error("Error processing image:", error);
        }
      }

      const image = await Images.create(imageUrls);
      const imageId = image.map((image) => image._id).reverse();

      const newProduct = await product.create({
        title: req.body.productName,
        description: req.body.description,
        categoryName: req.body.categoryName,
        quantity: req.body.quantity,
        productPrice: req.body.productPrice,
        salePrice: req.body.salePrice,
        brand: req.body.brand,
        images: imageId,
      });

      console.log("inserted", newProduct);
      if (newProduct) {
        res.redirect("/admin/products");
      }
    } else {
      res.status(400).json({ error: "invalid input: No images provided" });
    }
  } catch (error) {
    throw new Error(error);
  }
});

//------------------------------------list products--------------------------------
const listProduct = asynchandler(async (req, res) => {
  const id = req.params.id;
  try {
    const updatedProduct = await product.findByIdAndUpdate(id, {
      isListed: true,
    });
    res.redirect("/admin/products");
  } catch (error) {
    throw new Error(error);
  }
});

//---------------------------------unlist products--------------------------------

const unListProduct = asynchandler(async (req, res) => {
  const id = req.params.id;
  try {
    const updatedProduct = await product.findByIdAndUpdate(id, {
      isListed: false,
    });
    res.redirect("/admin/products");
  } catch (error) {
    throw new Error(error);
  }
});

//------------------------edit product page--------------------------------

const editProduct = asynchandler(async (req, res) => {
  try {
    const id = req.params.id;
    const Product = await product
      .findById(id)
      .populate("categoryName")
      .populate("images");
    const categories = await category.find({ isListed: true });

    res.render("./admin/pages/editProduct", {
      title: "editProduct",
      categories,
      Product,
    });
  } catch (error) {
    console.log(error.message);
  }
});

//---------------------------update product-----------------------------------------------

const updateProduct = asynchandler(async (req, res) => {
  try {
    const id = req.params.id;
    const exists = await product.findOne({ title: req.body.title });

    // const updatedProduct = await product.findByIdAndUpdate(id, req.body);

    console.log(exists);
    res.redirect("/admin/products");

  } catch (error) {
    console.log(error.message);
  }
});

//----------------------------for editing the image----------------------------

const editImage = asynchandler(async (req, res) => {
  try {
    const id = req.params.id;

    const Product = await product.findById(id).populate("images").exec();
    res.render("admin/pages/products/update-image", {
      title: "Edit Images",
      product,
      messages,
    });
  } catch (error) {
    throw new Error(error);
  }
});

//---------------------------

const editProductImages = asynchandler(async (req, res) => {
  res.send("editProductImages");
});

//--------------------------------------------
const addNewImages = asynchandler(async (req, res) => {
  res.send("addNewImages");
});
module.exports = {
  loadProduct,
  addProduct,
  insertProduct,
  listProduct,
  unListProduct,
  editProduct,
  updateProduct,
  editImage,
  editProductImages,
  addNewImages,
};

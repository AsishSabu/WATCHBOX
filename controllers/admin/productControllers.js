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
      .populate("images")
      .sort({ createdAt: -1 });
    console.log(products,"products")

    const messages = req.flash();

    res.render("./admin/pages/product", {
      title: "WATCHBOX/PRODUCTS",
      messages,
      products: products, // Pass the products to the view
    });
  } catch (error) {
    // Handle the error
    throw new Error(error);
  }
});

//------------------------load add products------------------------

const addProduct = asynchandler(async (req, res) => {
  try {
    const Category = await category.find({ isListed: true });
    const messages = req.flash();
    res.render("./admin/pages/addProduct", {
      title: "Add Product",
      catList: Category,
      messages,
    });
  } catch (error) {
    throw new Error(error);
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
          throw new Error(error);
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

      if (newProduct) {
        req.flash("success", "Product Created");
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
    const messages = req.flash();

    res.render("./admin/pages/editProduct", {
      title: "editProduct",
      categories,
      Product,
      messages,
    });
  } catch (error) {
    throw new Error(error);
  }
});

//---------------------------update product-----------------------------------------------

const updateProduct = asynchandler(async (req, res) => {
  try {
    const id = req.params.id;
    const exists = await product.findOne({ title: req.body.title });

    const updatedProduct = await product.findByIdAndUpdate(id, req.body);
    res.redirect("/admin/products");
  } catch (error) {
    throw new Error(error);
  }
});

//----------------------------for editing the image----------------------------

const editImage = asynchandler(async (req, res) => {
  try {
    const imageId = req.params.id;
    const file = req.file;
    const imageBuffer = await sharp(file.path).resize(600, 800).toBuffer();
    const thumbnailBuffer = await sharp(file.path).resize(300, 300).toBuffer();
    const imageUrl = path.join("/admin/uploads", file.filename);
    const thumbnailUrl = path.join("/admin/uploads", file.filename);

    const images = await Images.findByIdAndUpdate(imageId, {
      imageUrl: imageUrl,
      thumbnailUrl: thumbnailUrl,
    });

    req.flash("success", "Image updated");
    res.redirect("back");
  } catch (error) {
    throw new Error(error);
  }
});

//---------------------------

const deleteImage = asynchandler(async (req, res) => {
  try {
    const imageId = req.params.id;
    await Images.findByIdAndRemove(imageId);
    const Product = await product.findOneAndUpdate(
      { images: imageId },
      { $pull: { images: imageId } },
      { new: true }
    );
    res.json({ message: "Images Removed" });
  } catch (error) {
    throw new Error(error);
  }
});

//--------------------------------------------
const addNewImages = asynchandler(async (req, res) => {
  try {
    const files = req.files.images;
    const imageUrls = [];
    const productId = req.params.id;

    for (const file of files) {
      try {
        const imageBuffer = sharp(file.path).resize(600, 600).toBuffer();
        const thumbnailBuffer = sharp(file.path).resize(300, 300).toBuffer();
        const imageUrl = path.join("/admin/uploads", file.filename);
        const thumbnailUrl = path.join("/admin/uploads", file.filename);
        imageUrls.push({ imageUrl, thumbnailUrl });
      } catch (error) {
        throw new Error(error);
      }
    }
    // Find the existing product
    const existingProduct = await product.findById(productId);

    // Remove the old images from the database
    await Images.deleteMany({ _id: { $in: existingProduct.images } });

    // Create and store the new images
    const newImages = await Images.create(imageUrls);

    // Update the product with the new image ids
    await product.findByIdAndUpdate(productId, {
      images: newImages.map((image) => image._id),
    });

    req.flash("success", "Images replaced");
    res.redirect("back");
  } catch (error) {
  throw new Error(error);
  }
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
  addNewImages,
  deleteImage,
};

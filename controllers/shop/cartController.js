const Cart = require("../../models/cartModel");
const Product = require("../../models/productModel");
const User = require("../../models/userModels");
const asynchandler = require("express-async-handler");

const loadCart = asynchandler(async (req, res) => {
  const userId = req.user.id;
  const messages = req.flash();

  try {
    const cart = await Cart.findOne({ user: userId })
      .populate({
        path: "products.product",
        populate: { path: "images", model: "Images" },
      })
      .exec();

    res.render("./user/pages/cart", { cartItems: cart });
  } catch (error) {
    console.log(error);
  }
});

const addToCart = asynchandler(async (req, res) => {
  const productId = req.params.id;
  const userId = req.user.id;

  try {
      const product = await Product.findById(productId);
      let existingProduct2=false;

      if (!product) {
          return res.status(404).json({ message: "Product not found" });
      }

      if (product.quantity < 1) {
          return res.status(400).json({ message: "Product is out of stock" });
      }

      let cart = await Cart.findOne({ user: userId });

      if (!cart) {
          cart = await Cart.create({ user: userId, products: [{ product: productId, quantity: 1 }] });
      } else {
          const existingProduct = cart.products.find((item) => item.product.equals(productId));

          if (existingProduct) {
              // Update the quantity of the existing product
              existingProduct.quantity += 1;
          } else {
              // Add a new product to the cart
             existingProduct2= cart.products.push({ product: productId, quantity: 1 });
          }
          await cart.save();
          if(existingProduct||existingProduct2){
            res.redirect('/cart')
          }
          res.json({ message: "Product Added to Cart", count: cart.products.length, status: "success" });

      // Send a success response if needed
      }

  } catch (error) {
      // Handle errors appropriately
      console.log(error);
      res.status(500).json({ message: "Internal Server Error" });
  }

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "product not found" });
    }

    if (product.quantity < 1) {
      return res.status(404).json({ message: "product is out of stock" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        products: [{ product: productId, quantity: 1 }],
      });
    } else {
      const existingProduct = cart.products.find((item) =>
        item.product.equals(productId)
      );

      if (existingProduct) {
        if (product.quantity <= existingProduct.quantity) {
          return res.json({
            message: "out of stock",
            status: "danger",
            count: cart.products.length,
          });
        }
        existingProduct.quantity += 1;
      } else {
        cart.products.push({ product: productId, quantity: 1 });
      }

      await cart.save();
    }

    res.json({
      message: "Product Added to Cart",
      count: cart.products.length,
      status: "success",
    });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  loadCart,
  addToCart,
};

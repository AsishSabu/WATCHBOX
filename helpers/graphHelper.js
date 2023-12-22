const Order = require("../models/orderModel")
const User = require("../models/userModels")
const Product=require("../models/productModel")




async function countUsers() {
  const usersCount = await User.aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
      },
    },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        month: "$_id.month",
        count: 1,
      },
    },
  ]);
  return usersCount;
}


async function calculateProductSold() {
  const productSold = await Product.aggregate([
    {
      $match: {
        isListed: true,
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: {
          $sum: "$sold",
        },
      },
    },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        month: "$_id.month",
        count: 1,
      
      },
    },
  ]);
  return productSold;
}


module.exports = {
 
    countUsers,
  calculateProductSold
};
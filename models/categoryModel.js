const mongoose = require('mongoose')
const Product = require('../models/productModel')



const Schema = mongoose.Schema;
const categorySchema = new Schema({
    categoryName: {
        type: String,
        required: true
    },
    isListed: {
        type: Boolean,
        default: true
    },
   
}, { timestamps: true });

const category = mongoose.model('Category', categorySchema);

module.exports = category
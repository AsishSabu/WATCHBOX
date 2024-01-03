const expressHandler = require('express-async-handler')
const path = require('path')
const fs = require('fs')
const Product=require("../../models/productModel")
const Banner=require("../../models/bannerModel")
const { log } = require('console')

//-------------------banner list page----------------
exports. bannerList=expressHandler(async(req,res)=>{
    try {
        const  listBanners = await Banner.find()
        res.render('./admin/pages/banner', { title: 'WATCHBOX/BANNER', banners: listBanners })      
    } catch (error) {
        throw new Error(error)
    }
})

//-----------------------load add banner page--------------------


exports.loadAddBanner = expressHandler(async(req,res)=>{
    try {
        const products = await Product.find({ isListed: true })
        res.render("./admin/pages/addBanner",{title:"WATCHBOX/ADDbANNER" ,Products:products })  

    } catch (error) {
        throw new Error(error)
    }
})
exports.createBanner= expressHandler(async(req,res)=>{
    try {
        let bannerImage = [];
        if (req.file) {
            bannerImage.push({
                name: req.file.filename,
                path: req.file.path
            })

        }
        const newBanner = {
            bannerImage: bannerImage,
            productUrl: req.body.productUrl,
            title: req.body.title,
            description: req.body.description,
        }


        const create = await Banner.create(newBanner)
        res.redirect('/admin/banner')

    } catch (error) {
        throw new Error(error)
    }
})

//---------------------updating the status of banner --------------------

exports.listBanner=expressHandler(async(req,res) => {
    try {
        
        const bannerId = req.params.id;
    
        const banner = await Banner.findByIdAndUpdate(bannerId, { isActive: true })
        res.redirect("back")
    } catch (error) {
        throw new Error(error)
    }
})

exports.unlistBanner=expressHandler(async(req,res) => {
    try {
        
        const bannerId = req.params.id;
    
        const banner = await Banner.findByIdAndUpdate(bannerId, { isActive: false })
        res.redirect("back")
    } catch (error) {
        throw new Error(error)
    }
})
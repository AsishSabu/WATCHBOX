const { Schema, model } = require('mongoose');

const categorySchema=new Schema({ 
    title:{
        type:String,
        required:true,
        unique:true,
        indexe:true,
    },
    isListed:{
        type:Boolean,
        default:true,
    },
    
    
},{timestamps:true});

const categoryDb=model('categoryDb',categorySchema)

module.exports=categoryDb;

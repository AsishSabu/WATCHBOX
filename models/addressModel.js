const mongoose = require('mongoose'); 

const  addressSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    
    address:{
        type:String,
        required:true        
    },
    town:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    postcode:{
        type:Number,
        required:true
    },
    mobile:{
        type:Number,
        required:true
    },
});

module.exports = mongoose.model('Address', addressSchema)
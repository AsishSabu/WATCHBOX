const { Schema, model, default: mongoose } = require('mongoose');

const productSchema= new Schema({
     title:{
        type:String,
        required:true,
     },
     description:{
        type:String,
        required:true,
     },
     productPrice:{
        type:Number,
        required:true,
     },
     salesPrice:{
        type:Number,
        required:true,
     },
     categoryName:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"categoryDb"

     },
     brand:{
      type:String,
      required:true,
     },
     quantity:{
      type:Number,
      required:true,
     },
     isListed:{
      type:Boolean,
      default:true
     }

     
},{timestamps:true});

module.exports=model("Product",productSchema)


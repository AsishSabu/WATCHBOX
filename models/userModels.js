const mongoose=require('mongoose');
const bcrypt=require('bcrypt');

const Schema=mongoose.Schema;

const userSchema=new Schema({
    userName:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    salt:String,
     isBlock:{
        type:Boolean,
        default:false,
     },
     isVerified:{
        type:Boolean,
        default:false,
     }

},{timestamps:true});

userSchema.pre('save',async function(next){
    if(this.isNew){
        const salt =bcrypt.genSaltSync(10);
        this.password=await bcrypt.hash(this.password,salt);

    }
    next();
})

userSchema.methods.isPasswordMatched = async function (enteredPassword) {
    // Checking for matching password
    return await bcrypt.compare(enteredPassword, this.password);
};





const User=mongoose.model('User',userSchema);
module.exports = User;  
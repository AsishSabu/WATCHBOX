const categoryDb=require('../models/categoryModel')
const asynchandler = require("express-async-handler");
const { response } = require('../routes/adminRoute');
const { findByIdAndUpdate } = require('../models/userModels');

//---------------load category page----------------------------

const loadCategory=asynchandler(async(req, res)=>{

    try {
    const category=await categoryDb.find();
    res.render('./admin/pages/category',{category:category,title:'WATCHBOX/CATEGORY'})

    } catch (error) {
        console.log(error.message);
    }
});

//--------------------------------load add category-------------------------------

const loadAddCategory=asynchandler(async(req, res)=>{
    try {
        res.render('./admin/pages/addCategory',{title:'WATCHBOX/ADD_CATEGORY'})
    } catch (error) {
        console.log(error.message);
    }
});

//----------------------inserting categories-------------------------------   

const insertCategory=asynchandler(async(req, res)=>{
    try {
        const categoryName=req.body.text;
        const regexCategoryName = new RegExp(`^${categoryName}$`, 'i');
        const findCat=await categoryDb.findOne({ title:regexCategoryName});
       
        if(findCat){
            const catCheck= `Category ${categoryName} Already existing`;
            res.render('./admin/pages/addCategory',{catCheck,title:'WATCHBOX/ADD_CATEGORY'})
        }else{
            const result= new categoryDb({
                title:categoryName
            });
            await result.save();
            res.render('./admin/pages/addCategory',{
                message:`Category ${categoryName} added successfully`,
                title:'WATCHBOX/ADD_CATEGORY'
            })
        }

    } catch (error) {
        console.log(error.message);
    }
});


//------------------list categories --------------------------------

const list=asynchandler(async(req,res) => {
    try {
        const id=req.params.id;
        const list=await categoryDb.findByIdAndUpdate({_id:id},{$set:{isListed:true}})
   
     res.redirect('/admin/category')
    
    } catch (error) {
        console.log(error.message); 
    }
});


//---------------------------unlist categories --------------------------------

const unList=asynchandler(async(req,res) => {
    try {
     const id=req.params.id
     const list=await categoryDb.findByIdAndUpdate({_id:id},{$set:{isListed:false}})
 
     res.redirect('/admin/category')
   
    } catch (error) {
        console.log(error.message);
    }
});

//------------------------------load --edit category-----------------------------

const loadEditCategory=asynchandler(async(req, res)=>{

    try {
        const { id } = req.params
        const catName = await categoryDb.findById(id);
        if (catName) {
            res.render('./admin/pages/editCate', { title: 'WATCHBOX/EDIT_CATEGORY', value: catName });
        } else {
            console.log('error in rendering');
        }
    } catch (error) {
        console.log(error);
    }


});


//-------------------------edit category----------------------------------------        

const editCategory=asynchandler(async(req, res)=>{
    try {
      
       const id = req.params.id;
     
       const text=req.body.text 
    
       const category= await categoryDb.findById(id);

       category.title=text;
        const saved=await category.save()
        res.redirect('/admin/category')
    } catch (error) {
        
    }

})

module.exports={
    loadCategory,
    loadAddCategory,
    insertCategory,
    list,
    unList,
    loadEditCategory,
    editCategory

}
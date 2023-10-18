const isAdminLoggedin=(req,res,next)=>{
    if(req.session.admin){
        next();
    }else{
        res.redirect('/admin');
    }
}

const isAdminLoggedOut=(req,res,next)=>{
    if(!req.session.admin){
        next();
    }else{
        res.redirect('/admin/index')
    }
}

module.exports = {
    isAdminLoggedOut,
    isAdminLoggedin
}
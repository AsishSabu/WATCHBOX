const multer = require('multer');     /**** Multer setup ****/
const path = require('path');         /*********************/

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/admin/uploads'));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '-' + file.originalname;
    cb(null, name);
  },
});

const fileFilter=(req,file,cb)=>{
if(file.mimetype==="image/jpeg"||
file.mimetype==="image/jpg"||
file.mimetype==="image/png"){
  cb(null,true)
}else{
  cb(null,false)
  return new Error("only allowed image formats is jpeg,jpg,png")
}
};

const upload = multer({ storage: storage,
 fileFilter:fileFilter
});


// Error handling middleware
const handleError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer error (e.g., file size exceeded)
    res.status(400).send('Multer error: ' + err.message);
  } else if (err) {
    // Other errors
    res.status(500).send('Error: ' + err.message);
  } else {
    next();
  }
};



// // Custom validation function to check the number of files
// const fileUploadValidation = (req, res, next) => {
//   // Check if the number of files exceeds the limit
//   if (!req.files || req.files.length > 4) {
//     req.flash("danger", "You can upload a maximum of 4 files.")
//    res.redirect("back")
//   }
//   // If the number of files is within the limit, proceed to the next middleware
//   next();
// };



module.exports = {
    upload,
  handleError,
   
};
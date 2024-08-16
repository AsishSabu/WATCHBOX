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







module.exports = {
    upload,
  handleError,
   
};
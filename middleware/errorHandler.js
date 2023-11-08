const notFound = (req, res, next) => {
    const error = new Error(`Not Found: ${req.originalUrl}`);
    res.status(404);
    next(error);
  };
  
  const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
  
    const errorResponse = {
      status: 'error',
      message: err.message,
      stack : err.stack
    };

    
  
    res.json(errorResponse);
  };
  
  module.exports = { notFound, errorHandler };

const { validationResult, param } = require('express-validator');
const mongoose = require('mongoose')
const validateID = [
 
  param('id')
    .isMongoId() // Check if it's a valid MongoDB ObjectID
    .withMessage('Invalid ID format'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('./user/pages/404', { title: "Error.." });
    }
    next();
  },
];


const adminValidateID = [
  param('id')
    .isMongoId() // Check if it's a valid MongoDB ObjectID
    .withMessage('Invalid ID format'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('./admin/pages/404', { title: "Error.." });
    }
    next();
  },
];


module.exports = { validateID, adminValidateID };
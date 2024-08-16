//----------DATABASE CONNECTION ---------
const mongoose = require('mongoose');
require('dotenv').config(); // Access data from .env file for storing sensitive information

const dbConnect = () => {
    mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,//--------to use new url parse------------
        useUnifiedTopology: true,
    });

    const db = mongoose.connection;

    db.on('connected', () => {
        console.log('MongoDB connected');
    });

    db.on('error', (err) => {
        console.error('MongoDB connection error:', err);
    });
};

module.exports = {
    dbConnect
};

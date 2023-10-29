const express = require('express');
const app = express();
const expressLayout = require('express-ejs-layouts');
const path = require('path');
const nocache=require('nocache');
const morgan = require('morgan');
const flash=require('connect-flash');


app.use(expressLayout);

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(morgan("dev"));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));
app.use(express.static(path.join(__dirname, './public')));


//------------------------session creating--------------
const session = require('express-session');
require('dotenv').config()
app.use(session({
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:false
}));


 // Call the database connection function
const database = require('./config/database');
database.dbConnect();


app.use(flash())
app.use(nocache())

const userRoute = require('./routes/userRoutes');
app.use('/', userRoute);

const adminRoute = require('./routes/adminRoute');
app.use('/admin', adminRoute);



app.listen(4000, () => {
    console.log('Server is running on http://localhost:4000');
});

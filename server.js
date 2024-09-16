const express = require("express");
const app = express();
const expressLayout = require("express-ejs-layouts");
const path = require("path");
const nocache = require("nocache");
const morgan = require("morgan");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const override = require("method-override");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const Cart = require("./models/cartModel");


require("dotenv").config();

app.use(expressLayout);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));
app.use(express.static(path.join(__dirname, "./public")));

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());
require("./utils/passport");

app.use(override("_method"));

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// Call the database connection function
const database = require("./config/database");
database.dbConnect();

app.use(flash());
app.use(nocache());

const userRoute = require("./routes/userRoutes");

const adminRoute = require("./routes/adminRoute");
app.use("/admin", adminRoute);
app.use("/", userRoute);

app.use(errorHandler);
const Port = process.env.PORT

app.listen(Port, () => {
  console.log(`Server is running on http://localhost:${Port}`);
});

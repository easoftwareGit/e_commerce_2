const express = require('express');
const session = require('express-session');
const passport = require('passport');
const bodyParser = require('body-parser');
const cors = require('cors');

require('./auth');

require("dotenv").config();
const port = process.env.PORT;
const baseUrl = process.env.BASEURL; 

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('trust proxy', 1);

app.use(session({
  secret: process.env.SESSION_SECRET || 'not_so_secret',
  resave: false,
  saveUninitialized: false  
}));

// passport configuration
app.use(passport.initialize());
app.use(passport.session());

// routes
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');
const ordersRouter = require('./routes/orders');
app.use(`${baseUrl}/users`, usersRouter);
app.use(`${baseUrl}/auth`, authRouter);
app.use(`${baseUrl}/products`, productsRouter);
app.use(`${baseUrl}/carts`, cartsRouter);
app.use(`${baseUrl}/orders`, ordersRouter);

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
});

module.exports = app;
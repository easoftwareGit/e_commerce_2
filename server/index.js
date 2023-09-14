const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const userQuery = require('./db/userQueries');
require("dotenv").config();
// ---- END OF Imports ------------------

const port = process.env.PORT;
const baseUrl = process.env.BASEURL; 
const clientRoot = process.env.CLIENT_ROOT;
const clientHost = process.env.CLIENT_HOST; 
const clientPort = process.env.CLIENT_PORT;
const clientOrigin = `${clientRoot}${clientHost}:${clientPort}`
// ---- END OF consts from process.env ------------------

const app = express();

// Middleware ------------------
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: clientOrigin, // <-- location of react app client http://localhost:3000  
  credentials: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET || 'not_so_secret',
  resave: false,
  saveUninitialized: false
}));

// passport configuration
app.use(passport.initialize());
app.use(passport.session());
require('./passportConfig')(passport);
// ---- END OF Middleware ------------------

// Routes ------------------
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
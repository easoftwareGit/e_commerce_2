const express = require('express');
const authRouter = express.Router();
const passport = require("passport");
const userQuery = require('../db/userQueries');

require("dotenv").config();
const baseUrl = `${process.env.BASEURL}/auth`; 

authRouter.post('/register', async (req, res) => {

  // POST request - register user
  // path: localhost:5000/auth/register 
  // body: 
  //  {
  //    "email": "user@email.com",
  //    "password": "123ABC",
  //    "first_name": "John",
  //    "last_name": "Doe",
  //    "phone": "(800) 555-1234"
  //  }

  const { email } = req.body;  
  try {
    const oldUser = await userQuery.findUserByEmail(email);
    if (oldUser) {
      res.status(409).json({ message: 'email already in use' });
    } else {
      const newUser = await userQuery.createUser(req.body);
      if (newUser) {
        res.status(200).send(newUser);
      } else {
        res.status(500).json({ messsage: 'Could not create user'});
      }    
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

authRouter.post('/login', (req, res, next) => {

  // POST request - login user
  // path: localhost:5000/auth/login
  // body: 
  //  {
  //    "email": "user@email.com",
  //    "password": "123ABC",
  //  }
  // this path uses passport LocalStrategy (see main index.js)
  //
  // note: code based on post in stackOverflow
  // https://stackoverflow.com/questions/57293115/passport-deserializeuser-not-being-called

  passport.authenticate('local', (err, theUser, failureDetails) => {
    if (err) {
      res.status(500).json({ message: "Something went wrong authenticating user" });
      return;
    }
    if (!theUser) {
      res.status(401).json(failureDetails);
      return;  
    }
    // save user in session
    req.login(theUser, (err) => {
      if (err) {
        res.status(500).json({ message: "Session save went bad." });
        return;
      }
      // res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.status(200).json({ errors: false, user: theUser });
    });
  })(req, res, next);
});

authRouter.get('/logout', (req, res, next) => {

  // GET request - log out user
  // path: localhost:5000/auth/logout
  // body: not used
  // this path uses passport LocalStrategy (see main index.js)

  // logout user
  req.logout((err) => {    
    if (err) {
      res.send(err);
    } else {
      // destroy session
      req.session.destroy((err) => {
        if (err) {
          res.send(err);
        } else {
          // send logged out message
          // res.send('Logging out...');
          // res.redirect('/login');
          res.sendStatus(205);
        }
      })
    }
  });
})

// middleware function checks if user is logged in 

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {        
    // res.status(401).send('not logged in');
    res.sendStatus(401);
  }
};

authRouter.get('/profile', isLoggedIn, (req, res) => {
  if (req.isAuthenticated()) {
    res.send('Welcome to your profile');
  } else {
    res.redirect(`/login`);
  }
});

authRouter.get('/is_logged_in', isLoggedIn, (req, res) => {

  // GET request - check if user is logged in
  // path: localhost:5000/auth/is_logged_in
  // body: not used
  // this path uses passport LocalStrategy (see main index.js)

  res.status(200).send("User logged in")
});

// authRouter.get('/login', (req, res) => {
//   res.send('Login Page');
// });

authRouter.get('/user', (req, res) => { 

  // GET request - gets the currenly logged in user
  // path: localhost:5000/auth/user
  // body: not used
  // this path uses passport LocalStrategy (see main index.js)

  res.send(req.user);  // req.user stores the entire user that has been authenticated
});

// GOOGLE log in

authRouter.get('/google',
  passport.authenticate('google', { scope: ['email', 'profile'] })
);

// /google/callback located in index.js,
// so it does not have /api/auth in route
// authRouter.get('/google/callback',
//   passport.authenticate('google', {
//     successRedirect: '/products',
//     failureRedirect: '/login'
//   })
// );

module.exports = authRouter;
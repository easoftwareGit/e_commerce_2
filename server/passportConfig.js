const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const userQuery = require('./db/userQueries');

require('dotenv').config();

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password'
      },
      async (username, password, done) => {
        const errMsg = 'Incorrect username or password';
        try {
          // note: username IS email
          const user = await userQuery.findUserByEmail(username);
          // if did not find user
          if (!user) return done(null, false, { message: errMsg });
          // found user, try to match hashed password        
          const matchedPassword = await bcrypt.compare(password, user.password_hash);
          // if password hashes do not match
          if (!matchedPassword) return done(null, false, { message: errMsg });
          // password hashes match                   
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
  
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK,
      passReqToCallback: true
    },
    async function (request, accessToken, refreshToken, profile, done) {      
      let user = await userQuery.findUserByEmail(profile.email);
      if (user) {
        user.google = profile.sub;
        const updatedUser = await userQuery.updateUser(user);
        if (!updatedUser || updatedUser.google !== user.google) {
          throw Error('Could not update user');
        }
      } else {
        const googleUser = {
          first_name: profile.given_name,
          last_name: profile.family_name,
          phone: null,
          email: profile.email,
          password_hash: null,
          google: profile.sub
        }
        user = await userQuery.createGoogleUser(googleUser);
        if (!user) {          
          throw Error('Could not create user');
        }
      }
      return done(null, user); 
    }
  ));

  passport.serializeUser((user, done) => {
    done(null, user.uuid);    
  });
  passport.deserializeUser( async (uuid, done) => {  
    const user = await userQuery.findUserByUuid(uuid); 
    if (user) {
      return done(null, user);
    } else {
      return done(null, false, { message: 'user not found' });      
    }      
  });
}
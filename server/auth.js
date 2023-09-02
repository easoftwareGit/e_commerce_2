const passport = require('passport');

const LocalStrategy = require('passport-local').Strategy;

const bcrypt = require('bcrypt');

const userQuery = require('./db/userQueries');

// configure passport LocalStrategy
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (username, password, done) => {
      const errMsg = 'Incorrect username or password';
      try {
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

// passport serializeUser/deserializeUser
passport.serializeUser((user, done) => {
  done(null, user.guid);
});
passport.deserializeUser( async (guid, done) => {  
  const user = await userQuery.findUserByGuid(guid); 
  return done(null, user);
});

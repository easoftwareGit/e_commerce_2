const db = require('./db');
const bcrypt = require('bcrypt');

// from https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
// function validEmail(email) {
//   var re = /\S+@\S+\.\S+/;
//   return re.test(email);
// };

/**
 * finds one user by searching for a matching email address
 *
 * @param {String} email
 * @return {Object|null} Object = User's data; mull = user not found
 */
async function findUserByEmail(email) {
  // email validation done on the client side
  // if (!validEmail(email)) {
  //   throw Error('invalid email');
  // }
  const sqlCommand = `SELECT * FROM users WHERE email = $1;`;
  try {
    const results = await db.query(sqlCommand, [email]);
    if (db.validResultsAtLeast1Row(results)) {
      return results.rows[0];
    } else {
      return null;
    }
  } catch (err) {
    throw Error(err);
  }
};

/**
 * finds one user by searching for a matching guid
 *
 * @param {String} guid
 * @return {Object|null} Object = User's data; mull = user not found
 */
async function findUserByGuid(guid) {
  const sqlCommand = `SELECT * FROM users WHERE guid = $1;`;
  try {
    const results = await db.query(sqlCommand, [guid]);
    if (db.validResultsAtLeast1Row(results)) {
      return results.rows[0];
    } else {
      return null;
    }
  } catch (err) {
    throw Error(err);
  }
}

/**
 * finds one user by searching for a matching google id
 *
 * @param {String} id
 * @return {Object|null} Object = User's data; mull = user not found
 */
async function findUserByGoogleId(id) {
  const sqlCommand = `SELECT * FROM users WHERE google = $1;`;
  try {
    const results = await db.query(sqlCommand, [id]);
    if (db.validResultsAtLeast1Row(results)) {
      return results.rows[0];
    } else {
      return null;
    }
  } catch (err) {
    throw Error(err);
  }  
}

/**
 * creates a new user record
 *
 * @param {Object} data - JSon object of user's data. NOTE: plain text password is in JSon object
 * @return {Object} JSon object of user's data. NOTE: password_hash is in returned JSon object
 */
async function createUser(data) {
  try {
    const { email, password, first_name, last_name, phone } = data;
    const saltRounds = parseInt(process.env.SALT_ROUNDS); 
    const salt = await bcrypt.genSalt(saltRounds);
    const password_hash = await bcrypt.hash(password, salt);
    const sqlCommand = `
      INSERT INTO users (email, password_hash, first_name, last_name, phone) 
      VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
    const rowValues = [email, password_hash, first_name, last_name, phone];
    const results = await db.query(sqlCommand, rowValues);
    if (db.validResultsAtLeast1Row(results)) {
      return results.rows[0];
    } else {
      return null;
    }
  } catch (err) {
    throw Error(err)
  }
};

/**
 * updates a user record
 *
 * @param {object} data - JSon object of user's data.
 * @return {object} - JSon object of user's data; null - could not update
 */
async function updateUser(data) {
  try {
    const { guid, email, password_hash, first_name, last_name, phone, google } = data;
    const rowValues = [email, password_hash, first_name, last_name, phone, google, guid];
    const sqlCommand = `
      UPDATE users
      SET email = $1, 
          password_hash = $2, 
          first_name = $3, 
          last_name = $4, 
          phone = $5,
          google = $6
      WHERE guid = $7
      RETURNING *;`;  
      const results = await db.query(sqlCommand, rowValues);
      if (db.validResultsAtLeast1Row(results)) {
        return results.rows[0];
      } else {      
        return null;
      }; 
  } catch (err) {
    throw Error(err)
  }
}

/**
 * creates a new user record
 *
 * @param {Object} data - JSon object of user's data. NOTE: plain text password is in JSon object
 * @return {Object} JSon object of user's data. NOTE: password_hash is in returned JSon object; null - could not update
 */
async function createGoogleUser(data) {
  try {
    const { email, password_hash, first_name, last_name, phone, google } = data;
    const sqlCommand = `
      INSERT INTO users (email, password_hash, first_name, last_name, phone, google) 
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`;
    const rowValues = [email, password_hash, first_name, last_name, phone, google];
    const results = await db.query(sqlCommand, rowValues);
    if (db.validResultsAtLeast1Row(results)) {
      return results.rows[0];
    } else {
      return null;
    }
  } catch (err) {
    throw Error(err)
  }
};

module.exports = { 
  findUserByEmail, 
  findUserByGuid,
  findUserByGoogleId,
  createUser,
  updateUser,
  createGoogleUser
}

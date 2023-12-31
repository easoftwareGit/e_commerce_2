const express = require('express');
const usersRouter = express.Router();
const db = require('../db/db');
const { validateUuid } = require('./uuidRegEx');
const { findUserByUuid, updateUser } = require('../db/userQueries');

/**
 * checks uuid param,sets req.uuid if uuid param valid, else sets error
 * @param {String} - 'uuid'; matches the route handler path variable (:uuid)
 * @param {string} - uuid - actual value of uuid parameter in route path
 */

usersRouter.param('uuid', (req, res, next, uuid) => {
  try {
    if (validateUuid(uuid)) {
      req.uuid = uuid;
      next();
    } else {
      next(res.status(404).json('Invalid parameter'))
    }
  } catch (err) {
    next(err);
  }
});

usersRouter.get('/', async (req, res) => {

  // GET request - get all users
  // path: localhost:5000/users 
  // body: not used  

  const sqlCommand = `SELECT * FROM users;`;  
  try {
    const results = await db.query(sqlCommand);
    if (db.validResultsAtLeast1Row(results)) {
      res.status(200).json(results.rows);      
    } else {
      res.status(404).json('No user rows');
    }    
  } catch (err) {
    throw Error(err);
  }
});

usersRouter.get('/:uuid', async (req, res) => {

  // GET request - get one user by uuid
  // path: localhost:5000/users/uuid  
  //  where uuid is the uuid code for the user
  // body: not used

  try {
    const userRow = await findUserByUuid(req.uuid);
    if (userRow) {
      res.status(200).json(userRow);
    } else {
      res.status(404).json('User not found');
    }      
  } catch (err) {
    throw Error(err);
  } 
});

usersRouter.post('/', async (req, res) => {

  // POST request
  // path: localhost:5000/users
  // body: JSON object
  //  {
  //    "email": "user@email.com",
  //    "password_hash": "QWERTY!@#$%^",
  //    "first_name": "John",
  //    "last_name": "Doe",
  //    "phone": "(800) 555-1234",
  //    "google": "1234567890"
  //  }
  // 
  // note: only used in testing. to create a user, post to /api/auth/register
  
  const { email, password_hash, first_name, last_name, phone, google } = req.body;
  const rowValues = [email, password_hash, first_name, last_name, phone, google];
  const sqlCommand = `
    INSERT INTO users (email, password_hash, first_name, last_name, phone, google) 
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`;
  try {
    const results = await db.query(sqlCommand, rowValues);
    if (db.validResultsAtLeast1Row(results)) {      
      res.status(201).json(results.rows[0]);      
    } else {
      res.status(404).json('User not inserted');
    }    
  } catch (err) {
    if (err.code === '23505') {
      res.status(400).json('email already used');
    } else if (err.code === '23502') {
      res.status(400).json('required value missing');
    } else {
      throw Error(err);
    }    
  }
});

usersRouter.post('/google', async (req, res) => {

  // POST request
  // path: localhost:5000/users/google
  // body: JSON object
  //  {
  //    "email": "user@email.com",
  //    "password_hash": null
  //    "first_name": "John",
  //    "last_name": "Doe",
  //    "phone": null
  //    "google": "1234567890"
  //  }
  //
  // note: only used in testing. to created a google user, 
  //  use passport.use(new GoogleStrategy({ ... }) in passportConfig.js
  
  const { email, first_name, last_name, google } = req.body;
  const rowValues = [email, first_name, last_name, google];
  const sqlCommand = `
    INSERT INTO users (email, first_name, last_name, google) 
    VALUES ($1, $2, $3, $4) RETURNING *;`;
  try {
    const results = await db.query(sqlCommand, rowValues);
    if (db.validResultsAtLeast1Row(results)) {      
      res.status(201).json(results.rows[0]);      
    } else {
      res.status(404).json('User not inserted');
    }    
  } catch (err) {
    if (err.code === '23505') {
      res.status(400).json('email already used');
    } else if (err.code === '23502') {
      res.status(400).json('required value missing');
    } else {
      throw Error(err);
    }    
  }
});

usersRouter.put('/:uuid', async (req, res) => {

  // PUT request
  // path: localhost:5000/users/#
  //  where # is the uuid code for the user
  // body: JSON object
  //  {
  //    "email": "user@email.com",
  //    "password_hash": "123ABC",
  //    "first_name": "John",
  //    "last_name": "Doe",
  //    "phone": "(800) 555-1234",
  //    "google": "1234567890"
  //  }
     
  try {
    const userRow = await updateUser(req.body);
    if (userRow) {
      res.status(200).json(userRow);
    } else {
      res.status(404).json('User not found');
    }      
  } catch (err) {
    if (err.code === '23505') {
      res.status(400).json('email already used');
    } else if (err.code === '23502') {
      res.status(400).json('required value missing');
    } else {
      throw Error(err);
    }        
  }
});

usersRouter.delete('/:uuid', async (req, res) => {

  // DELETE request
  // path: localhost:5000/users/#
  //  where # is the uuid code for the user
  // body: not used
  
  const sqlCommand = `DELETE FROM users WHERE uuid = $1;`;
  try {
    const results = await db.query(sqlCommand, [req.uuid]);
    if (results.rowCount === 1) {
      res.status(200).send(`${req.uuid}`);
    } else {
      res.status(404).send(`User not found`);
    }
  } catch (err) {
    // console.log(`err code = ${err.code}`);
    if (err.code === '23503') {
      res.status(409).send('Cannot delete - constraint error');
    } else {
      throw Error(err);
    }
  }
});

module.exports = usersRouter;
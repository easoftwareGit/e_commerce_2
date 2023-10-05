const express = require('express');
const productsRouter = express.Router();
const db = require('../db/db');
const { validateUuid } = require('./uuidRegEx');

/**
 * checks uuid param,sets req.uuid if uuid param valid, else sets error
 * @param {String} - 'uuid'; matches the route handler path variable (:uuid)
 * @param {string} - uuid - actual value of uuid parameter in route path
 */

productsRouter.param('uuid', (req, res, next, uuid) => {
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

productsRouter.get('/', async (req, res) => {

  // GET request - get all products
  // path: localhost:5000/products 
  // body: not used  

  const sqlCommand = `SELECT * FROM products ORDER BY category, name;`;  
  try {
    const results = await db.query(sqlCommand);
    if (db.validResultsAtLeast1Row(results)) {
      res.status(200).json(results.rows);      
    } else {
      res.status(404).json('No product rows');
    }    
  } catch (err) {
    throw Error(err);
  }
});

productsRouter.get('/:uuid', async (req, res) => {

  // GET request - get one product by uuid
  // path: localhost:5000/products/uuid
  //  where uuid is the uuid code for the product
  // body: not used

  const sqlCommand = `SELECT * FROM products WHERE uuid = $1;`;
  try {
    const results = await db.query(sqlCommand, [req.uuid]);      
    if (db.validResultsAtLeast1Row(results)) {      
      res.status(200).json(results.rows[0]);
    } else {        
      res.status(404).json('Product not found');
    }    
  } catch (err) {
    res.status(404).json('Product not found');
  }
});

productsRouter.post('/', async (req, res) => {

  // POST request
  // path: localhost:5000/products/
  // body: JSON object
  //  {
  //    "name": "product",
  //    "category": "CATEGORY",
  //    "price": 12.34
  //    "description": "This is a product",
  //    "designer": "Designer name"
  //  }

  const { name, category, price, description, designer } = req.body;
  const rowValues = [name, category, price, description, designer];
  const sqlCommand = `
    INSERT INTO products (name, category, price, description, designer) 
    VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
  try {
    const results = await db.query(sqlCommand, rowValues);
    if (db.validResultsAtLeast1Row(results)) {      
      res.status(201).json(results.rows[0]);      
    } else {
      res.status(404).json('Product not inserted');
    }        
  } catch (err) {    
    if (err.code === '23505') {
      let errMsg
      if (err.detail.includes('(name)')) {
        errMsg = 'name already used';
      } else {
        errMsg = 'value already used'
      }
      res.status(400).json(errMsg);
    } else if (err.code === '23502') {
      res.status(400).json('required value missing');
    } else {
      throw Error(err);
    }    
  }
});

productsRouter.put('/:uuid', async (req, res) => {

  // PUT request
  // path: localhost:5000/products/uuid
  //  where uuid is the uuid code for the product
  // body: JSON object
  //  {
  //    "name": "product",
  //    "category": "CATEGORY",
  //    "price": 12.34
  //    "description": "This is a product",
  //    "designer": "Designer name"
  //  }
  
  const { name, category, price, description, designer } = req.body;
  const rowValues = [name, category, price, description, designer, req.uuid];
  const sqlCommand = `
    UPDATE products
    SET name = $1, 
        category = $2, 
        price = $3,
        description = $4, 
        designer = $5
    WHERE uuid = $6
    RETURNING *;`;
  try {
    const results = await db.query(sqlCommand, rowValues);
    if (db.validResultsAtLeast1Row(results)) {
      res.status(200).send(results.rows[0]);      
    } else {      
      res.status(404).send(`Product not found`);
    };    
  } catch (err) {
    if (err.code === '23505') {
      let errMsg
      if (err.detail.includes('(name)')) {
        errMsg = 'name already used';
      } else {
        errMsg = 'value already used'
      }
      res.status(400).json(errMsg);
    } else if (err.code === '23502') {
      res.status(400).json('required value missing');
    } else {
      throw Error(err);
    }    
  }
});

productsRouter.delete('/:uuid', async (req, res) => {

  // DELETE request
  // path: localhost:5000/products/uuid
  //  where uuid is the uuid code for the product
  // body: not used

  const sqlCommand = `DELETE FROM products WHERE uuid = $1;`;
  try {
    const results = await db.query(sqlCommand, [req.uuid]);
    if (results.rowCount === 1) {
      res.status(200).send(`${req.uuid}`);
    } else {
      res.status(404).send(`Product not found`);
    }
  } catch (err) {
    throw Error(err);
  }
});

module.exports = productsRouter;
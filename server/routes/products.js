const express = require('express');
const productsRouter = express.Router();
const db = require('../db/db');
const { validateGuid } = require('./guidRegEx');

/**
 * checks guid param,sets req.guid if guid param valid, else sets error
 * @param {String} - 'guid'; matches the route handler path variable (:guid)
 * @param {string} - guid - actual value of guid parameter in route path
 */

productsRouter.param('guid', (req, res, next, guid) => {
  try {
    if (validateGuid(guid)) {
      req.guid = guid;
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

  const sqlCommand = `SELECT * FROM products;`;  
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

productsRouter.get('/:guid', async (req, res) => {

  // GET request - get one product by guid
  // path: localhost:5000/products/guid
  //  where guid is the guid code for the product
  // body: not used

  const sqlCommand = `SELECT * FROM products WHERE guid = $1;`;
  try {
    const results = await db.query(sqlCommand, [req.guid]);      
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

productsRouter.put('/:guid', async (req, res) => {

  // PUT request
  // path: localhost:5000/products/guid
  //  where guid is the guid code for the product
  // body: JSON object
  //  {
  //    "name": "product",
  //    "category": "CATEGORY",
  //    "price": 12.34
  //    "description": "This is a product",
  //    "designer": "Designer name"
  //  }
  
  const { name, category, price, description, designer } = req.body;
  const rowValues = [name, category, price, description, designer, req.guid];
  const sqlCommand = `
    UPDATE products
    SET name = $1, 
        category = $2, 
        price = $3,
        description = $4, 
        designer = $5
    WHERE guid = $6
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

productsRouter.delete('/:guid', async (req, res) => {

  // DELETE request
  // path: localhost:5000/products/guid
  //  where guid is the guid code for the product
  // body: not used

  const sqlCommand = `DELETE FROM products WHERE guid = $1;`;
  try {
    const results = await db.query(sqlCommand, [req.guid]);
    if (results.rowCount === 1) {
      res.status(200).send(`${req.guid}`);
    } else {
      res.status(404).send(`Product not found`);
    }
  } catch (err) {
    throw Error(err);
  }
});

module.exports = productsRouter;
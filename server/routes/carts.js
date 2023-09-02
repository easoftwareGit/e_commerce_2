const express = require('express');
const cartsRouter = express.Router();
const db = require('../db/db');
const cartQueries = require('../db/cartQueries');
const orderQueries = require('../db/orderQueries');
const { validateGuid } = require('./guidRegEx');

/**
 * checks guid param,sets req.guid if guid param valid, else sets error
 * @param {String} - 'guid'; matches the route handler path variable (:guid)
 * @param {string} - guid - actual value of guid parameter in route path
 */

cartsRouter.param('guid', (req, res, next, guid) => {
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

cartsRouter.get('/', async (req, res) => {

  // GET request - get all carts
  // path: localhost:5000/carts
  // body: not used  

  const sqlCommand = `SELECT * FROM carts;`;  
  try {
    const results = await db.query(sqlCommand);
    if (db.validResultsAtLeast1Row(results) || results.rows.length === 0) { 
      res.status(200).json(results.rows);      
    } else {
      res.status(400).json('error getting carts');
    }
  } catch (err) {
    throw Error(err);
  }
});

cartsRouter.get('/:guid', async (req, res) => {

  // GET request - get one cart by guid
  // path: localhost:5000/carts/guid
  //  where guid is the guid code for the cart
  // body: not used

  try {
    const results = await cartQueries.getCart(req.guid);
    if (results.status === 200) {
      res.status(200).json(results.cart);
    } else {
      res.status(results.status).json(results.message);
    }
  } catch (err) {
    throw Error(err);
  }
});

cartsRouter.post('/', async (req, res) => {

  // POST request
  // path: localhost:5000/carts
  // body: JSON object
  //  {
  //    created: new Date("01/28/2023"),
  //    modified: new Date("01/28/2023"), (not required, will be set = created)
  //    user_id: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
  //  }
  
  const { created, user_guid } = req.body;
  const rowValues = [created, created, user_guid];
  const sqlCommand = `
    INSERT INTO carts (created, modified, user_guid) 
    VALUES ($1, $2, $3) 
    RETURNING *;`;
  try {
    const results = await db.query(sqlCommand, rowValues);
    if (db.validResultsAtLeast1Row(results)) {      
      res.status(201).json(results.rows[0]);      
    } else {
      res.status(404).json('Cart not inserted');
    }    
  } catch (err) {    
    if (err.code === '23505') {
      res.status(400).json('user_guid already used');
    } else if (err.code === '23502') {
      res.status(400).json('required value missing');
    } else {
      throw Error(err);
    }    
  }
});

cartsRouter.post('/:guid/checkout', async (req, res) => {

  // POST request
  // path: localhost:5000/carts/guid/checkout
  //  where guid is the guid code for the cart
  // body: JSON object
  //  {
  //    id: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
  //    created: new Date("01/28/2023"),
  //    modified: new Date("01/28/2023"), (not required, will be set = created)
  //    user_id: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
  //  }

  try {    
    const cart = req.body;
    const results = await orderQueries.moveCartToOrder(cart);
    if (results.status === 201) {
      res.status(201).json(results.order);
    } else {
      res.status(results.status).json(results.message);
    }    
  } catch (err) {
    throw Error(err);
  }
});

cartsRouter.put('/:guid', async (req, res) => {

  // PUT request
  // path: localhost:5000/carts/guid
  //  where guid is the guid code for the cart
  // body: JSON object
  //  {
  //    created: new Date("01/28/2023"), (not required, not used, cannot change created date)
  //    modified: new Date("01/28/2023"),
  //    user_id: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX (not requires, not used, cannot change user_guid)
  //  }
    
  const { modified } = req.body;
  const rowValues = [modified, req.guid];
  const sqlCommand = `
    UPDATE carts
    SET modified = $1        
    WHERE guid = $2
    RETURNING *;`;
  try {
    const results = await db.query(sqlCommand, rowValues);
    if (db.validResultsAtLeast1Row(results)) {
      res.status(200).send(results.rows[0]);      
    } else {      
      res.status(404).send(`Cart not found`);
    };
  } catch (err) {
    if (err.code === '23505') {
      res.status(400).json('user_guid already used');
    } else if (err.code === '23502') {
      res.status(400).json('required value missing');
    } else if (err.code === '23503') {
      res.status(409).json(err.message);
    } else {
      throw Error(err);
    }    
  }
});

cartsRouter.delete('/:guid', async (req, res) => {

  // DELETE request
  // path: localhost:5000/carts/guid
  //  where guid is the guid code for the cart
  // body: not used
  
  try {
    const results = await cartQueries.deleteCart(req.guid);
    if (results) {
      if (results.status === 200) {      
        res.status(200).send(`${req.guid}`);
      } else {
        if (results.status === 404) {
          res.status(404).send(`Cart not found`);
        } else if (results.status === 409) {
          res.status(409).send('Cannot delete - constraint error');
        } else {
          res.status(400).send('Unknown error');
        }      
      }
    } else {
      res.status(400).send('Unknown error');
    }
  } catch (err) {
    throw Error(err);
  }
});

/**
 * checks itemGuid param,sets req.itemGuid if itemGuid param valid, else sets error
 * @param {String} - 'itemGuid'; matches the route handler path variable (:itemGuid)
 * @param {string} - itemGuid - actual value of id parameter in route path
 */

cartsRouter.param('itemGuid', (req, res, next, itemGuid) => {
  try {
    if (validateGuid(itemGuid)) {
      req.itemGuid = itemGuid;
      next();
    } else {
      next(res.status(404).json('Invalid parameter'))
    }
  } catch (error) {
    next(err);
  }
});

cartsRouter.get('/:guid/items', async (req, res) => {

  // GET request
  // path: localhost:5000/carts/#/items
  //  where guid is the guid code for the cart
  // body: not used

  try {
    const results = await cartQueries.getAllItemsForCart(req.guid);
    if (results) {
      res.status(200).json(results);
    } else {
      res.status(404).json('Cart items not found');
    }
  } catch (err) {
    throw Error(err);
  }
});

cartsRouter.get('/items/:itemGuid', async (req, res) => {

  // GET request
  // path: localhost:5000/carts/guid/items/itemGuid
  //  where guid is the guid code for the cart, and itemGuid is the guid code of the cart_item
  // body: not used

  const sqlCommand = `SELECT * FROM cart_items WHERE guid = $1;`;
  try {
    const results = await db.query(sqlCommand, [req.itemGuid]); 
    if (db.validResultsAtLeast1Row(results)) {      
      res.status(200).json(results.rows[0]);
    } else {        
      res.status(404).json('Cart item not found');
    }    
  } catch (err) {
    throw Error(err);
  }
});

cartsRouter.post('/:guid/items', async (req, res) => {

  // POST request
  // path: localhost:5000/carts/#/items
  //  where guid is the guid code for the cart
  // body: JSON object
  //  {
  //    cart_guid: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
  //    product_guid: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
  //    quantity: 2
  //  }
    
  const { product_guid, quantity } = req.body;
  const rowValues = [req.guid, product_guid, quantity];
  const sqlCommand = `
    INSERT INTO cart_items (cart_guid, product_guid, quantity) 
    VALUES ($1, $2, $3) RETURNING *;`;
  try {
    const results = await db.query(sqlCommand, rowValues);
    if (db.validResultsAtLeast1Row(results)) {      
      res.status(201).json(results.rows[0]);      
    } else {
      res.status(404).json('Cart item not inserted');
    }    
  } catch (err) {    
    if (err.code === '23502') {
      res.status(400).json('required value missing');
    } else if (err.code === '23503') {
      res.status(409).json(err.message);
    } else {
      throw Error(err);
    }    
  }
});

cartsRouter.put('/items/:itemGuid', async (req, res) => {

  // PUT request
  // path: localhost:5000/carts/guid/items/itemGuid
  //  where guid is the guid code for the cart, and itemGuid is the guid code of the cart item
  // body: JSON object
  //  {
  //    product_guid: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
  //    quantity: 2
  //  }
  
  const itemGuid = req.params.itemGuid; 
  const { product_guid, quantity } = req.body;
  const rowValues = [product_guid, quantity, itemGuid];
  const sqlCommand = `
    UPDATE cart_items
    SET product_guid = $1, 
        quantity = $2        
    WHERE guid = $3
    RETURNING *;`;
  try {
    const results = await db.query(sqlCommand, rowValues);
    if (db.validResultsAtLeast1Row(results)) {
      res.status(200).send(results.rows[0]);      
    } else {      
      res.status(404).send(`Cart item not found`);
    };
  } catch (err) {
    if (err.code === '23502') {
      res.status(400).json('required value missing');
    } else if (err.code === '23503') {
      res.status(409).json(err.message);
    } else {
      throw Error(err);
    }    
  }
});

cartsRouter.delete('/items/:itemGuid', async (req, res) => {

  // DELETE request
  // path: localhost:5000/carts/#
  //  where itemGuid is the guid code for the cart item
  // body: not used
    
  const sqlCommand = `DELETE FROM cart_items WHERE guid = $1;`;
  try {
    const results = await db.query(sqlCommand, [req.itemGuid]);
    if (results.rowCount === 1) {
      res.status(200).send(`${req.itemGuid}`);
    } else {
      res.status(404).send(`Cart item not found`);
    }
  } catch (err) {
    throw Error(err);
  }
});

cartsRouter.delete('/:guid/allItems', async (req, res) => {

  // DELETE request
  // path: localhost:5000/carts/#
  //  where guid is the guid code for the cart
  // body: not used
    
  try {    
    const results = await cartQueries.deleteCartItems(req.guid);
    // deleteCartItems returns # of rows deleted. 
    // 0 rows is valid, so error on null, empty strings, false, undefined
    if (!results && results !== 0) {
      res.status(404).send('Could not delete cart items');
    } else {
      res.status(200).send(`${req.guid}`);
    }
  } catch (err) {
    throw Error(err);
  }
});

module.exports = cartsRouter;
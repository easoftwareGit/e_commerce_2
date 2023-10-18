const express = require('express');
const cartsRouter = express.Router();
const db = require('../db/db');
const cartQueries = require('../db/cartQueries');
const orderQueries = require('../db/orderQueries');
const { validateUuid } = require('./uuidRegEx');

/**
 * checks uuid param,sets req.uuid if uuid param valid, else sets error
 * @param {String} - 'uuid'; matches the route handler path variable (:uuid)
 * @param {string} - uuid - actual value of uuid parameter in route path
 */

cartsRouter.param('uuid', (req, res, next, uuid) => {
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

cartsRouter.get('/', async (req, res) => {

  // GET request - get all carts
  // path: localhost:5000/api/carts
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

cartsRouter.get('/cart/:uuid', async (req, res) => {

  // GET request - get one cart by cart uuid
  // path: localhost:5000/api/carts/cart/uuid
  //  where uuid is the uuid code for the cart
  // body: not used

  try { 
    const results = await cartQueries.getCartByCartUuid(req.uuid);
    if (results.status === 200) {
      res.status(200).json(results.cart);
    } else {
      res.status(results.status).json(results.message);
    }
  } catch (err) {
    throw Error(err);
  }
});

cartsRouter.get('/user/:uuid', async (req, res) => {

  // GET request - get one cart by user uuid
  // path: localhost:5000/api/carts/user/uuid
  //  where uuid is the uuid code for the user
  // body: not used

  try {
    const results = await cartQueries.getCartByUserUuid(req.uuid);
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
  // path: localhost:5000/api/carts
  // body: JSON object
  //  {
  //    created: new Date("01/28/2023"),
  //    modified: new Date("01/28/2023"), (not required, will be set = created)
  //    user_id: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
  //  }
  
  const { created, user_uuid } = req.body;
  const rowValues = [created, created, user_uuid];
  const sqlCommand = `
    INSERT INTO carts (created, modified, user_uuid) 
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
      res.status(400).json('user_uuid already used');
    } else if (err.code === '23502') {
      res.status(400).json('required value missing');
    } else if (err.code === '22008' && err.routine && err.routine === 'DateTimeParseError') {
      res.status(400).json('invalid date format');
    } else {
      throw Error(err);
    }    
  }
});


cartsRouter.post('/fullcartrow', async (req, res) => {

  // POST request
  // path: localhost:5000/api/carts
  // body: JSON object
  //  {
  //    uuid: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
  //    created: new Date("01/28/2023"),
  //    modified: new Date("01/28/2023"), 
  //    user_id: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
  //  }
  
  const { uuid, created, modified, user_uuid } = req.body;
  const rowValues = [uuid, created, modified, user_uuid];
  const sqlCommand = `
    INSERT INTO carts (uuid, created, modified, user_uuid) 
    VALUES ($1, $2, $3, $4) 
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
      res.status(400).json('user_uuid already used');
    } else if (err.code === '23502') {
      res.status(400).json('required value missing');
    } else if (err.code === '22008' && err.routine && err.routine === 'DateTimeParseError') {
      res.status(400).json('invalid date format');
    } else {
      throw Error(err);
    }    
  }
});


cartsRouter.post('/:uuid/checkout', async (req, res) => {

  // POST request
  // path: localhost:5000/api/carts/uuid/checkout
  //  where uuid is the uuid code for the cart
  // body: JSON object
  //  {
  //    uuid: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
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

cartsRouter.put('/:uuid', async (req, res) => {

  // PUT request
  // path: localhost:5000/api/carts/uuid
  //  where uuid is the uuid code for the cart
  // body: JSON object
  //  {
  //    created: new Date("01/28/2023"), (not required, not used, cannot change created date)
  //    modified: new Date("01/28/2023"),
  //    user_id: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX (not required, not used, cannot change user_uuid)
  //  }
    
  const { modified } = req.body;
  try {
    const results = await cartQueries.updateCartModifiedDate(req.uuid, modified);
    if (results.status === 200) {
      res.status(200).send(results.cart)
    } else {
      res.status(404).send(`Cart not found`);
    }
  } catch (err) {  
    if (!err.code) {      
      if (err.message && err.message.includes('null value in column')) {
        res.status(400).json('required value missing');
      } else {
        throw Error(err)
      }
    } else if (err.code === '23502') {
      res.status(400).json('required value missing');
    } else if (err.code === '23503') {
      res.status(409).json(err.message);
    } else {
      throw Error(err);
    }    
  }
});

cartsRouter.delete('/:uuid', async (req, res) => {

  // DELETE request
  // path: localhost:5000/api/carts/uuid
  //  where uuid is the uuid code for the cart
  // body: not used
  
  try {
    const results = await cartQueries.deleteCart(req.uuid);
    if (results) {
      if (results.status === 200) {      
        res.status(200).send(`${req.uuid}`);
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
 * checks itemUuid param,sets req.itemUuid if itemUuid param valid, else sets error
 * @param {String} - 'itemUuid'; matches the route handler path variable (:itemUuid)
 * @param {string} - itemUuid - actual value of id parameter in route path
 */

cartsRouter.param('itemUuid', (req, res, next, itemUuid) => {
  try {
    if (validateUuid(itemUuid)) {
      req.itemUuid = itemUuid;
      next();
    } else {
      next(res.status(404).json('Invalid parameter'))
    }
  } catch (error) {
    next(err);
  }
});

cartsRouter.get('/:uuid/items', async (req, res) => {

  // GET request
  // path: localhost:5000/api/carts/#/items
  //  where uuid is the uuid code for the cart
  // body: not used

  try {
    const results = await cartQueries.getAllItemsForCart(req.uuid);
    if (results) {
      res.status(200).json(results);
    } else {
      res.status(404).json('Cart items not found');
    }
  } catch (err) {
    throw Error(err);
  }
});

cartsRouter.get('/items/:itemUuid', async (req, res) => {

  // GET request
  // path: localhost:5000/api/carts/uuid/items/itemUuid
  //  where uuid is the uuid code for the cart, and itemUuid is the uuid code of the cart_item
  // body: not used

  const sqlCommand = `SELECT * FROM cart_items WHERE uuid = $1;`;
  try {
    const results = await db.query(sqlCommand, [req.itemUuid]); 
    if (db.validResultsAtLeast1Row(results)) {      
      res.status(200).json(results.rows[0]);
    } else {        
      res.status(404).json('Cart item not found');
    }    
  } catch (err) {
    throw Error(err);
  }
});

cartsRouter.post('/:uuid/items', async (req, res) => {

  // POST request
  // path: localhost:5000/api/carts/uuid/items
  //  where uuid is the uuid code for the cart
  // body: JSON object
  //  {
  //    product_uuid: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
  //    quantity: 2
  //  }

  const { product_uuid, quantity } = req.body;
  const rowValues = [req.uuid, product_uuid, quantity];
  const sqlCommand = `
    INSERT INTO cart_items (cart_uuid, product_uuid, quantity) 
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

cartsRouter.put('/items/:itemUuid', async (req, res) => {

  // PUT request
  // path: localhost:5000/api/carts/uuid/items/itemUuid
  //  where uuid is the uuid code for the cart, and itemUuid is the uuid code of the cart item
  // body: JSON object
  //  {
  //    quantity: 2
  //  }
  //  note: no need to change anything but the quantity
  
  const itemUuid = req.params.itemUuid; 
  const { quantity } = req.body;
  const rowValues = [ quantity, itemUuid];
  const sqlCommand = `
    UPDATE cart_items
    SET quantity = $1
    WHERE uuid = $2
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

cartsRouter.delete('/items/:itemUuid', async (req, res) => {

  // DELETE request
  // path: localhost:5000/api/carts/#
  //  where itemUuid is the uuid code for the cart item
  // body: not used
    
  const sqlCommand = `DELETE FROM cart_items WHERE uuid = $1;`;
  try {
    const results = await db.query(sqlCommand, [req.itemUuid]);
    if (results.rowCount === 1) {
      res.status(200).send(`${req.itemUuid}`);
    } else {
      res.status(404).send(`Cart item not found`);
    }
  } catch (err) {
    throw Error(err);
  }
});

cartsRouter.delete('/:uuid/allItems', async (req, res) => {

  // DELETE request
  // path: localhost:5000/api/carts/#
  //  where uuid is the uuid code for the cart
  // body: not used
    
  try {    
    const results = await cartQueries.deleteCartItems(req.uuid);
    // deleteCartItems returns # of rows deleted. 
    // 0 rows is valid, so error on null, empty strings, false, undefined
    if (!results && results !== 0) {
      res.status(404).send('Could not delete cart items');
    } else {
      res.status(200).send(`${req.uuid}`);
    }
  } catch (err) {
    throw Error(err);
  }
});

module.exports = cartsRouter;
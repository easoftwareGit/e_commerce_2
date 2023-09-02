const express = require('express');
const ordersRouter = express.Router();
const db = require('../db/db');
const orderQueries = require('../db/orderQueries');
const { validateGuid } = require('./guidRegEx');

/**
 * checks guid param,sets req.guid if guid param valid, else sets error
 * @param {String} - 'guid'; matches the route handler path variable (:guid)
 * @param {string} - guid - actual value of guid parameter in route path
 */

ordersRouter.param('guid', (req, res, next, guid) => {
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

ordersRouter.get('/', async (req, res) => {

  // GET request - get all orders
  // path: localhost:5000/orders
  // body: not used

  const sqlCommand = `SELECT * FROM orders`;
  try {
    const results = await db.query(sqlCommand); 
    if (db.validResultsAtLeast1Row(results) || results.rows.length === 0) {      
      res.status(200).json(results.rows);
    } else {        
      res.status(400).json('error getting orders');
    }    
  } catch (err) {
    throw Error(err);
  }
});

ordersRouter.get('/:guid', async (req, res) => {

  // GET request - get one order by guid
  // path: localhost:5000/orders/guid 
  //  where guid is the guid code for the order
  // body: not used

  const sqlCommand = `SELECT * FROM orders WHERE guid = $1`;
  try {
    const results = await db.query(sqlCommand, [req.guid]); 
    if (db.validResultsAtLeast1Row(results)) {      
      res.status(200).json(results.rows[0]);
    } else {        
      res.status(404).json('Order not found');
    }    
  } catch (err) {
    throw Error(err);
  }
});

ordersRouter.post('/', async (req, res) => {

  // POST request
  // path: localhost:5000/orders
  // body: JSON object
  //  {
  //    created: new Date("01/28/2023"),
  //    modified: new Date("01/28/2023"), (not required, will be set = created)
  //    status: 'Created',                (not required will be set = 'Created')
  //    total_price: 123.45,
  //    user_guid: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
  //  }
  //  note: 
  //    on a post, modified = created
  //    status = 'Created'
  
  try {
    const results = await orderQueries.createNewOrder(req.body);
    if (results.status === 201) {
      res.status(201).json(results.order);
    } else {
      res.status(results.status).json(results.message);
    }
  } catch (err) {
    if (err.message && err.message.includes('violates foreign key constraint')) {
      res.status(409).json(err.message);
    } else if (err.message && err.message.includes('invalid input syntax')) {
      res.status(400).json(err.message);
    } else {
      throw Error(err)
    }
  }
});

ordersRouter.put('/:guid', async (req, res) => {

  // PUT request
  // path: localhost:5000/orders/#
  //  where guid is the guid code for the order
  // body: JSON object
  //  {  
  //    modified: new Date("01/28/2023"), 
  //    status: 'Updated',
  //    total_price: 123.45,
  //    user_guid: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
  //  }
  //  note: created column NEVER updated in PUT route
    
  const { modified, status, total_price, user_guid } = req.body;
  const rowValues = [modified, status, total_price, user_guid, req.guid];
  const sqlCommand = `
    UPDATE orders
    SET modified = $1, 
        status = $2,
        total_price = $3,
        user_guid = $4
    WHERE guid = $5
    RETURNING *`;
  try {
    const results = await db.query(sqlCommand, rowValues);
    if (db.validResultsAtLeast1Row(results)) {
      res.status(200).send(results.rows[0]);      
    } else {      
      res.status(404).send(`Order not found`);
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

ordersRouter.delete('/:guid', async (req, res) => {

  // DELETE request
  // path: localhost:5000/orders/guid
  //  where guid is the guid code for the order
  // body: not used
  
  const sqlCommand = `DELETE FROM orders WHERE guid = $1`;
  try {
    const results = await db.query(sqlCommand, [req.guid]);
    if (results.rowCount === 1) {
      res.status(200).send(`${req.guid}`);
    } else {
      res.status(404).send(`Order not found`);
    }
  } catch (err) {
    if (err.code === '23503') {
      res.status(409).send('Cannot delete - constraint error');
    } else {
      throw Error(err);
    }
  }
});

/**
 * checks itemGuid param,sets req.itemGuid if itemGuid param valid, else sets error
 * @param {String} - 'itemGuid'; matches the route handler path variable (:itemGuid)
 * @param {string} - itemGuid - actual value of id parameter in route path
 */

ordersRouter.param('itemGuid', (req, res, next, itemGuid) => {
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

ordersRouter.get('/:guid/items', async (req, res) => {

  // GET request
  // path: localhost:5000/orders/#/items
  //  where guid is the guid code for the order
  // body: not used

  const sqlCommand = `
    SELECT order_items.guid, order_guid, product_guid, quantity, price_unit,
           products.name, products.category, products.description, 
           products.designer, (price_unit * quantity) AS item_total
    FROM order_items
    INNER JOIN products ON (products.guid = order_items.product_guid)
    WHERE order_guid = $1;`;
  try {
    const results = await db.query(sqlCommand, [req.guid]); 
    if (db.validResultsAtLeast1Row(results)) {      
      res.status(200).json(results.rows);
    } else {        
      res.status(404).json('Order items not found');
    }    
  } catch (err) {
    throw Error(err);
  }
});

ordersRouter.get('/items/:itemGuid', async (req, res) => {

  // GET request
  // path: localhost:5000/orders/guid/items/itemGuid
  //  where guid is the guid code for the order, and itemGuid is the guid code of the order item
  // body: not used

  const sqlCommand = `SELECT * FROM order_items WHERE guid = $1`;
  try {
    const results = await db.query(sqlCommand, [req.itemGuid]); 
    if (db.validResultsAtLeast1Row(results)) {      
      res.status(200).json(results.rows[0]);
    } else {        
      res.status(404).json('Order item not found');
    }    
  } catch (err) {
    throw Error(err);
  }
});

ordersRouter.post('/:guid/items', async (req, res) => {

  // POST request
  // path: localhost:5000/orders/#/items
  //  where guid is the guid code for the order
  // body: JSON object
  //  {
  //    product_guid: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
  //    quantity: 2
  //    price_unit: 12.34
  //  }
      
  const orderItem = req.body;
  orderItem.order_guid = req.guid;
  try {
    const results = await orderQueries.createOrderItem(orderItem);
    if (results.status === 201) {
      res.status(201).json(results.orderItem);
    } else {
      res.status(results.status).json(results.message);
    }
  } catch (err) {
    throw Error(err);
  }  
});

ordersRouter.put('/items/:itemGuid', async (req, res) => {

  // PUT request
  // path: localhost:5000/orders/guid/items/itemGuid
  //  where guid is the guid code for the order, and itemGuid is the guid code of the order item
  // body: JSON object
  //  {
  //    product_guid: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
  //    quantity: 2
  //    price_unit: 12.34
  //  }
  
  const itemGuid = req.params.itemGuid; 
  const { product_guid, quantity, price_unit } = req.body;
  const rowValues = [product_guid, quantity, price_unit, itemGuid];
  const sqlCommand = `
    UPDATE order_items
    SET product_guid = $1, 
        quantity = $2,
        price_unit = $3
    WHERE guid = $4
    RETURNING *`;
  try {
    const results = await db.query(sqlCommand, rowValues);
    if (db.validResultsAtLeast1Row(results)) {
      res.status(200).send(results.rows[0]);      
    } else {      
      res.status(404).send(`Order item not found`);
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

ordersRouter.delete('/items/:itemGuid', async (req, res) => {

  // DELETE request
  // path: localhost:5000/orders/guid
  //  where itemGuid is the guid code for the order item
  // body: not used
    
  const sqlCommand = `DELETE FROM order_items WHERE guid = $1`;
  try {
    const results = await db.query(sqlCommand, [req.itemGuid]);
    if (results.rowCount === 1) {
      res.status(200).send(`${req.itemGuid}`);
    } else {
      res.status(404).send(`Order item not found`);
    }
  } catch (err) {
    if (err.code === '23503') {
      res.status(409).send('Cannot delete - constraint error');
    } else {
      throw Error(err);
    }
  }
});

ordersRouter.delete('/:guid/allItems', async (req, res) => {

  // DELETE request
  // path: localhost:5000/orders/guid
  //  where guid is the guid for the order
  // body: not used
    
  const sqlCommand = `DELETE FROM order_items WHERE order_guid = $1`;
  try {
    const results = await db.query(sqlCommand, [req.guid]);
    if (results.rowCount > 0) {
      res.status(200).send(`${req.guid}`);
    } else {
      res.status(404).send(`Order items not found`);
    }
  } catch (err) {
    if (err.code === '23503') {
      res.status(409).send('Cannot delete - constraint error');
    } else {
      throw Error(err);
    }
  }
});

module.exports = ordersRouter;
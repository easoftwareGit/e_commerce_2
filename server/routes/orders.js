const express = require('express');
const ordersRouter = express.Router();
const db = require('../db/db');
const orderQueries = require('../db/orderQueries');
const { validateUuid } = require('./uuidRegEx');

/**
 * checks uuid param,sets req.uuid if uuid param valid, else sets error
 * @param {String} - 'uuid'; matches the route handler path variable (:uuid)
 * @param {string} - uuid - actual value of uuid parameter in route path
 */

ordersRouter.param('uuid', (req, res, next, uuid) => {
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

ordersRouter.get('/:uuid', async (req, res) => {

  // GET request - get one order by uuid
  // path: localhost:5000/orders/uuid 
  //  where uuid is the uuid code for the order
  // body: not used

  const sqlCommand = `SELECT * FROM orders WHERE uuid = $1`;
  try {
    const results = await db.query(sqlCommand, [req.uuid]); 
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
  //    user_uuid: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
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

ordersRouter.put('/:uuid', async (req, res) => {

  // PUT request
  // path: localhost:5000/orders/#
  //  where uuid is the uuid code for the order
  // body: JSON object
  //  {  
  //    modified: new Date("01/28/2023"), 
  //    status: 'Updated',
  //    total_price: 123.45,
  //    user_uuid: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
  //  }
  //  note: created column NEVER updated in PUT route
    
  const { modified, status, total_price, user_uuid } = req.body;
  const rowValues = [modified, status, total_price, user_uuid, req.uuid];
  const sqlCommand = `
    UPDATE orders
    SET modified = $1, 
        status = $2,
        total_price = $3,
        user_uuid = $4
    WHERE uuid = $5
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

ordersRouter.delete('/:uuid', async (req, res) => {

  // DELETE request
  // path: localhost:5000/orders/uuid
  //  where uuid is the uuid code for the order
  // body: not used
  
  const sqlCommand = `DELETE FROM orders WHERE uuid = $1`;
  try {
    const results = await db.query(sqlCommand, [req.uuid]);
    if (results.rowCount === 1) {
      res.status(200).send(`${req.uuid}`);
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
 * checks itemUuid param,sets req.itemUuid if itemUuid param valid, else sets error
 * @param {String} - 'itemUuid'; matches the route handler path variable (:itemUuid)
 * @param {string} - itemUuid - actual value of id parameter in route path
 */

ordersRouter.param('itemUuid', (req, res, next, itemUuid) => {
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

ordersRouter.get('/:uuid/items', async (req, res) => {

  // GET request
  // path: localhost:5000/orders/#/items
  //  where uuid is the uuid code for the order
  // body: not used

  const sqlCommand = `
    SELECT order_items.uuid, order_uuid, product_uuid, quantity, price_unit,
           products.name, products.category, products.description, 
           products.designer, (price_unit * quantity) AS item_total
    FROM order_items
    INNER JOIN products ON (products.uuid = order_items.product_uuid)
    WHERE order_uuid = $1;`;
  try {
    const results = await db.query(sqlCommand, [req.uuid]); 
    if (db.validResultsAtLeast1Row(results)) {      
      res.status(200).json(results.rows);
    } else {        
      res.status(404).json('Order items not found');
    }    
  } catch (err) {
    throw Error(err);
  }
});

ordersRouter.get('/items/:itemUuid', async (req, res) => {

  // GET request
  // path: localhost:5000/orders/uuid/items/itemUuid
  //  where uuid is the uuid code for the order, and itemUuid is the uuid code of the order item
  // body: not used

  const sqlCommand = `SELECT * FROM order_items WHERE uuid = $1`;
  try {
    const results = await db.query(sqlCommand, [req.itemUuid]); 
    if (db.validResultsAtLeast1Row(results)) {      
      res.status(200).json(results.rows[0]);
    } else {        
      res.status(404).json('Order item not found');
    }    
  } catch (err) {
    throw Error(err);
  }
});

ordersRouter.post('/:uuid/items', async (req, res) => {

  // POST request
  // path: localhost:5000/orders/#/items
  //  where uuid is the uuid code for the order
  // body: JSON object
  //  {
  //    product_uuid: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
  //    quantity: 2
  //    price_unit: 12.34
  //  }
      
  const orderItem = req.body;
  orderItem.order_uuid = req.uuid;
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

ordersRouter.put('/items/:itemUuid', async (req, res) => {

  // PUT request
  // path: localhost:5000/orders/uuid/items/itemUuid
  //  where uuid is the uuid code for the order, and itemUuid is the uuid code of the order item
  // body: JSON object
  //  {
  //    product_uuid: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
  //    quantity: 2
  //    price_unit: 12.34
  //  }
  
  const itemUuid = req.params.itemUuid; 
  const { product_uuid, quantity, price_unit } = req.body;
  const rowValues = [product_uuid, quantity, price_unit, itemUuid];
  const sqlCommand = `
    UPDATE order_items
    SET product_uuid = $1, 
        quantity = $2,
        price_unit = $3
    WHERE uuid = $4
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

ordersRouter.delete('/items/:itemUuid', async (req, res) => {

  // DELETE request
  // path: localhost:5000/orders/uuid
  //  where itemUuid is the uuid code for the order item
  // body: not used
    
  const sqlCommand = `DELETE FROM order_items WHERE uuid = $1`;
  try {
    const results = await db.query(sqlCommand, [req.itemUuid]);
    if (results.rowCount === 1) {
      res.status(200).send(`${req.itemUuid}`);
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

ordersRouter.delete('/:uuid/allItems', async (req, res) => {

  // DELETE request
  // path: localhost:5000/orders/uuid
  //  where uuid is the uuid for the order
  // body: not used
    
  const sqlCommand = `DELETE FROM order_items WHERE order_uuid = $1`;
  try {
    const results = await db.query(sqlCommand, [req.uuid]);
    if (results.rowCount > 0) {
      res.status(200).send(`${req.uuid}`);
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
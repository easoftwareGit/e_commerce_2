const db = require('./db');
const cartQueries = require('./cartQueries');

/**
 * creates a new order
 *  note: when creating an order: 
 *    modified: date is set to created date
 *    status: set to created
 *
 * @param {Object} order 
 * @return {Object} Object = 
 *    success: { status: 201, order: order data }
 *    err: { status:404, message: error message }
 */
async function createNewOrder(order) {
  const { created, total_price, user_uuid } = order;
  const rowValues = [created, created, 'Created', total_price, user_uuid];
  const sqlCommand = `
    INSERT INTO orders(created, modified, status, total_price, user_uuid) 
    VALUES ($1, $2, $3, $4, $5) 
    RETURNING *`;
  try {
    const results = await db.query(sqlCommand, rowValues);
    if (db.validResultsAtLeast1Row(results)) {  
      return {
        status: 201,
        order: results.rows[0]
      }
    } else {
      return {
        status: 404,
        message: 'Order not inserted'
      } 
    }    
  } catch (err) {
    if (err.code === '23502') {
      return {
        status: 400,
        message: 'required value missing'
      }
    } else {
      throw Error(err);
    }        
  }
};

/**
 * creates an order item
 *
 * @param {Object} orderItem 
 * @return {Object} Object = 
 *    success: { status: 201, orderItem: orderItem data} 
 *    err: { status:404, message: error message }
 */
async function createOrderItem(orderItem) {
  const { order_uuid, product_uuid, quantity, price_unit } = orderItem;
  const rowValues = [order_uuid, product_uuid, quantity, price_unit];
  const sqlCommand = `
    INSERT INTO order_items (order_uuid, product_uuid, quantity, price_unit) 
    VALUES ($1, $2, $3, $4) RETURNING *`;
  try {
    const results = await db.query(sqlCommand, rowValues);
    if (db.validResultsAtLeast1Row(results)) {
      return {
        status: 201,
        orderItem: results.rows[0]
      }
    } else {
      return {
        status: 404,
        message: 'Order item not inserted'
      } 
    }
  } catch (err) {
    if (err.code === '23502') {
      return {
        status: 400,
        message: 'required value missing'
      }
    } else if (err.code === '23503') {
      return {
        status: 409,
        message: err.message
      }
    } else {
      throw Error(err);
    }    
  }
};

/**
 * creates order items from a cart
 *
 * @param {String} orderUuid - order uuid to link new order items
 * @param {Array} cartItems - array of cart item onjects
 * @returns {Array|null} Array = objects of order data from cart; null = no cart items
 */
async function createOrderItems(orderUuid, cartItems) {

  try {
    const orderItems = [];
    await Promise.all(cartItems.map(async (item) => {
      item.order_uuid = orderUuid;
      const results = await createOrderItem(item);
      if (results.status === 201) {
        orderItems.push(results.orderItem);
      } else {
        return results;
      } 
    }));
    return {
      status: 201,
      orderItems: orderItems
    }
  } catch (err) {
    throw Error(err);
  }
};

/**
 * inserts a new order from a cart
 *
 * @param {Object} cart - cart object to insert from
 * @param {Decimal} total_price - total price for all items in cart
 * @return {Object|null} Object = order inserted; null = error inserting
 */
async function insertOrderFromCart(cart, total_price) {
  const created = new Date(Date.now())
  const newOrder = {
    created: created,
    modified: created,
    total_price: total_price,
    user_uuid: cart.user_uuid,
  }
  const results = await createNewOrder(newOrder);
  if (results.status === 201) {
    return results.order;
  } else {
    return results;
  }
};

/**
 * inserts cart items into an order's items
 *
 * @param {String} orderUuid - order uuid to link new order items
 * @param {String} cartUuid - cart uuid with cart items to move to order
 * @return {Integer|null} Integer = # of rows inserted; null = error inserting
 */
async function insertOrdersItemsFromCartItems(orderUuid, cartUuid) {
  const sqlcommand = `
    INSERT INTO order_items (order_uuid, product_uuid, quantity, price_unit)
    SELECT $1, cart_items.product_uuid, cart_items.quantity, products.price
    FROM cart_items
    INNER JOIN products ON (products.uuid = cart_items.product_uuid)
    WHERE cart_items.cart_uuid = $2`;
  const queryValues = [orderUuid, cartUuid];
  try {
    const results = await db.query(sqlcommand, queryValues);
    if (results  && results.rowCount) {
      return results.rowCount;
    } else {
      return null;
    }
  } catch (err) {
    throw Error(err);
  }
};

/**
 * moves a cart into orders
 * note: this function assumes there are cart items
 *  1) get total price for cart
 *  2) creates a new order row from cart
 *  3) inserts cart items into order items linked to new order
 *  4) removes items from cart
 *  5) updates cart modified date
 *
 * @param {Object} cart
 * @return {Object} Object = 
 *    success: { status: 201, order: order data } 
 *    err: { status:404, message: error message }
 */
async function moveCartToOrder(cart) {

  try {
    // get total price from cart
    const totalPrice = await cartQueries.getCartTotalPrice(cart.uuid);
    if (!totalPrice) {
      return {
        status: 400,
        message: 'Could not get total price from cart'
      }
    }
    // create new order from cart
    const newOrder = await insertOrderFromCart(cart, totalPrice)
    if (!newOrder) {
      return {
        status: 400,
        message: 'Could not create new order from cart'
      }
    }
    // move cart items into order items linking to new order
    const newOrderUuid = newOrder.uuid;
    let insertedItemCount = await insertOrdersItemsFromCartItems(newOrderUuid, cart.uuid);
    if (!insertOrderFromCart) {
      return {
        status: 400,
        message: 'Could not move cart items into order items'
      }
    }
    // delete cart items
    const movedItemCount = await cartQueries.deleteCartItems(cart.uuid);
    if (movedItemCount !== insertedItemCount) {
      return {
        status: 400,
        message: 'Wrong number of cart items removed'
      }              
    }
    // update modified date of cart
    // no need to delete cart
    const modified = new Date(Date.now());
    const updatedCartResults = await cartQueries.updateCartModifiedDate(cart.uuid, modified);
    if (updatedCartResults.status === 200) {
      // even though updateCartModifiedDate returns status 200
      // return 201 here because new order was created
      return {
        status: 201,
        order: newOrder        
      }
    } else {
      return {
        status: 400,
        message: 'Could not update cart'
      }
    }
  } catch (err) {
    throw Error(err);
  }
}


/**
 * gets all order items for a user for all user's orders
 *
 * @param {String} userUuid - uuid code for user
 * @return {Array|null} Array = objects of order items data; mull = no data found for user
 */
async function getOrderItemsForUser(userUuid) {
  const sqlCommand = `
    SELECT order_items.uuid, order_items.order_uuid, order_items.product_uuid,
          quantity, price_unit,
          (quantity * products.price) AS item_total, products.name	     
    FROM order_items
    INNER JOIN products ON (products.uuid = order_items.product_uuid)
    INNER JOIN orders ON (orders.uuid = order_items.order_uuid)
    WHERE (orders.user_uuid = $1)`;
  try {
    const results = await db.query(sqlCommand, [userUuid]);
    if (db.validResultsAtLeast1Row(results)) {
      return results.rows;
    } else {
      return null;
    }    
  } catch (err) {
    throw Error(err);
  }    
}

module.exports = {
  createNewOrder,
  createOrderItem,
  createOrderItems,
  insertOrderFromCart,
  insertOrdersItemsFromCartItems,
  moveCartToOrder,
  getOrderItemsForUser
}
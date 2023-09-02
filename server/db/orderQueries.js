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
  const { created, total_price, user_guid } = order;
  const rowValues = [created, created, 'Created', total_price, user_guid];
  const sqlCommand = `
    INSERT INTO orders(created, modified, status, total_price, user_guid) 
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
  const { order_guid, product_guid, quantity, price_unit } = orderItem;
  const rowValues = [order_guid, product_guid, quantity, price_unit];
  const sqlCommand = `
    INSERT INTO order_items (order_guid, product_guid, quantity, price_unit) 
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
 * @param {String} orderGuid - order guid to link new order items
 * @param {Array} cartItems - array of cart item onjects
 * @returns {Array|null} Array = objects of order data from cart; null = no cart items
 */
async function createOrderItems(orderGuid, cartItems) {

  try {
    const orderItems = [];
    await Promise.all(cartItems.map(async (item) => {
      item.order_guid = orderGuid;
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
    user_guid: cart.user_guid,
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
 * @param {String} orderGuid - order guid to link new order items
 * @param {String} cartGuid - cart guid with cart items to move to order
 * @return {Integer|null} Integer = # of rows inserted; null = error inserting
 */
async function insertOrdersItemsFromCartItems(orderGuid, cartGuid) {
  const sqlcommand = `
    INSERT INTO order_items (order_guid, product_guid, quantity, price_unit)
    SELECT $1, cart_items.product_guid, cart_items.quantity, products.price
    FROM cart_items
    INNER JOIN products ON (products.guid = cart_items.product_guid)
    WHERE cart_items.cart_guid = $2`;
  const queryValues = [orderGuid, cartGuid];
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
 *  5) removes cart
 *
 * @param {Object} cart
 * @return {Object} Object = 
 *    success: { status: 201, order: order data} 
 *    err: { status:404, message: error message }
 */
async function moveCartToOrder(cart) {

  try {
    const totalPrice = await cartQueries.getCartTotalPrice(cart.guid);
    if (totalPrice) {
      // create new order from cart
      const newOrder = await insertOrderFromCart(cart, totalPrice)
      if (newOrder) {
        const newOrderGuid = newOrder.guid;
        // move cart items into order items linking to new order
        let insertedItemCount = await insertOrdersItemsFromCartItems(newOrderGuid, cart.guid);
        if (insertOrderFromCart) {
          // delete cart items
          const movedItemCount = await cartQueries.deleteCartItems(cart.guid);
          if (movedItemCount === insertedItemCount) {
            // delete cart
            const deleteResults = await cartQueries.deleteCart(cart.guid);
            if (deleteResults.rowCount === 1) {
              return {
                status: 201,
                order: newOrder
              }              
            } else {
              return {
                status: 400,
                message: 'could not remove cart'
              }              
            }
          } else {
            return {
              status: 400,
              message: 'wrong number of cart items removed'
            }              
          }
        } else {
          return {
            status: 400,
            message: 'could not move cart items into order items'
          }                                
        }
      } else {
        return {
          status: 400,
          message: 'could not create new order from cart'
        }                                
      }
    } else {
      return {
        status: 400,
        message: 'could not get total price from cart'
      }                                
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
  moveCartToOrder
}
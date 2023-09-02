const db = require('../db/db');

/**
 * returns one cart
 *
 * @param {String} cartGuid - guid code of cart to find
 * @return {Object} Object = 
 *    success: { status: 201, cart: cart data} 
 *    err: { status:404, message: error message }
 */
async function getCart(cartGuid) {

  const sqlCommand = `SELECT * FROM carts WHERE guid = $1;`;
  try {
    const results = await db.query(sqlCommand, [cartGuid]);
    if (db.validResultsAtLeast1Row(results)) {
      return {
        status: 200,
        cart: results.rows[0]
      }
    } else {
      return {
        status: 404,
        message: 'cart not inserted'
      } 
    }
  } catch (err) {
    throw Error(err);
  }
};

/**
 * returns all cart items for one cart
 *
 * @param {Integer} cartGuid - guid code of cart with items to find
 * @return {Array|null} Array = objects of cart data; mull = user not found
 */
async function getAllItemsForCart(cartGuid) {
  const sqlCommand = `
    SELECT cart_items.guid, cart_guid, product_guid, quantity, 
          products.name, products.category, products.description,
          products.designer, products.price, 
          (quantity * products.price) AS item_total
    FROM cart_items
    INNER JOIN products ON (products.guid = cart_items.product_guid)
    WHERE cart_guid = $1;`;
  try {
    const results = await db.query(sqlCommand, [cartGuid]);
    if (db.validResultsAtLeast1Row(results)) {
      return results.rows;
    } else {
      return null;
    }
  } catch (err) {
    throw Error(err);
  }
};

/**
 * gets the total price for all items on one cart
 *
 * @param {Integer} cartGuid - guid code of cart with items to sum
 * @return {Decimal} total price for all items in one cart
 */
async function getCartTotalPrice(cartGuid) {
  const sqlCommand = `
    SELECT SUM(quantity * products.price) AS price
    FROM cart_items
    INNER JOIN products ON (products.guid = cart_items.product_guid)
    WHERE cart_guid = $1;`;
  try {
    const results = await db.query(sqlCommand, [cartGuid]);
    if (db.validResultsAtLeast1Row(results)) {
      const totalFloat = parseFloat(results.rows[0].price);      
      const totalDecimal = (Math.round(totalFloat * 100) / 100).toFixed(2);
      return totalDecimal;
    } else {
      return null;
    }    
  } catch (err) {
    throw Error(err);
  }
};

/**
 * deletes one cart row
 *
 * @param {String} cartGuid - guiud code of cart to delete
 * @return {Object} Object = 
 *    success: { status: 201, rowCount: 1 }
 *    err: { status: error_code, rowCount: 0 }
 */
async function deleteCart(cartGuid) {
  const sqlCommand = `
    DELETE FROM carts
    WHERE guid = $1;`;
  try {
    const results = await db.query(sqlCommand, [cartGuid]);
    if (results && results.rowCount === 1) {
      return {
        status: 200,
        rowCount: 1
      }
      // return results.rowCount;
    } else {
      return {
        status: 404,
        rowCount: 0
      }
      // return null;
    }
  } catch (err) {
    if (err.code === '23503') {
      return {
        status: 409,
        rowCount: 0
      }      
    } else {
      throw Error(err);
    }
  }
}

/**
 * deletes all cart items for one cart
 *
 * @param {Integer} cartGuid - guid code of cart to with items to delete
 * @return {Integer|null} Integer = # of rows deleted; null = error deleteing
 */
async function deleteCartItems(cartGuid) {
  const sqlCommand = `
    DELETE FROM cart_items
    WHERE cart_guid = $1;`;
  try {
    const results = await db.query(sqlCommand, [cartGuid]);
    if (results && results.rowCount >= 0) {
      return results.rowCount;
    } else {
      return null;
    }
  } catch (err) {
    throw Error(err)
  }
};

module.exports = { 
  getCart,
  getAllItemsForCart,  
  getCartTotalPrice,  
  deleteCart, 
  deleteCartItems
}
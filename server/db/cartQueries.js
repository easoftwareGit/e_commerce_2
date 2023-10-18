const db = require('../db/db');

/**
 * returns one cart
 *
 * @param {String} cartUuid - uuid code of cart to find
 * @return {Object} Object = 
 *    success: { status: 201, cart: cart data} 
 *    err: { status:404, message: error message }
 */
async function getCartByCartUuid(cartUuid) {

  const sqlCommand = `SELECT * FROM carts WHERE uuid = $1;`;
  try {
    const results = await db.query(sqlCommand, [cartUuid]);
    if (db.validResultsAtLeast1Row(results)) {
      return {
        status: 200,
        cart: results.rows[0]
      }
    } else {
      return {
        status: 404,
        message: 'cart not found'
      } 
    }
  } catch (err) {
    throw Error(err);
  }
};

/**
 * returns one cart
 *
 * @param {String} userUuid - uuid code of user with cart to find
 * @return {Object} Object = 
 *    success: { status: 201, cart: cart data} 
 *    err: { status:404, message: error message }
 */
async function getCartByUserUuid(userUuid) {

  const sqlCommand = `SELECT * FROM carts WHERE user_uuid = $1;`;
  try {
    const results = await db.query(sqlCommand, [userUuid]);
    if (db.validResultsAtLeast1Row(results)) {
      return {
        status: 200,
        cart: results.rows[0]
      }
    } else {
      return {
        status: 404,
        message: 'cart not found'
      } 
    }
  } catch (err) {
    throw Error(err);
  }
};

/**
 * returns all cart items for one cart
 *
 * @param {String} cartUuid - uuid code of cart with items to find
 * @return {Array|null} Array = objects of cart data; mull = user not found
 */
async function getAllItemsForCart(cartUuid) {
  const sqlCommand = `
    SELECT cart_items.uuid, cart_uuid, product_uuid, quantity, 
          products.name, products.category, products.description,
          products.designer, products.price, 
          (quantity * products.price) AS item_total
    FROM cart_items
    INNER JOIN products ON (products.uuid = cart_items.product_uuid)
    WHERE cart_uuid = $1;`;
  try {
    const results = await db.query(sqlCommand, [cartUuid]);
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
 * @param {String} cartUuid - uuid code of cart with items to sum
 * @return {Decimal} total price for all items in one cart
 */
async function getCartTotalPrice(cartUuid) {
  const sqlCommand = `
    SELECT SUM(quantity * products.price) AS price
    FROM cart_items
    INNER JOIN products ON (products.uuid = cart_items.product_uuid)
    WHERE cart_uuid = $1;`;
  try {
    const results = await db.query(sqlCommand, [cartUuid]);
    if (db.validResultsAtLeast1Row(results)) {
      const totalFloat = parseFloat(results.rows[0].price);      
      const totalDecimal = (Math.round(totalFloat * 100) / 100);      
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
 * @param {String} cartUuid - guiud code of cart to delete
 * @return {Object} Object = 
 *    success: { status: 201, rowCount: 1 }
 *    err: { status: error_code, rowCount: 0 }
 */
async function deleteCart(cartUuid) {
  const sqlCommand = `
    DELETE FROM carts
    WHERE uuid = $1;`;
  try {
    const results = await db.query(sqlCommand, [cartUuid]);
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
 * @param {String} cartUuid - uuid code of cart to with items to delete
 * @return {Integer|null} Integer = # of rows deleted; null = error deleteing
 */
async function deleteCartItems(cartUuid) {
  const sqlCommand = `
    DELETE FROM cart_items
    WHERE cart_uuid = $1;`;
  try {
    const results = await db.query(sqlCommand, [cartUuid]);
    if (results && results.rowCount >= 0) {
      return results.rowCount;
    } else {
      return null;
    }
  } catch (err) {
    throw Error(err)
  }
};

/**
 * updates the modified date in a cart 
 *
 * @param {String} cartUuid - uuid code of cart to with modified date to update
 * @param {DateTime} modified - new modified date
 * @return {object} - {status: query result code, cart: updated cart, message: error message}
 */
async function updateCartModifiedDate(cartUuid, modified) {
  const rowValues = [modified, cartUuid];
  const sqlCommand = `
    UPDATE carts
    SET modified = $1        
    WHERE uuid = $2
    RETURNING *;`;
  try {
    const results = await db.query(sqlCommand, rowValues);
    if (db.validResultsAtLeast1Row(results)) {
      return {
        status: 200,
        cart: results.rows[0]
      }
    } else {
      return {
        status: 404,
        message: 'cart not found'
      } 
    };
  } catch (err) {
    throw Error(err)
  }
}

module.exports = { 
  getCartByCartUuid,
  getCartByUserUuid,
  getAllItemsForCart,  
  getCartTotalPrice,  
  deleteCart, 
  deleteCartItems,
  updateCartModifiedDate
}
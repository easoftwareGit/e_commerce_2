const expect = require('chai').expect;
const request = require('supertest');
const db = require('../../db/db');
const cartQueries = require('../../db/cartQueries');
const orderQueries = require('../../db/orderQueries');

const { assert } = require('chai');

require("dotenv").config();
// NOTE: baseUrl only has /api route. not /api/carts or /api/orders
const baseUrl = `${process.env.BASEURL}`; 

function testCheckout(app) {

  describe(`${baseUrl}/carts/:guid/checkout route and it's queries`, function() {
    const user1Guid = '5bcefb5d-314f-ff1f-f5da-6521a2fa7bde';       // guid of user #1
    const user2Guid = '6714f724-f838-8f90-65a1-30359152dcdb';       // guid of user #2
    const order1Guid = 'bbdedc95-c697-147e-5232-a23b2d5a4aa4';      // guid of order #1
    const orderItem2Guid = 'e6710ea9-f1b4-8a55-0989-612ba83879a5'   // guid of order item #2
    const product1Guid = 'fd99387c-33d9-c78a-ba29-0286576ddce5';    // guid of product #1    
    const product3Guid = 'd9b1af94-4d49-41f6-5b2d-2d4ac160cdea';    // guid of product #3
    const product4Guid = '467e51d7-1659-d2e4-12cb-c64a0d19ecb4';    // guid of product #4
    const product1Price = 265.99;    
    const product3Price = 2095.95;
    const product4Price = 69.99;
  
    const testQuantity = 5;  
    const testPrice = (testQuantity * product1Price) + (testQuantity * product3Price) + (testQuantity * product4Price);
    const testDecPrice = (Math.round(testPrice * 100) / 100).toFixed(2);
    const testCartItems = [
      {
        product_guid: product1Guid,
        quantity: testQuantity,
        price_unit: product1Price
      },
      {
        product_guid: product3Guid,
        quantity: testQuantity,
        price_unit: product3Price
      },
      {
        product_guid: product4Guid,
        quantity: testQuantity,
        price_unit: product4Price
      },
    ];

    const delTestOrderSqlCommand = `
      DELETE FROM orders
      WHERE user_guid = '${user2Guid}';`;
    const delTestOrderItemsSqlCommand = `
      DELETE FROM order_items
      WHERE quantity = ${testQuantity};`
    const delTestCartSqlCommand = `
      DELETE FROM carts
      WHERE user_guid = '${user2Guid}';`;
    const delTestCartItemsSqlCommand = `
      DELETE FROM cart_items
      WHERE quantity = ${testQuantity};`

    describe('test move cart to order components', function() {
      let testOrder;      
      let testTotal;
      const testCart = {
        created: new Date("05/15/2023"),
        modified: new Date("05/15/2323"),
        user_guid: user2Guid
      }

      before('before test move cart to order components, remove data from prior test', async function() {        
        await db.query(delTestCartItemsSqlCommand);
        await db.query(delTestCartSqlCommand);
        await db.query(delTestOrderItemsSqlCommand);
        await db.query(delTestOrderSqlCommand);
      });

      before('before test move cart to order components, insert test cart', async function() {
        const sqlCommand = `
          INSERT INTO carts (created, modified, user_guid) 
          VALUES ($1, $2, $3) 
          RETURNING *;`;
        const { created, modified, user_guid } = testCart;
        const rowValues = [created, modified, user_guid];
        const response = await db.query(sqlCommand, rowValues);
        const returnedCart = response.rows[0];
        testCart.guid = returnedCart.guid;        
      });

      before('before test move cart to order components, insert test cart_items', async function() {
        const sqlCommand = `
          INSERT INTO cart_items (cart_guid, product_guid, quantity) 
          VALUES ($1, $2, $3) 
          RETURNING *;`;
        try {
          for (let i = 0; i < testCartItems.length; i++) {
            const item = testCartItems[i];
            const {product_guid, quantity } = item;
            const rowValues = [testCart.guid, product_guid, quantity];
            await db.query(sqlCommand, rowValues);
          }
          return testCartItems.length;
        } catch (error) {
          return error;
        }
      });

      after('after test orderQueries.insertOrdersItemsFromCartItems(), remove test data', async function() {
        await db.query(delTestCartItemsSqlCommand);
        await db.query(delTestCartSqlCommand);
        await db.query(delTestOrderItemsSqlCommand);
        await db.query(delTestOrderSqlCommand);
      });

      it('get total price for test cart', async function() {        
        testTotal = await cartQueries.getCartTotalPrice(testCart.guid);        
        assert.equal(testTotal, testDecPrice);
      });

      it('insert 1 order from 1 cart', async function() {
        testOrder = await orderQueries.insertOrderFromCart(testCart, testTotal);
        assert.equal(testOrder.total_price, testTotal);
        assert.equal(testOrder.user_guid, testCart.user_guid);
      })

      it('insert orders_items rows from cart_items rows', async function() {
        const results = await orderQueries.insertOrdersItemsFromCartItems(testOrder.guid, testCart.guid);        
        assert.equal(results, testCartItems.length);
      });

      it('remove rows from cart_items', async function() {
        const results = await cartQueries.deleteCartItems(testCart.guid);
        assert.equal(results, testCartItems.length)
      });

      it('remove row from carts', async function() {
        const results = await cartQueries.deleteCart(testCart.guid); 
        assert.equal(results.status, 200);
        assert.equal(results.rowCount, 1);
      });
    });

    describe('test orderQueries.moveCartToOrder()', function() {
      let testOrder;
      
      const testCart = {
        created: new Date("05/15/2023"),
        modified: new Date("05/15/2323"),
        user_guid: user2Guid
      }

      before('before test move cart to order components, remove data from prior test', async function() {        
        await db.query(delTestCartItemsSqlCommand);
        await db.query(delTestCartSqlCommand);
        await db.query(delTestOrderItemsSqlCommand);
        await db.query(delTestOrderSqlCommand);
      });

      before('before test move cart to order components, insert test cart', async function() {
        const sqlCommand = `
          INSERT INTO carts (created, modified, user_guid) 
          VALUES ($1, $2, $3) 
          RETURNING *;`;
        const { created, modified, user_guid } = testCart;
        const rowValues = [created, modified, user_guid];
        const response = await db.query(sqlCommand, rowValues);
        const returnedCart = response.rows[0];
        testCart.guid = returnedCart.guid;        
      });

      before('before test move cart to order components, insert test cart_items', async function() {
        const sqlCommand = `
          INSERT INTO cart_items (cart_guid, product_guid, quantity) 
          VALUES ($1, $2, $3) 
          RETURNING *;`;
        try {
          for (let i = 0; i < testCartItems.length; i++) {
            const item = testCartItems[i];
            const {product_guid, quantity } = item;
            const rowValues = [testCart.guid, product_guid, quantity];
            await db.query(sqlCommand, rowValues);
          }
          return testCartItems.length;
        } catch (error) {
          return error;
        }
      });

      after('after test move cart to order components, remove test data', async function() {
        await db.query(delTestCartItemsSqlCommand);
        await db.query(delTestCartSqlCommand);
        await db.query(delTestOrderItemsSqlCommand);
        await db.query(delTestOrderSqlCommand);
      });

      it('get test cart', async function() {
        const results = await cartQueries.getCart(testCart.guid);
        assert.equal(results.status, 200);
        const getCart = results.cart;
        // now compare - use deepEqual for dates        
        assert.equal(getCart.guid, testCart.guid);
        assert.deepEqual(getCart.created, testCart.created);
        assert.deepEqual(getCart.modified, testCart.modified);
        assert.equal(getCart.user_guid, testCart.user_guid);
      })

      it('move cart to order', async function() {
        const results = await orderQueries.moveCartToOrder(testCart);
        assert.equal(results.status, 201);
        testOrder = results.order;
        assert.equal(testOrder.total_price, testDecPrice);
        assert.equal(testOrder.user_guid, user2Guid);  
      });

      it('correct number of new order items', async function() {
        const response = await request(app)
          .get(`${baseUrl}/orders/${testOrder.guid}/items`)
          .expect(200);
        assert.equal(response.body.length, testCartItems.length);
      });

      it('test cart items no longer in cart_items table', function() {
        return request(app)
          .get(`${baseUrl}/carts/${testCart.guid}/items`)
          .expect(404);
      });
  
      it('test cart no longer in carts table', function() {
        return request(app)
          .put(`${baseUrl}/carts/${testCart.guid}`)
          .send(testCart)
          .expect(404)
      });        
    });

    describe(`POST ${baseUrl}/:guid/checkout`, function() {
      let testOrder;

      const testCart = {
        created: new Date("05/15/2023"),
        modified: new Date("05/15/2323"),
        user_guid: user2Guid
      }

      before(`before test POST ${baseUrl}/:guid/checkout, remove data from prior test`, async function() {        
        await db.query(delTestCartItemsSqlCommand);
        await db.query(delTestCartSqlCommand);
        await db.query(delTestOrderItemsSqlCommand);
        await db.query(delTestOrderSqlCommand);
      });

      before(`before test POST ${baseUrl}/:guid/checkout, insert test cart`, async function() {
        const sqlCommand = `
          INSERT INTO carts (created, modified, user_guid) 
          VALUES ($1, $2, $3) 
          RETURNING *;`;
        const { created, modified, user_guid } = testCart;
        const rowValues = [created, modified, user_guid];
        const response = await db.query(sqlCommand, rowValues);
        const returnedCart = response.rows[0];
        testCart.guid = returnedCart.guid;        
      });

      before(`before test POST ${baseUrl}/:guid/checkout, insert test cart_items`, async function() {
        const sqlCommand = `
          INSERT INTO cart_items (cart_guid, product_guid, quantity) 
          VALUES ($1, $2, $3) 
          RETURNING *;`;
        try {
          for (let i = 0; i < testCartItems.length; i++) {
            const item = testCartItems[i];
            const {product_guid, quantity } = item;
            const rowValues = [testCart.guid, product_guid, quantity];
            await db.query(sqlCommand, rowValues);
          }
          return testCartItems.length;
        } catch (error) {
          return error;
        }
      });

      after(`after test POST ${baseUrl}/:guid/checkout, remove test data`, async function() {
        await db.query(delTestCartItemsSqlCommand);
        await db.query(delTestCartSqlCommand);
        await db.query(delTestOrderItemsSqlCommand);
        await db.query(delTestOrderSqlCommand);
      });


      it('POST the new order from cart via checkout', async function() {
        const response = await request(app)
          .post(`${baseUrl}/carts/${testCart.guid}/checkout`)
          .send(testCart)
          .expect(201);
        testOrder = response.body;
        assert.equal(testOrder.total_price, testDecPrice);  
        assert.equal(testOrder.user_guid, user2Guid);  
      });

      it('correct number of new order items', async function() {
        const response = await request(app)
          .get(`${baseUrl}/orders/${testOrder.guid}/items`)
          .expect(200);
        assert.equal(response.body.length, testCartItems.length);
      });

      it('test cart items no longer in cart_items table', function() {
        return request(app)
          .get(`${baseUrl}/carts/${testCart.guid}/items`)
          .expect(404);
      });
  
      it('test cart no longer in carts table', function() {
        return request(app)
          .put(`${baseUrl}/carts/${testCart.guid}`)
          .send(testCart)
          .expect(404)
      });        

    });

  });
};

module.exports = testCheckout;


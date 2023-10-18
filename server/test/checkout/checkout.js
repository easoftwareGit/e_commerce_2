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

  describe(`${baseUrl}/carts/:uuid/checkout route and it's queries`, function() {
    const user1Uuid = '5bcefb5d-314f-ff1f-f5da-6521a2fa7bde';       // uuid of user #1
    const user2Uuid = '6714f724-f838-8f90-65a1-30359152dcdb';       // uuid of user #2
    const order1Uuid = 'bbdedc95-c697-147e-5232-a23b2d5a4aa4';      // uuid of order #1
    const orderItem2Uuid = 'e6710ea9-f1b4-8a55-0989-612ba83879a5'   // uuid of order item #2
    const product1Uuid = 'fd99387c-33d9-c78a-ba29-0286576ddce5';    // uuid of product #1    
    const product3Uuid = 'd9b1af94-4d49-41f6-5b2d-2d4ac160cdea';    // uuid of product #3
    const product4Uuid = '467e51d7-1659-d2e4-12cb-c64a0d19ecb4';    // uuid of product #4
    const product1Price = 265.99;    
    const product3Price = 2095.95;
    const product4Price = 69.99;
  
    const testQuantity = 5;  
    const testPrice = (testQuantity * product1Price) + (testQuantity * product3Price) + (testQuantity * product4Price);
    const testDecPrice = (Math.round(testPrice * 100) / 100).toFixed(2);
    // const testDecPrice = asMoney(testPrice);
    const testCartItems = [
      {
        product_uuid: product1Uuid,
        quantity: testQuantity,
        price_unit: product1Price
      },
      {
        product_uuid: product3Uuid,
        quantity: testQuantity,
        price_unit: product3Price
      },
      {
        product_uuid: product4Uuid,
        quantity: testQuantity,
        price_unit: product4Price
      },
    ];

    const delTestOrderSqlCommand = `
      DELETE FROM orders
      WHERE user_uuid = '${user2Uuid}';`;
    const delTestOrderItemsSqlCommand = `
      DELETE FROM order_items
      WHERE quantity = ${testQuantity};`
    const delTestCartSqlCommand = `
      DELETE FROM carts
      WHERE user_uuid = '${user2Uuid}';`;
    const delTestCartItemsSqlCommand = `
      DELETE FROM cart_items
      WHERE quantity = ${testQuantity};`

    describe('test move cart to order components', function() {
      let testOrder;      
      let testTotal;
      const testCart = {
        created: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)),
        modified: new Date(Date.now() - (6 * 24 * 60 * 60 * 1000)),
        user_uuid: user2Uuid
      }

      before('before test move cart to order components, remove data from prior test', async function() {        
        await db.query(delTestCartItemsSqlCommand);
        await db.query(delTestCartSqlCommand);
        await db.query(delTestOrderItemsSqlCommand);
        await db.query(delTestOrderSqlCommand);
      });

      before('before test move cart to order components, insert test cart', async function() {
        const sqlCommand = `
          INSERT INTO carts (created, modified, user_uuid) 
          VALUES ($1, $2, $3) 
          RETURNING *;`;
        const { created, modified, user_uuid } = testCart;
        const rowValues = [created, modified, user_uuid];
        const response = await db.query(sqlCommand, rowValues);
        const returnedCart = response.rows[0];
        testCart.uuid = returnedCart.uuid;        
      });

      before('before test move cart to order components, insert test cart_items', async function() {
        const sqlCommand = `
          INSERT INTO cart_items (cart_uuid, product_uuid, quantity) 
          VALUES ($1, $2, $3) 
          RETURNING *;`;
        try {
          for (let i = 0; i < testCartItems.length; i++) {
            const item = testCartItems[i];
            const {product_uuid, quantity } = item;
            const rowValues = [testCart.uuid, product_uuid, quantity];
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
        testTotal = await cartQueries.getCartTotalPrice(testCart.uuid);        
        assert.equal(testTotal, testDecPrice);
      });

      it('insert 1 order from 1 cart', async function() {
        testOrder = await orderQueries.insertOrderFromCart(testCart, testTotal);
        assert.equal(testOrder.total_price, testTotal);
        assert.equal(testOrder.user_uuid, testCart.user_uuid);
      })

      it('insert orders_items rows from cart_items rows', async function() {
        const results = await orderQueries.insertOrdersItemsFromCartItems(testOrder.uuid, testCart.uuid);        
        assert.equal(results, testCartItems.length);
      });

      it('remove rows from cart_items', async function() {
        const results = await cartQueries.deleteCartItems(testCart.uuid);
        assert.equal(results, testCartItems.length)
      });

      // it('remove row from carts', async function() {
      //   const results = await cartQueries.deleteCart(testCart.uuid); 
      //   assert.equal(results.status, 200);
      //   assert.equal(results.rowCount, 1);
      // });

      it('update modified date in cart', async function () {
        const modDate = new Date(Date.now());
        const results = await cartQueries.updateCartModifiedDate(testCart.uuid, modDate);
        assert.equal(results.status, 200);
        const cart = results.cart;
        assert.deepEqual(cart.modified, modDate);
      })
    });

    describe('test orderQueries.moveCartToOrder()', function() {
      let testOrder;
      
      const testCart = {
        created: new Date(Date.now() - (5 * 24 * 60 * 60 * 1000)),
        modified: new Date(Date.now() - (4 * 24 * 60 * 60 * 1000)),
        user_uuid: user2Uuid
      }

      before('before test move cart to order components, remove data from prior test', async function() {        
        await db.query(delTestCartItemsSqlCommand);
        await db.query(delTestCartSqlCommand);
        await db.query(delTestOrderItemsSqlCommand);
        await db.query(delTestOrderSqlCommand);
      });

      before('before test move cart to order components, insert test cart', async function() {
        const sqlCommand = `
          INSERT INTO carts (created, modified, user_uuid) 
          VALUES ($1, $2, $3) 
          RETURNING *;`;
        const { created, modified, user_uuid } = testCart;
        const rowValues = [created, modified, user_uuid];
        const response = await db.query(sqlCommand, rowValues);
        const returnedCart = response.rows[0];
        testCart.uuid = returnedCart.uuid;        
      });

      before('before test move cart to order components, insert test cart_items', async function() {
        const sqlCommand = `
          INSERT INTO cart_items (cart_uuid, product_uuid, quantity) 
          VALUES ($1, $2, $3) 
          RETURNING *;`;
        try {
          for (let i = 0; i < testCartItems.length; i++) {
            const item = testCartItems[i];
            const {product_uuid, quantity } = item;
            const rowValues = [testCart.uuid, product_uuid, quantity];
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
        const results = await cartQueries.getCartByCartUuid(testCart.uuid);
        assert.equal(results.status, 200);
        const getCart = results.cart;
        // now compare - use deepEqual for dates        
        assert.equal(getCart.uuid, testCart.uuid);
        assert.deepEqual(getCart.created, testCart.created);
        assert.deepEqual(getCart.modified, testCart.modified);
        assert.equal(getCart.user_uuid, testCart.user_uuid);
      })

      it('move cart to order', async function() {
        const results = await orderQueries.moveCartToOrder(testCart);
        assert.equal(results.status, 201);
        testOrder = results.order;
        assert.equal(testOrder.total_price, testDecPrice);
        assert.equal(testOrder.user_uuid, user2Uuid);  
      });

      it('correct number of new order items', async function() {
        const response = await request(app)
          .get(`${baseUrl}/orders/${testOrder.uuid}/items`)
          .expect(200);
        assert.equal(response.body.length, testCartItems.length);
      });

      it('test cart items no longer in cart_items table', async function() {
        return await request(app)
          .get(`${baseUrl}/carts/${testCart.uuid}/items`)
          .expect(404);
      });
  
      // it('test cart no longer in carts table', function() {
      //   return request(app)
      //     .put(`${baseUrl}/carts/${testCart.uuid}`)
      //     .send(testCart)
      //     .expect(404)
      // });     
      
      it('test cart modified date updated', async function() {        
        const updatedCart = {
          modified: new Date(Date.now())
        }
        const response = await request(app)
          .put(`${baseUrl}/carts/${testCart.uuid}`)
          .send(updatedCart)
          .expect(200)
        // now compare - use deepEqual for dates
        const putCart = response.body;       
        putModified = new Date(putCart.modified);
        assert.deepEqual(putModified, updatedCart.modified);        
      })
    });

    describe(`POST ${baseUrl}/:uuid/checkout`, function() {
      let testOrder;

      const testCart = {
        created: new Date(Date.now() - (3 * 24 * 60 * 60 * 1000)),
        modified: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000)),
        user_uuid: user2Uuid
      }

      before(`before test POST ${baseUrl}/:uuid/checkout, remove data from prior test`, async function() {        
        await db.query(delTestCartItemsSqlCommand);
        await db.query(delTestCartSqlCommand);
        await db.query(delTestOrderItemsSqlCommand);
        await db.query(delTestOrderSqlCommand);
      });

      before(`before test POST ${baseUrl}/:uuid/checkout, insert test cart`, async function() {
        const sqlCommand = `
          INSERT INTO carts (created, modified, user_uuid) 
          VALUES ($1, $2, $3) 
          RETURNING *;`;
        const { created, modified, user_uuid } = testCart;
        const rowValues = [created, modified, user_uuid];
        const response = await db.query(sqlCommand, rowValues);
        const returnedCart = response.rows[0];
        testCart.uuid = returnedCart.uuid;        
      });

      before(`before test POST ${baseUrl}/:uuid/checkout, insert test cart_items`, async function() {
        const sqlCommand = `
          INSERT INTO cart_items (cart_uuid, product_uuid, quantity) 
          VALUES ($1, $2, $3) 
          RETURNING *;`;
        try {
          for (let i = 0; i < testCartItems.length; i++) {
            const item = testCartItems[i];
            const {product_uuid, quantity } = item;
            const rowValues = [testCart.uuid, product_uuid, quantity];
            await db.query(sqlCommand, rowValues);
          }
          return testCartItems.length;
        } catch (error) {
          return error;
        }
      });

      after(`after test POST ${baseUrl}/:uuid/checkout, remove test data`, async function() {
        await db.query(delTestCartItemsSqlCommand);
        await db.query(delTestCartSqlCommand);
        await db.query(delTestOrderItemsSqlCommand);
        await db.query(delTestOrderSqlCommand);
      });


      it('POST the new order from cart via checkout', async function() {
        const response = await request(app)
          .post(`${baseUrl}/carts/${testCart.uuid}/checkout`)
          .send(testCart)
          .expect(201);
        testOrder = response.body;
        assert.equal(testOrder.total_price, testDecPrice);  
        assert.equal(testOrder.user_uuid, user2Uuid);  
      });

      it('correct number of new order items', async function() {
        const response = await request(app)
          .get(`${baseUrl}/orders/${testOrder.uuid}/items`)
          .expect(200);
        assert.equal(response.body.length, testCartItems.length);
      });

      it('test cart items no longer in cart_items table', async function() {
        return await request(app)
          .get(`${baseUrl}/carts/${testCart.uuid}/items`)
          .expect(404);
      });
  
      // it('test cart no longer in carts table', async function() {
      //   return await request(app)
      //     .put(`${baseUrl}/carts/${testCart.uuid}`)
      //     .send(testCart)
      //     .expect(404)
      // });        

      it('test cart has modified date', async function () {
        const response = await request(app)
          .get(`${baseUrl}/carts/cart/${testCart.uuid}`)
          .expect(200)
        const updatedCart = response.body;
        expect(updatedCart.modified).to.not.be.null;
      })

    });

  });
};

module.exports = testCheckout;


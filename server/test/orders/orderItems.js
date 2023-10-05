const expect = require('chai').expect;
const request = require('supertest');
const db = require('../../db/db');
const orderQueries = require('../../db/orderQueries');
const cartQueries = require('../../db/cartQueries');

const dbTools = require('../../db/dbTools');
const { assert } = require('chai');

const setupOrderItems = require('./setupOrderItems');
const orderItemsCount = setupOrderItems.orderItemsCount;

const {
  orderItemsTableName,  
  ordersUuidForeignKeyName, 
  ordersProductsUuidForeignKeyName
} = require('../myConsts');

require("dotenv").config();
const baseUrl = `${process.env.BASEURL}/orders`; 

function testOrderItems(app) {

  describe('/orders/items routes', function () {
    const user1Uuid = '5bcefb5d-314f-ff1f-f5da-6521a2fa7bde';       // uuid of user #1
    const user2Uuid = '6714f724-f838-8f90-65a1-30359152dcdb';       // uuid of user #2
    const order1Uuid = 'bbdedc95-c697-147e-5232-a23b2d5a4aa4';      // uuid of order #1
    const orderItem2Uuid = 'e6710ea9-f1b4-8a55-0989-612ba83879a5'   // uuid of order item #2
    const product1Uuid = 'fd99387c-33d9-c78a-ba29-0286576ddce5';    // uuid of product #1
    const product2Uuid = '56d916ec-e6b5-0e62-9330-0248c6792316';    // uuid of product #2    
    const product4Uuid = '467e51d7-1659-d2e4-12cb-c64a0d19ecb4';    // uuid of product #4
    const product1Price = 265.99;
    const product2Price = 995.95;
    const product4Price = 69.99;
    const nonexistingUuid = '56d916ec-e6b5-0e62-9330-0248c6792317';

    describe('setup order_items table', function() {

      it('DROP order_items table', async function() {
        await dbTools.dropTable(orderItemsTableName);
        const doesExist = await dbTools.tableExists(orderItemsTableName);      
        expect(doesExist).to.be.false;
      });

      it('CREATE order_items', async function() {
        await setupOrderItems.createOrderItemsTable();
        const doesExist = await dbTools.tableExists(orderItemsTableName);      
        expect(doesExist).to.be.true;     
      });

      it('check for orders FOREIGN KEY', async function() {        
        const doesExist = await dbTools.foreignKeyExists(ordersUuidForeignKeyName);      
        expect(doesExist).to.be.true;
      });

      it('check for products FOREIGN KEY', async function() {        
        const doesExist = await dbTools.foreignKeyExists(ordersProductsUuidForeignKeyName);      
        expect(doesExist).to.be.true;
      });

      it('INSERT new order items', async function() {
        const numInserted = await setupOrderItems.insertAllOrderItems(); 
        expect(numInserted).to.equal(orderItemsCount);
      });      

    });

    describe('test orderQueries.createOrderItems()', function() {
      let testOrderUuid;
      let priorTestOrderUuid;
      const testQuantity = 5;      
      const delTestOrderSqlCommand = `
        DELETE FROM orders
        WHERE user_uuid = '${user1Uuid}'`;
      const delTestOrderItemsSqlCommand = `
        DELETE FROM order_items
        WHERE quantity = ${testQuantity};`

      before('check orders leftover from prior tests', async function() {
        const sqlCommand = `SELECT * FROM orders WHERE user_uuid = $1`;
        const results = await db.query(sqlCommand, [user1Uuid]);
        if (db.validResultsAtLeast1Row(results)) {
          priorTestOrderUuid = results.rows[0].uuid;
        }
      });

      before('remove test order items from prior tests', async function() {
        await db.query(delTestOrderItemsSqlCommand);
      });

      before('remove test order from prior tests', async function() {
        await db.query(delTestOrderSqlCommand);
      });

      before('insert test order', async function() {
        const dateNow = new Date(Date.now());
        const order = {
          created: dateNow,
          modified: dateNow,    
          status: 'Created',
          total_price: 42.95,
          user_uuid: user1Uuid
        };
        const sqlCommand = `
          INSERT INTO orders (created, modified, status, total_price, user_uuid) 
          VALUES ($1, $2, $3, $4, $5) 
          RETURNING *`;
        const { created, modified, status, total_price, user_uuid } = order;
        const rowValues = [created, modified, status, total_price, user_uuid];
        const response = await db.query(sqlCommand, rowValues);
        const testOrder = response.rows[0];
        testOrderUuid = testOrder.uuid;        
      });

      after('after orderQueries.createOrderItems(), remove test order items', async function() {
        await db.query(delTestOrderItemsSqlCommand);
      });

      after('after orderQueries.createOrderItems(), remove test order', async function() {
        await db.query(delTestOrderSqlCommand);
      });

      it('test orderQueries.createOrderItems()', async function() {
        const testItems = [
          {            
            product_uuid: product1Uuid,
            quantity: testQuantity,
            price_unit: product1Price
          },
          {           
            product_uuid: product2Uuid,
            quantity: testQuantity,
            price_unit: product2Price
          },
          {           
            product_uuid: product4Uuid,
            quantity: testQuantity,
            price_unit: product4Price
          }
        ];
        try {
          const results = await orderQueries.createOrderItems(testOrderUuid, testItems);
          const createdItems = results.orderItems;          
          assert.equal(createdItems.length, testItems.length);
          for (let i = 0; i < testItems.length; i++) {
            const testItem = testItems[i];
            const createdItemArray = createdItems.filter(item => item.product_uuid === testItem.product_uuid);
            const createdItem = createdItemArray[0];
            assert.equal(createdItem.order_uuid, testOrderUuid);
            assert.equal(createdItem.product_uuid, testItem.product_uuid);
            assert.equal(createdItem.quantity, testItem.quantity);
            assert.equal(createdItem.price_unit, testItem.price_unit);              
          }
        } catch (err) {
          throw Error(err);
        }

      });
    });

    describe('cannot DELETE order with order_items', function() {
      let testOrderUuid;          
      const testQuantity = 5;
      const resetOrderItemsSqlCommand = `DELETE FROM order_items WHERE quantity = ${testQuantity};`;
      const resetOrdersSqlCommand = `DELETE FROM orders WHERE user_uuid = '${user2Uuid}'`;

      before('before delete test order items, reset order items from prior tests', async function() {        
        await db.query(resetOrderItemsSqlCommand);
      });

      before('before delete test order, reset orders from prior tests', async function() {        
        await db.query(resetOrdersSqlCommand);
      });

      before('insert test order', async function() {
        const order = {
          created: new Date("03/13/2023"),
          modified: new Date("03/13/2023"),    
          status: 'Created',
          total_price: 39.97,
          user_uuid: user2Uuid
        };
        const sqlCommand = `
          INSERT INTO orders (created, modified, status, total_price, user_uuid) 
          VALUES ($1, $2, $3, $4, $5) 
          RETURNING *`;
        const { created, modified, status, total_price, user_uuid } = order;
        const rowValues = [created, modified, status, total_price, user_uuid];
        const response = await db.query(sqlCommand, rowValues);
        const testOrder = response.rows[0];
        testOrderUuid = testOrder.uuid;
      });

      before('insert test order items', async function() {
        const items = [
          {
            order_uuid: testOrderUuid,
            product_uuid: product1Uuid,
            quantity: testQuantity,
            price_unit: product1Price
          },
          {
            order_uuid: testOrderUuid,
            product_uuid: product2Uuid,
            quantity: testQuantity,
            price_unit: product2Price
          }
        ];  
        const sqlCommand = `
          INSERT INTO order_items (order_uuid, product_uuid, quantity, price_unit) 
          VALUES ($1, $2, $3, $4) 
          RETURNING *`;
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const { order_uuid, product_uuid, quantity, price_unit } = item;
          const rowValues = [order_uuid, product_uuid, quantity, price_unit];
          await db.query(sqlCommand, rowValues);
        }
      });

      after('delete test order items', async function() {        
        await db.query(resetOrderItemsSqlCommand);
      });

      after('delete test order', async function() {        
        await db.query(resetOrdersSqlCommand);
      });

      it('test order exists before DELETE order', async function() {
        const sqlCommand = `SELECT * FROM orders WHERE uuid = '${testOrderUuid}'`;
        const response = await db.query(sqlCommand);
        const doesExist = response.rows.length === 1;
        expect(doesExist).to.be.true;
      });

      it('test order items exist before DELETE order', async function() {
        const itemsCount = 2;
        const sqlCommand = `SELECT * FROM order_items WHERE order_uuid = '${testOrderUuid}'`;
        const response = await db.query(sqlCommand);
        const doesExist = response.rows.length === itemsCount;
        expect(doesExist).to.be.true;
      });

      it('try to DELETE order that has order_item(s)', async function () {
        // DO NOT USE baseUrl here
        return await request(app)
          .delete(`/api/orders/${testOrderUuid}`)
          .expect(409); // constraint error
      });

    });

    describe(`/GET ${baseUrl}/:uuid/items`, function() {      
      const countForGetOrder = 2;

      it('returns an array', async function() {
        const response = await request(app)
          .get(`${baseUrl}/${order1Uuid}/items`)
          .expect(200);
        expect(response.body).to.be.an.instanceOf(Array);
      });

      it('returns an array of all order_items', async function() {
        const response = await request(app)
          .get(`${baseUrl}/${order1Uuid}/items`)
          .expect(200);
        expect(response.body.length).to.be.equal(countForGetOrder);
        response.body.forEach((order) => {
          expect(order).to.have.ownProperty('uuid');
          expect(order).to.have.ownProperty('order_uuid');
          expect(order).to.have.ownProperty('product_uuid');
          expect(order).to.have.ownProperty('quantity');
          expect(order).to.have.ownProperty('price_unit');
          expect(order).to.have.ownProperty('name');
          expect(order).to.have.ownProperty('category');
          expect(order).to.have.ownProperty('description');
          expect(order).to.have.ownProperty('designer');
          expect(order).to.have.ownProperty('item_total');
        });
      });

      it('returned order items have the correct order uuid', async function() {
        const response = await request(app)
          .get(`${baseUrl}/${order1Uuid}/items`)
          .expect(200);
        response.body.forEach((orderItem) => {
          expect(orderItem.order_uuid).to.be.equal(order1Uuid);
        });
      });

      it('called with an invalid uuid returns a 404 error', function() {
        return request(app)
          .get(`${baseUrl}/ABC/items`)
          .expect(404);
      });

      it('called with a non existing uuid returns a 404 error', function() {
        return request(app)
          .get(`${baseUrl}/${nonexistingUuid}/items`)
          .expect(404);
      });

    });

    describe(`GET ${baseUrl}/items/:itemUuid`, function() {            

      it('returns a single order_item object', async function() {
        const response = await request(app)
          .get(`${baseUrl}/items/${orderItem2Uuid}`)
          .expect(200);
        const item = response.body;
        expect(item).to.be.an.instanceOf(Object);
        expect(item).to.not.be.an.instanceOf(Array);
      });

      it('returns a full order_item object', async function() {
        const response = await request(app)
          .get(`${baseUrl}/items/${orderItem2Uuid}`)
          .expect(200);
        const item = response.body;
        expect(item).to.have.ownProperty('uuid');
        expect(item).to.have.ownProperty('order_uuid');
        expect(item).to.have.ownProperty('product_uuid');
        expect(item).to.have.ownProperty('quantity');
        expect(item).to.have.ownProperty('price_unit');
      });

      it('returned order_item has the correct uuid', async function() {
        const response = await request(app)
          .get(`${baseUrl}/items/${orderItem2Uuid}`)
          .expect(200);
        const item = response.body;
        expect(item.uuid).to.be.an.equal(orderItem2Uuid);
      });

      it('called with an invalid uuid returns a 404 error', function() {
        return request(app)
          .get(`${baseUrl}/items/ABC`)
          .expect(404);
      });

      it('called with a non existing uuid returns a 404 error', function() {
        return request(app)
          .get(`${baseUrl}/items/${nonexistingUuid}`)
          .expect(404);
      });
    });

    describe(`POST ${baseUrl}/:uuid/items`, function() {                  
      const testQuantity = 5
      const newItem = {    
        product_uuid: product2Uuid,      
        quantity: testQuantity,
        price_unit: product2Price
      };
      const invalidItem = {    
        product_uuid: nonexistingUuid,  
        quantity: testQuantity,
        price_unit: product2Price
      };

      const resetSqlCommand = `
        DELETE FROM order_items
        WHERE product_uuid = '${product2Uuid}';`

      before('before first POST test', async function() {
        await db.query(resetSqlCommand);
      })

      after('after last POST test', async function() {
        await db.query(resetSqlCommand);
      });

      it('post a new order item with valid data', async function() {
        const response = await request(app)
          .post(`${baseUrl}/${order1Uuid}/items`)
          .send(newItem)
          .expect(201);
        const postedItem = response.body;
        assert.equal(postedItem.order_uuid, order1Uuid);
        assert.equal(postedItem.product_uuid, newItem.product_uuid);
        assert.equal(postedItem.quantity, newItem.quantity);
        assert.equal(postedItem.price_unit, newItem.price_unit);
      });
    
      it('did NOT post order item with a non-existant order_uuid', async function() {
        return await request(app)
          .post(`${baseUrl}/${nonexistingUuid}/items`)
          .send(invalidItem)
          .expect(409);
      });

      it('did NOT post order item with a non-existant product_uuid', async function() {
        return await request(app)
          .post(`${baseUrl}/${order1Uuid}/items`)
          .send(invalidItem)
          .expect(409);
      });

      it('did NOT post order item with no product_uuid', async function() {
        invalidItem.product_uuid = null;
        return await request(app)
          .post(`${baseUrl}/${order1Uuid}/items`)
          .send(invalidItem)
          .expect(400);
      });

      it('did NOT post order item with no quantity', async function() {
        invalidItem.product_uuid = product2Uuid;
        invalidItem.quantity = null;
        return await request(app)
          .post(`${baseUrl}/${order1Uuid}/items`)
          .send(invalidItem)
          .expect(400);
      });

      it('did NOT post order item with no price_unit', async function() {      
        invalidItem.quantity = 5;
        invalidItem.price_unit = null;
        return await request(app)
          .post(`${baseUrl}/${order1Uuid}/items`)
          .send(invalidItem)
          .expect(400);
      });

    });

    describe(`PUT ${baseUrl}/items/:itemUuid`, function() {            
      const resetSqlCommand = `
        UPDATE order_items
        SET order_uuid = '${order1Uuid}', product_uuid = '${product4Uuid}', quantity = 1, price_unit = 3.99
        WHERE uuid = '${orderItem2Uuid}';`;
      const testItem = {
        product_uuid: product4Uuid,
        quantity: 8,
        price_unit: product4Price
      }

      describe(`Valid ${baseUrl}/items/:itemUuid`, function() {

        before('before 1st PUT test', async function() {
          await db.query(resetSqlCommand);
        });

        afterEach('afterEach PUT test ', async function() {      
          await db.query(resetSqlCommand);
        });

        it('updates the correct order_item and returns it', async function() {
          let initialItem;
          let updatedItem;

          const response = await request(app)
            .get(`${baseUrl}/items/${orderItem2Uuid}`);
          initialItem = response.body;
          updatedItem = Object.assign({}, testItem);
          updatedItem.order_uuid = order1Uuid;
          const response_1 = await request(app)
            .put(`${baseUrl}/items/${orderItem2Uuid}`)
            .send(updatedItem)
            .expect(200);
          const resturnedItem = response_1.body;
          assert.equal(resturnedItem.uuid, orderItem2Uuid);
          assert.equal(resturnedItem.order_uuid, updatedItem.order_uuid);
          assert.equal(resturnedItem.product_uuid, updatedItem.product_uuid);
          assert.equal(resturnedItem.quantity, updatedItem.quantity);
          assert.equal(resturnedItem.price_unit, updatedItem.price_unit);
        });
      });

      describe(`Invalid ${baseUrl}/:uuid/items/:itemUuid`, function() {
        const testItem = {
          product_uuid: product1Uuid,
          quantity: 4,
          price_unit: 3.99
        };

        it('called with an invalid uuid returns a 404 error', function() {
          return request(app)
            .put(`${baseUrl}/items/ABC`)
            .send(testItem)
            .expect(404)
        });

        it('called with a non existing uuid returns a 404 error', function() {
          return request(app)
            .put(`${baseUrl}/items/${nonexistingUuid}`)
            .send(testItem)
            .expect(404)
        });

        it('did not put with non existing product_uuid', async function() {
          const invalidItem = Object.assign({}, testItem);
          invalidItem.product_uuid = nonexistingUuid;
          return await request(app)
            .put(`${baseUrl}/items/${orderItem2Uuid}`)
            .send(invalidItem)
            .expect(409)
        });

        // other tests for missing data performed in POST tests 
        it('did not put with a missing product_uuid', async function() {
          const invalidItem = Object.assign({}, testItem);
          invalidItem.product_uuid = null;
          return await request(app)
            .put(`${baseUrl}/items/${orderItem2Uuid}`)
            .send(invalidItem)
            .expect(400)
        });

      });        
    });

    describe(`DELETE ${baseUrl}/items/:itemUuid`, function() {            
      const testQuantity = 5;
      const toDelItem = {
        product_uuid: product1Uuid,
        quantity: testQuantity,
        price_unit: product1Price
      };
      let delItemUuid;

      before(`before DELETE ${baseUrl}/items/:itemUuid tests`, async function() {
        const sqlCommand = `
          INSERT INTO order_items (order_uuid, product_uuid, quantity, price_unit) 
          VALUES ($1, $2, $3, $4) RETURNING *`;
        const rowValues = [order1Uuid, toDelItem.product_uuid, toDelItem.quantity, toDelItem.price_unit ]
        const response = await db.query(sqlCommand, rowValues);
        const postedItem = response.rows[0];
        delItemUuid = postedItem.uuid;
      });

      after(`after DELETE ${baseUrl}/items/:itemUuid tests`, async function() {
        const sqlCommand = `DELETE FROM order_items WHERE uuid = '${delItemUuid}'`;
        return await db.query(sqlCommand);
      });

      describe(`Valid DELETE ${baseUrl}/items/:itemUuid`, function() {

        it('deletes an order item', async function() {
          const response = await request(app)
            .delete(`${baseUrl}/items/${delItemUuid}`)
            .expect(200)
          const itemUuid = response.text;
          expect(itemUuid).to.equal(delItemUuid);
        });
      });

      describe(`Invalid DELETE ${baseUrl}/items/:itemUuid`, function() {

        it('called with an invalid uuid returns a 404 error', function() {
          return request(app)
            .delete(`${baseUrl}/items/ABC`)          
            .expect(404)
        });

        it('called with a non existing uuid returns a 404 error', function() {
          return request(app)
            .delete(`${baseUrl}/items/${nonexistingUuid}`)          
            .expect(404)
        });        
      });    
    });

    describe(`DELETE ${baseUrl}/:uuid/allItems`, function() {
      let testOrderUuid;
      const toDelOrder = {
        created: new Date("05/15/2023"),
        modified: new Date("05/15/2323"),    
        status: 'Created',
        total_price: 120.95,
        user_uuid: user2Uuid
      }
      const toDelItems = [
        {
          product_uuid: product1Uuid,
          quantity: 3,
          price_unit: product1Price
        },
        {
          product_uuid: product2Uuid,
          quantity: 1,
          price_unit: product2Price
        },
        {
          product_uuid: product4Uuid,
          quantity: 2,
          price_unit: product4Price
        },
      ];

      before(`before DELETE ${baseUrl}/:uuid/allItems, insert test order`, async function() {
        const sqlCommand = `
          INSERT INTO orders (created, modified, status, total_price, user_uuid) 
          VALUES ($1, $2, $3, $4, $5) 
          RETURNING *;`;
        const { created, modified, status, total_price, user_uuid } = toDelOrder;
        const rowValues = [created, modified, status, total_price, user_uuid];
        const response = await db.query(sqlCommand, rowValues);
        const testOrder = response.rows[0];
        testOrderUuid = testOrder.uuid;
      });

      before(`before DELETE ${baseUrl}/:uuid/allItems, insert test order_items`, async function() {
        const sqlCommand = `
          INSERT INTO order_items (order_uuid, product_uuid, quantity, price_unit) 
          VALUES ($1, $2, $3, $4) 
          RETURNING *;`;
        try {
          for (let i = 0; i < toDelItems.length; i++) {
            const item = toDelItems[i];
            const { product_uuid, quantity, price_unit } = item;
            const rowValues = [testOrderUuid, product_uuid, quantity, price_unit];
            await db.query(sqlCommand, rowValues);
          }
          return toDelItems.length;
        } catch (error) {
          return error;
        }
      });

      after(`after DELETE ${baseUrl}/:uuid/allItems, remove test order_items`, async function() {
        const sqlCommand = `DELETE FROM order_items WHERE order_uuid = '${testOrderUuid}'`;
        await db.query(sqlCommand);
      });

      after(`after DELETE ${baseUrl}/:uuid/allItems, remove test order`, async function() {
        const sqlCommand = `DELETE FROM orders WHERE uuid = '${testOrderUuid}'`;
        await db.query(sqlCommand);
      });

      describe(`Valid DELETE ${baseUrl}/:uuid/allItems`, function() {

        it('deletes all order items from an order', async function() {
          const response = await request(app)
            .delete(`${baseUrl}/${testOrderUuid}/allItems`)
            .expect(200);
          const itemUuid = response.text;
          expect(itemUuid).to.equal(testOrderUuid);
        });
      });

      describe(`Invalid DELETE ${baseUrl}/:uuid/allItems`, function() {

        it('called with an invalid uuid returns a 404 error', function() {
          return request(app)
            .delete(`${baseUrl}/ABC/allItems`)        
            .expect(404)
        });

        it('called with a non existing uuid returns a 404 error', function() {
          return request(app)
            .delete(`${baseUrl}/${nonexistingUuid}/allItems`)          
            .expect(404)
        });        
      });
    });

  });

};

module.exports = testOrderItems;
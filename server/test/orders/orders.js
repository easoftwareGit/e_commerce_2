const expect = require('chai').expect;
const request = require('supertest');
const db = require('../../db/db');

const dbTools = require('../../db/dbTools');
const { assert } = require('chai');

const setupOrders = require('./setupOrders');
const orderCount = setupOrders.orderCount;

const {
  ordersTableName,
  ordersUserUuidForeignKeyName,
  orderItemsTableName
} = require('../myConsts');

require("dotenv").config();
const baseUrl = `${process.env.BASEURL}/orders`; 

function testOrders(app) {

  describe(`${baseUrl} routes`, function () {
    const user1Uuid = '5bcefb5d-314f-ff1f-f5da-6521a2fa7bde';       // uuid of user #1
    const user3Uuid = '516a1130-8398-3234-fc31-6e31fb695b85';       // uuid of user #3
    const user4Uuid = '5735c309-d480-3236-62da-31e13c35b91e';       // uuid of user #4
    const user5Uuid = 'a24894ed-10c5-dd83-5d5c-bbfea7ac6dca';       // uuid of user #5
    const order2Uuid = 'd2f5edc9-156f-fbf2-695e-3eab6a7871b4';      // uuid of order #2
    const nonexistingUuid = '56d916ec-e6b5-0e62-9330-0248c6792317';

    describe('setup orders table', function() {

      before('before DROP orders, drop order_items table', async function() {
        await dbTools.dropTable(orderItemsTableName);
      });

      it('DROP orders', async function() {
        await dbTools.dropTable(ordersTableName);
        const doesExist = await dbTools.tableExists(ordersTableName);      
        expect(doesExist).to.be.false;
      });

      it('CREATE orders', async function() {
        await setupOrders.createOrdersTable();
        const doesExist = await dbTools.tableExists(ordersTableName);      
        expect(doesExist).to.be.true;     
      });

      it('check for orders FOREIGN KEY', async function() {        
        const doesExist = await dbTools.foreignKeyExists(ordersUserUuidForeignKeyName);      
        expect(doesExist).to.be.true;
      });

      it(`GET ${baseUrl} with no data in table, returns string`, async function() {
        const response = await request(app)
          .get(baseUrl)
          .expect(200);        
        expect(response.body).to.be.an.instanceOf(Array);          
        expect(response.body.length).to.equal(0);              
      });

      it('INSERT new orders', async function() {
        const numInserted = await setupOrders.insertAllOrders(); 
        expect(numInserted).to.equal(orderCount);
      });      
    });

    describe('cannot DELETE users with an order', function() {
      let testUserUuid;
      let testOrderUuid;

      const user = {  
        email: 'greg@email.com',
        password_hash: '098765',
        first_name: 'Greg',
        last_name: 'Blue',
        phone: '800 555-8888'
      };        

      before('make sure test user is not in table', async function() {
        const sqlCommand = `DELETE FROM users WHERE email = $1`;        
        await db.query(sqlCommand, [user.email]);
      });

      before('insert test user', async function() {
        const sqlCommand = `
          INSERT INTO users (email, password_hash, first_name, last_name, phone) 
          VALUES ($1, $2, $3, $4, $5) 
          RETURNING *`;
        const { email, password_hash, first_name, last_name, phone } = user;
        const rowValues = [email, password_hash, first_name, last_name, phone];      
        const response = await db.query(sqlCommand, rowValues);
        const testUser = response.rows[0];
        testUserUuid = testUser.uuid;
      });

      before('insert test order', async function() {
        const order = {
          created: new Date("03/03/2323"),
          modified: new Date("03/03/2323"),    
          status: 'Created',
          total_price: 13.98,
          user_uuid: testUserUuid
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

      after('delete test order', async function() {    
        const sqlCommand = `DELETE FROM orders WHERE uuid = '${testOrderUuid}'`;
        await db.query(sqlCommand);
      });

      after('delete test user', async function() {
        const sqlCommand = `DELETE FROM users WHERE uuid = '${testUserUuid}'`;
        await db.query(sqlCommand);
      });

      it('test user exists before DELETE user', async function() {
        const sqlCommand = `SELECT * FROM users WHERE uuid = '${testUserUuid}'`;
        const response = await db.query(sqlCommand);
        const doesExist = response.rows.length === 1;
        expect(doesExist).to.be.true;
      });

      it('test order exists before DELETE user', async function() {
        const sqlCommand = `SELECT * FROM orders WHERE uuid = '${testOrderUuid}'`;
        const response = await db.query(sqlCommand);
        const doesExist = response.rows.length === 1;
        expect(doesExist).to.be.true;
      });

      it('try to DELETE user that has an order', async function () {        
        // DO NOT USE baseUrl here
        return await request(app)
          .delete(`/api/users/${testUserUuid}`)          
          .expect(409);   // constraint error
      });
    });

    describe(`GET ${baseUrl}`, function() {

      it('returns an array', async function() {
        const response = await request(app)
          .get(baseUrl)
          .expect(200);
        expect(response.body).to.be.an.instanceOf(Array);
      });

      it('returns an array of all orders', async function() {
        const response = await request(app)
          .get(baseUrl)
          .expect(200);
        expect(response.body.length).to.be.equal(orderCount);
        response.body.forEach((order) => {
          expect(order).to.have.ownProperty('uuid');
          expect(order).to.have.ownProperty('created');
          expect(order).to.have.ownProperty('modified');
          expect(order).to.have.ownProperty('total_price');
          expect(order).to.have.ownProperty('user_uuid');
        });
      });

    });

    describe(`GET ${baseUrl}/:uuid`, function() {      

      it('returns a single order object', async function() {
        const response = await request(app)
          .get(`${baseUrl}/${order2Uuid}`)
          .expect(200);
        const order = response.body;
        expect(order).to.be.an.instanceOf(Object);
        expect(order).to.not.be.an.instanceOf(Array);
      });

      it('returns a full order object', async function() {
        const response = await request(app)
          .get(`${baseUrl}/${order2Uuid}`)
          .expect(200);
        const order = response.body;
        expect(order).to.have.ownProperty('uuid');
        expect(order).to.have.ownProperty('created');
        expect(order).to.have.ownProperty('modified');
        expect(order).to.have.ownProperty('status');
        expect(order).to.have.ownProperty('total_price');
        expect(order).to.have.ownProperty('user_uuid');
      });

      it('returned order has the correct uuid', async function() {
        const response = await request(app)
          .get(`${baseUrl}/${order2Uuid}`)
          .expect(200);
        const order = response.body;
        expect(order.uuid).to.be.an.equal(order2Uuid);
      });

      it('called with an invalid formatted uuid returns a 404 error', function() {
        return request(app)
          .get(`${baseUrl}/ABC`)
          .expect(404);
      });

      it('called with an invalid formatted uuid returns a 404 error', function() {
        return request(app)
          .get(`${baseUrl}/${nonexistingUuid}`)
          .expect(404);
      });
    })

    describe(`POST ${baseUrl}`, function() {
      const newOrder = {
        created: new Date("06/16/2023"),         
        total_price: 123.45,
        user_uuid: user1Uuid
      };
      const invalidOrder = {
        total_price: 123.45,
        user_uuid: user5Uuid
      };
      const resetSqlCommand = `
        DELETE FROM orders
        WHERE user_uuid = '${user1Uuid}';`

      before('before first POST test', async function() {
        await db.query(resetSqlCommand);
      });

      after('after last POST test', async function() {
        await db.query(resetSqlCommand);
      });
  
      it('post a new order with valid data', async function() {
        const response = await request(app)
          .post(baseUrl)
          .send(newOrder)
          .expect(201);
        const postedOrder = response.body;
        // convert json date strings to dates
        postedOrder.created = new Date(postedOrder.created);
        postedOrder.modified = new Date(postedOrder.modified);
        // now compare - use deepEqual for dates        
        assert.deepEqual(postedOrder.created, newOrder.created);
        assert.deepEqual(postedOrder.modified, newOrder.created); // yes compare to created
        assert.equal(postedOrder.status, 'Created');
        assert.equal(postedOrder.total_price, newOrder.total_price)
        assert.equal(postedOrder.user_uuid, newOrder.user_uuid);
      });

      it('did NOT post order with no created', async function() {
        return await request(app)
          .post(baseUrl)
          .send(invalidOrder)
          .expect(400);
      });

      it('did NOT post order with no total_price', async function() {
        invalidOrder.created = new Date("06/16/2323")
        invalidOrder.total_price = null;
        return await request(app)
          .post(baseUrl)
          .send(invalidOrder)
          .expect(400);
      });

      it('did NOT post order with no user_uuid', async function() {
        invalidOrder.total_price = 23.45;
        invalidOrder.user_uuid = null;
        return await request(app)
          .post(baseUrl)
          .send(invalidOrder)
          .expect(400);
      });

      it('did NOT post order with a non existing user_uuid', async function() {
        invalidOrder.total_price = 23.45;
        invalidOrder.user_uuid = nonexistingUuid;
        return await request(app)
          .post(baseUrl)
          .send(invalidOrder)
          .expect(409);
      });

      it('did NOT post order with an invalid user_uuid', async function() {
        invalidOrder.total_price = 23.45;
        invalidOrder.user_uuid = 'ABC';
        return await request(app)
          .post(baseUrl)
          .send(invalidOrder)
          .expect(400);
      });

    });

    describe(`PUT ${baseUrl}/:uuid`, function() {      
      const resetSqlCommand = `
        UPDATE orders 
        SET modified = '02/02/2323', 
            status = 'Created', 
            total_price = 57.97,
            user_uuid = '${user4Uuid}'
        WHERE uuid = '${order2Uuid}';`;
      const testOrder = {                        
        modified: new Date('03/12/23'),
        status: 'Shipped',
        total_price: 12.34,
        user_uuid: user3Uuid
      };

      describe(`Valid ${baseUrl}/:uuid`, function() {

        before('before 1st PUT test', async function() {
          await db.query(resetSqlCommand);
        });
  
        afterEach('afterEach PUT test ', async function() {      
          await db.query(resetSqlCommand);
        });

        it('updates the correct order and returns it', async function() {
          let initialOrder;
          let updatedOrder;      

          const response = await request(app)
            .get(`${baseUrl}/${order2Uuid}`);
          initialOrder = response.body;
          updatedOrder = Object.assign({}, testOrder);
          const response_1 = await request(app)
            .put(`${baseUrl}/${order2Uuid}`)
            .send(updatedOrder)
            .expect(200);
          const returnedOrder = response_1.body;
          // convert json date strings to dates
          returnedOrder.created = new Date(returnedOrder.created);
          returnedOrder.modified = new Date(returnedOrder.modified);
          initialOrder.created = new Date(initialOrder.created);
          // now compare - use deepEqual for dates
          assert.equal(returnedOrder.uuid, order2Uuid);
          assert.deepEqual(returnedOrder.created, initialOrder.created);  // yes compare to initialOrder
          assert.deepEqual(returnedOrder.modified, updatedOrder.modified);
          assert.equal(returnedOrder.status, updatedOrder.status);
          assert.equal(returnedOrder.total_price, updatedOrder.total_price);
          assert.equal(returnedOrder.user_uuid, updatedOrder.user_uuid);
        });
      });

      describe(`Invalid ${baseUrl}/:uuid`, function() {

        it('called with an invalid uuid returns a 404 error', function() {
          return request(app)
            .put(`${baseUrl}/ABC`)
            .send(testOrder)
            .expect(404)
        });

        it('called with a non existing uuid returns a 404 error', function() {
          return request(app)
            .put(`${baseUrl}/${nonexistingUuid}`)
            .send(testOrder)
            .expect(404)
        });        

        // other tests for missing data performed in POST tests        
        it('PUT with with no modified', function() {
          const missingDataOrder = Object.assign({}, testOrder);
          missingDataOrder.modified = null;
          return request(app)
            .put(`${baseUrl}/${order2Uuid}`)
            .send(missingDataOrder)
            .expect(400)
        });

        it('PUT with with no status', function() {
          const missingDataOrder = Object.assign({}, testOrder);
          missingDataOrder.status = null;
          return request(app)
            .put(`${baseUrl}/${order2Uuid}`)
            .send(missingDataOrder)
            .expect(400)
        });

        it('did NOT PUT order with non existant user_uuid', async function() {
          const nonExistingUserOrder = Object.assign({}, testOrder);          
          nonExistingUserOrder.user_uuid = nonexistingUuid;
          return await request(app)
            .put(`${baseUrl}/${order2Uuid}`)
            .send(nonExistingUserOrder)
            .expect(409);
        });
    
      });
    });

    describe(`DELETE ${baseUrl}/:uuid`, function() {
      const toDelOrder = {
        created: new Date("04/14/2323"),
        total_price: 23.45,
        user_uuid: user1Uuid
      };
      let delOrderUuid;

      before('before DELETE tests', async function() {
        const response = await request(app)
          .post(baseUrl)
          .send(toDelOrder);
        const postedOrder = response.body;
        delOrderUuid = postedOrder.uuid;
      });

      describe(`Valid DELETE ${baseUrl}/:uuid`, function() {

        it('deletes an order', async function() {
          const response = await request(app)
            .delete(`${baseUrl}/${delOrderUuid}`)
            .expect(200);
          const orderUuid = response.text;
          expect(orderUuid).to.equal(delOrderUuid);
        });
      });

      describe(`Invalid DELETE ${baseUrl}/:uuid`, function() {

        it('called with an invalid uuid', function() {
          return request(app)
            .delete(`${baseUrl}/ABC`)
            .expect(404);
        });

        it('called with a non existing uuid', function() {
          return request(app)
            .delete(`${baseUrl}/${nonexistingUuid}`)
            .expect(404);
        });
      });
    });

  });
};

module.exports = testOrders;
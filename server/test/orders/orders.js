const expect = require('chai').expect;
const request = require('supertest');
const db = require('../../db/db');

const dbTools = require('../../db/dbTools');
const { assert } = require('chai');

const setupOrders = require('./setupOrders');
const orderCount = setupOrders.orderCount;

const {
  ordersTableName,
  ordersUserGuidForeignKeyName,
  orderItemsTableName
} = require('../myConsts');

require("dotenv").config();
const baseUrl = `${process.env.BASEURL}/orders`; 

function testOrders(app) {

  describe(`${baseUrl} routes`, function () {
    const user1Guid = '5bcefb5d-314f-ff1f-f5da-6521a2fa7bde';       // guid of user #1
    const user3Guid = '516a1130-8398-3234-fc31-6e31fb695b85';       // guid of user #3
    const user4Guid = '5735c309-d480-3236-62da-31e13c35b91e';       // guid of user #4
    const user5Guid = 'a24894ed-10c5-dd83-5d5c-bbfea7ac6dca';       // guid of user #5
    const order2Guid = 'd2f5edc9-156f-fbf2-695e-3eab6a7871b4';      // guid of order #2
    const nonexistingGuid = '56d916ec-e6b5-0e62-9330-0248c6792317';

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
        const doesExist = await dbTools.foreignKeyExists(ordersUserGuidForeignKeyName);      
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
      let testUserGuid;
      let testOrderGuid;

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
        testUserGuid = testUser.guid;
      });

      before('insert test order', async function() {
        const order = {
          created: new Date("03/03/2323"),
          modified: new Date("03/03/2323"),    
          status: 'Created',
          total_price: 13.98,
          user_guid: testUserGuid
        };
        const sqlCommand = `
          INSERT INTO orders (created, modified, status, total_price, user_guid) 
          VALUES ($1, $2, $3, $4, $5) 
          RETURNING *`;
        const { created, modified, status, total_price, user_guid } = order;
        const rowValues = [created, modified, status, total_price, user_guid];
        const response = await db.query(sqlCommand, rowValues);
        const testOrder = response.rows[0];
        testOrderGuid = testOrder.guid;
      });

      after('delete test order', async function() {    
        const sqlCommand = `DELETE FROM orders WHERE guid = '${testOrderGuid}'`;
        await db.query(sqlCommand);
      });

      after('delete test user', async function() {
        const sqlCommand = `DELETE FROM users WHERE guid = '${testUserGuid}'`;
        await db.query(sqlCommand);
      });

      it('test user exists before DELETE user', async function() {
        const sqlCommand = `SELECT * FROM users WHERE guid = '${testUserGuid}'`;
        const response = await db.query(sqlCommand);
        const doesExist = response.rows.length === 1;
        expect(doesExist).to.be.true;
      });

      it('test order exists before DELETE user', async function() {
        const sqlCommand = `SELECT * FROM orders WHERE guid = '${testOrderGuid}'`;
        const response = await db.query(sqlCommand);
        const doesExist = response.rows.length === 1;
        expect(doesExist).to.be.true;
      });

      it('try to DELETE user that has an order', async function () {        
        // DO NOT USE baseUrl here
        return await request(app)
          .delete(`/api/users/${testUserGuid}`)          
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
          expect(order).to.have.ownProperty('guid');
          expect(order).to.have.ownProperty('created');
          expect(order).to.have.ownProperty('modified');
          expect(order).to.have.ownProperty('total_price');
          expect(order).to.have.ownProperty('user_guid');
        });
      });

    });

    describe(`GET ${baseUrl}/:guid`, function() {      

      it('returns a single order object', async function() {
        const response = await request(app)
          .get(`${baseUrl}/${order2Guid}`)
          .expect(200);
        const order = response.body;
        expect(order).to.be.an.instanceOf(Object);
        expect(order).to.not.be.an.instanceOf(Array);
      });

      it('returns a full order object', async function() {
        const response = await request(app)
          .get(`${baseUrl}/${order2Guid}`)
          .expect(200);
        const order = response.body;
        expect(order).to.have.ownProperty('guid');
        expect(order).to.have.ownProperty('created');
        expect(order).to.have.ownProperty('modified');
        expect(order).to.have.ownProperty('status');
        expect(order).to.have.ownProperty('total_price');
        expect(order).to.have.ownProperty('user_guid');
      });

      it('returned order has the correct guid', async function() {
        const response = await request(app)
          .get(`${baseUrl}/${order2Guid}`)
          .expect(200);
        const order = response.body;
        expect(order.guid).to.be.an.equal(order2Guid);
      });

      it('called with an invalid formatted guid returns a 404 error', function() {
        return request(app)
          .get(`${baseUrl}/ABC`)
          .expect(404);
      });

      it('called with an invalid formatted guid returns a 404 error', function() {
        return request(app)
          .get(`${baseUrl}/${nonexistingGuid}`)
          .expect(404);
      });
    })

    describe(`POST ${baseUrl}`, function() {
      const newOrder = {
        created: new Date("06/16/2023"),         
        total_price: 123.45,
        user_guid: user1Guid
      };
      const invalidOrder = {
        total_price: 123.45,
        user_guid: user5Guid
      };
      const resetSqlCommand = `
        DELETE FROM orders
        WHERE user_guid = '${user1Guid}';`

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
        assert.equal(postedOrder.user_guid, newOrder.user_guid);
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

      it('did NOT post order with no user_guid', async function() {
        invalidOrder.total_price = 23.45;
        invalidOrder.user_guid = null;
        return await request(app)
          .post(baseUrl)
          .send(invalidOrder)
          .expect(400);
      });

      it('did NOT post order with a non existing user_guid', async function() {
        invalidOrder.total_price = 23.45;
        invalidOrder.user_guid = nonexistingGuid;
        return await request(app)
          .post(baseUrl)
          .send(invalidOrder)
          .expect(409);
      });

      it('did NOT post order with an invalid user_guid', async function() {
        invalidOrder.total_price = 23.45;
        invalidOrder.user_guid = 'ABC';
        return await request(app)
          .post(baseUrl)
          .send(invalidOrder)
          .expect(400);
      });

    });

    describe(`PUT ${baseUrl}/:guid`, function() {      
      const resetSqlCommand = `
        UPDATE orders 
        SET modified = '02/02/2323', 
            status = 'Created', 
            total_price = 57.97,
            user_guid = '${user4Guid}'
        WHERE guid = '${order2Guid}';`;
      const testOrder = {                        
        modified: new Date('03/12/23'),
        status: 'Shipped',
        total_price: 12.34,
        user_guid: user3Guid
      };

      describe(`Valid ${baseUrl}/:guid`, function() {

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
            .get(`${baseUrl}/${order2Guid}`);
          initialOrder = response.body;
          updatedOrder = Object.assign({}, testOrder);
          const response_1 = await request(app)
            .put(`${baseUrl}/${order2Guid}`)
            .send(updatedOrder)
            .expect(200);
          const returnedOrder = response_1.body;
          // convert json date strings to dates
          returnedOrder.created = new Date(returnedOrder.created);
          returnedOrder.modified = new Date(returnedOrder.modified);
          initialOrder.created = new Date(initialOrder.created);
          // now compare - use deepEqual for dates
          assert.equal(returnedOrder.guid, order2Guid);
          assert.deepEqual(returnedOrder.created, initialOrder.created);  // yes compare to initialOrder
          assert.deepEqual(returnedOrder.modified, updatedOrder.modified);
          assert.equal(returnedOrder.status, updatedOrder.status);
          assert.equal(returnedOrder.total_price, updatedOrder.total_price);
          assert.equal(returnedOrder.user_guid, updatedOrder.user_guid);
        });
      });

      describe(`Invalid ${baseUrl}/:guid`, function() {

        it('called with an invalid guid returns a 404 error', function() {
          return request(app)
            .put(`${baseUrl}/ABC`)
            .send(testOrder)
            .expect(404)
        });

        it('called with a non existing guid returns a 404 error', function() {
          return request(app)
            .put(`${baseUrl}/${nonexistingGuid}`)
            .send(testOrder)
            .expect(404)
        });        

        // other tests for missing data performed in POST tests        
        it('PUT with with no modified', function() {
          const missingDataOrder = Object.assign({}, testOrder);
          missingDataOrder.modified = null;
          return request(app)
            .put(`${baseUrl}/${order2Guid}`)
            .send(missingDataOrder)
            .expect(400)
        });

        it('PUT with with no status', function() {
          const missingDataOrder = Object.assign({}, testOrder);
          missingDataOrder.status = null;
          return request(app)
            .put(`${baseUrl}/${order2Guid}`)
            .send(missingDataOrder)
            .expect(400)
        });

        it('did NOT PUT order with non existant user_guid', async function() {
          const nonExistingUserOrder = Object.assign({}, testOrder);          
          nonExistingUserOrder.user_guid = nonexistingGuid;
          return await request(app)
            .put(`${baseUrl}/${order2Guid}`)
            .send(nonExistingUserOrder)
            .expect(409);
        });
    
      });
    });

    describe(`DELETE ${baseUrl}/:guid`, function() {
      const toDelOrder = {
        created: new Date("04/14/2323"),
        total_price: 23.45,
        user_guid: user1Guid
      };
      let delOrderGuid;

      before('before DELETE tests', async function() {
        const response = await request(app)
          .post(baseUrl)
          .send(toDelOrder);
        const postedOrder = response.body;
        delOrderGuid = postedOrder.guid;
      });

      describe(`Valid DELETE ${baseUrl}/:guid`, function() {

        it('deletes an order', async function() {
          const response = await request(app)
            .delete(`${baseUrl}/${delOrderGuid}`)
            .expect(200);
          const orderGuid = response.text;
          expect(orderGuid).to.equal(delOrderGuid);
        });
      });

      describe(`Invalid DELETE ${baseUrl}/:guid`, function() {

        it('called with an invalid guid', function() {
          return request(app)
            .delete(`${baseUrl}/ABC`)
            .expect(404);
        });

        it('called with a non existing guid', function() {
          return request(app)
            .delete(`${baseUrl}/${nonexistingGuid}`)
            .expect(404);
        });
      });
    });

  });
};

module.exports = testOrders;
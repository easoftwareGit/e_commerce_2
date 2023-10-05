const expect = require('chai').expect;
const request = require('supertest');
const db = require('../../db/db');

const dbTools = require('../../db/dbTools');
const { assert } = require('chai');

const setupCarts = require('./setupCarts');
const cartCount = setupCarts.cartCount;

const {
  cartsTableName,
  cartsUserUuidForeignKeyName,
  cartItemsTableName
} = require('../myConsts');

require("dotenv").config();
const baseUrl = `${process.env.BASEURL}/carts`; 

function testCarts(app) {

  describe(`${baseUrl} routes`, function () {
    const cart2Uuid = '82433d04-acae-0036-7391-ab6356601ad0'; // 2nd cart from sample data
    const user3Uuid = '516a1130-8398-3234-fc31-6e31fb695b85'; // user 4, linked to cart #2
    const nonexistingUuid = '56d916ec-e6b5-0e62-9330-0248c6792317';

    describe('setup carts table', function() {

      before('before setup carts, drop cart_items', async function() {
        const doesExist = await dbTools.tableExists(cartItemsTableName); 
        if (doesExist) {
          await dbTools.dropTable(cartItemsTableName);
        }
      });

      it('DROP carts', async function() {
        await dbTools.dropTable(cartsTableName);
        const doesExist = await dbTools.tableExists(cartsTableName);      
        expect(doesExist).to.be.false;
      });

      it('CREATE carts', async function() {
        await setupCarts.createCartsTable();
        const doesExist = await dbTools.tableExists(cartsTableName);      
        expect(doesExist).to.be.true;     
      });
      
      it('check for carts FOREIGN KEY', async function() {        
        const doesExist = await dbTools.foreignKeyExists(cartsUserUuidForeignKeyName);      
        expect(doesExist).to.be.true;
      });

      it(`GET ${baseUrl} with no data in table, returns array`, async function() {
        const response = await request(app)
          .get(baseUrl)
          .expect(200);        
        // expect(response.body).to.be.a('string');
        expect(response.body).to.be.an.instanceOf(Array);          
        expect(response.body.length).to.equal(0);
      });

      it('INSERT new carts', async function() {
        const numInserted = await setupCarts.insertAllCarts(); 
        expect(numInserted).to.equal(cartCount);
      });            
    });

    describe('cannot DELETE users with a cart', function() {
      let testUserUuid;
      let testCartUuid;
      const user = {  
        email: 'greg@email.com',
        password_hash: '098765',
        first_name: 'Greg',
        last_name: 'Blue',
        phone: '800 555-8888'
      };        
      
      before('delete any remaining test user', async function () {
        const sqlCommand = `DELETE FROM users WHERE email = '${user.email}';`;
        await db.query(sqlCommand);        
      })

      before('insert test user', async function() {
        const sqlCommand = `
          INSERT INTO users (email, password_hash, first_name, last_name, phone) 
          VALUES ($1, $2, $3, $4, $5) 
          RETURNING *;`;
        const { email, password_hash, first_name, last_name, phone } = user;
        const rowValues = [email, password_hash, first_name, last_name, phone];      
        const response = await db.query(sqlCommand, rowValues);
        const testUser = response.rows[0];
        testUserUuid = testUser.uuid;
      });

      before('insert test cart', async function() {
        const cart = {
          created: new Date("06/26/2323"),
          modified: new Date("06/26/2323"),    
          user_uuid: testUserUuid
        };
        const sqlCommand = `
          INSERT INTO carts (created, modified, user_uuid) 
          VALUES ($1, $2, $3) 
          RETURNING *;`;
        const { created, modified, user_uuid } = cart;
        const rowValues = [created, modified, user_uuid];
        const response = await db.query(sqlCommand, rowValues);
        const testCart = response.rows[0];
        testCartUuid = testCart.uuid;        
      });

      after('delete test cart', async function() {    
        const sqlCommand = `DELETE FROM carts WHERE uuid = '${testCartUuid}';`;        
        await db.query(sqlCommand);
      });

      after('delete test user', async function() {
        const sqlCommand = `DELETE FROM users WHERE email = '${user.email}';`;
        await db.query(sqlCommand);
      });

      it('test user exists before DELETE user', async function() {
        const sqlCommand = `SELECT * FROM users WHERE uuid = '${testUserUuid}';`;
        const response = await db.query(sqlCommand);
        const doesExist = response.rows.length === 1;
        expect(doesExist).to.be.true;
      });

      it('test cart exists before DELETE user', async function() {
        const sqlCommand = `SELECT * FROM carts WHERE uuid = '${testCartUuid}';`;
        const response = await db.query(sqlCommand);
        const doesExist = response.rows.length === 1;
        expect(doesExist).to.be.true;
      });

      it('try to DELETE user that has a cart', async function () {        
        // DO NOT USE baseUrl here. delete from "/api/users/####"
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

      it('returns an array of all carts', async function() {
        const response = await request(app)
          .get(baseUrl)
          .expect(200);
        expect(response.body.length).to.be.equal(cartCount);
        response.body.forEach((cart) => {
          expect(cart).to.have.ownProperty('uuid');
          expect(cart).to.have.ownProperty('created');
          expect(cart).to.have.ownProperty('modified');
          expect(cart).to.have.ownProperty('user_uuid');
        });
      });

    });

    describe(`GET ${baseUrl}/cart/:uuid`, function() {      

      it('returns a single cart object', async function() {
        const response = await request(app)
          .get(`${baseUrl}/cart/${cart2Uuid}`)
          .expect(200);
        const cart = response.body;
        expect(cart).to.be.an.instanceOf(Object);
        expect(cart).to.not.be.an.instanceOf(Array);
      });

      it('returns a full cart object', async function() {
        const response = await request(app)
          .get(`${baseUrl}/cart/${cart2Uuid}`)
          .expect(200);
        const cart = response.body;
        expect(cart).to.have.ownProperty('uuid');
        expect(cart).to.have.ownProperty('created');
        expect(cart).to.have.ownProperty('modified');
        expect(cart).to.have.ownProperty('user_uuid');
      });

      it('returned cart has the correct uuid', async function() {
        const response = await request(app)
          .get(`${baseUrl}/cart/${cart2Uuid}`)
          .expect(200);
        const cart = response.body;
        expect(cart.uuid).to.be.an.equal(cart2Uuid);
      });

      it('called with an invalid formatted uuid returns a 404 error', function() {
        return request(app)
          .get(`${baseUrl}/cart/ABC`)
          .expect(404);
      });

      it('called with an invalid formatted uuid returns a 404 error', function() {
        return request(app)
          .get(`${baseUrl}/cart/${nonexistingUuid}`)
          .expect(404);
      });
    });

    describe(`GET ${baseUrl}/user/:uuid`, function() {      

      it('returns a single cart object', async function() {
        const response = await request(app)
          .get(`${baseUrl}/user/${user3Uuid}`)
          .expect(200);
        const cart = response.body;
        expect(cart).to.be.an.instanceOf(Object);
        expect(cart).to.not.be.an.instanceOf(Array);
      });

      it('returns a full cart object', async function() {
        const response = await request(app)
          .get(`${baseUrl}/user/${user3Uuid}`)
          .expect(200);
        const cart = response.body;
        expect(cart).to.have.ownProperty('uuid');
        expect(cart).to.have.ownProperty('created');
        expect(cart).to.have.ownProperty('modified');
        expect(cart).to.have.ownProperty('user_uuid');
      });

      it('returned cart has the correct uuid', async function() {
        const response = await request(app)
          .get(`${baseUrl}/user/${user3Uuid}`)
          .expect(200);
        const cart = response.body;
        expect(cart.uuid).to.be.an.equal(cart2Uuid);
        expect(cart.user_uuid).to.be.an.equal(user3Uuid);
      });

      it('called with an invalid formatted uuid returns a 404 error', function() {
        return request(app)
          .get(`${baseUrl}/user/ABC`)
          .expect(404);
      });

      it('called with an invalid formatted uuid returns a 404 error', function() {
        return request(app)
          .get(`${baseUrl}/user/${nonexistingUuid}`)
          .expect(404);
      });
    });

    describe(`POST ${baseUrl}`, function () {
      const userUuid = 'a24894ed-10c5-dd83-5d5c-bbfea7ac6dca';
      const newCart = {
        created: new Date("05/29/2323"),
        modified: new Date("05/29/2323"),    
        user_uuid: userUuid
      };
      const invalidCart = {
        modified: new Date("05/29/2323"),    
        user_uuid: userUuid
      };
      const resetSqlCommand = `
        DELETE FROM carts
        WHERE user_uuid = '${userUuid}';`

      before('before first POST test', async function() {
        await db.query(resetSqlCommand);
      });

      after('after last POST test', async function() {
        await db.query(resetSqlCommand);
      });
  
      it('post a new cart with valid data', async function() {
        const response = await request(app)
          .post(baseUrl)
          .send(newCart)
          .expect(201);
        const postedCart = response.body;
        // convert json date strings to dates
        postedCart.created = new Date(postedCart.created);
        postedCart.modified = new Date(postedCart.modified);
        // now compare - use deepEqual for dates
        assert.deepEqual(postedCart.created, newCart.created);
        assert.deepEqual(postedCart.modified, newCart.modified);
        assert.equal(postedCart.user_uuid, newCart.user_uuid);
      });

      it('did NOT post cart with a duplicate user_uuid', async function() {
        return await request(app)
          .post(baseUrl)
          .send(newCart)
          .expect(400);
      });

      it('did NOT post cart with no created', async function() {
        return await request(app)
          .post(baseUrl)
          .send(invalidCart)
          .expect(400);
      });

      it('did NOT post cart with no user_uuid', async function() {        
        invalidCart.modified = invalidCart.created;
        invalidCart.user_uuid = null;
        return await request(app)
          .post(baseUrl)
          .send(invalidCart)
          .expect(400);
      });
    });

    describe(`PUT ${baseUrl}/:uuid`, function () {
      const user3Uuid = '516a1130-8398-3234-fc31-6e31fb695b85';   
      const resetSqlCommand = `
        UPDATE carts 
        SET created = '01/03/2023', modified = '01/04/2023', user_uuid = '${user3Uuid}'
        WHERE uuid = '${cart2Uuid}';`;
      // in testCart: make sure to set created to correct date in carts table
      const testCart = {                
        created: new Date('01/03/23'),
        modified: new Date('05/26/23'),
        user_uuid: user3Uuid
      };
  
      describe(`Valid ${baseUrl}/:uuid`, function() {

        before('before 1st PUT test', async function() {
          await db.query(resetSqlCommand);
        });
  
        afterEach('afterEach PUT test ', async function() {      
          await db.query(resetSqlCommand);
        });

        it('updates the correct cart and returns it', async function() {
          let updatedCart;      

          updatedCart = Object.assign({}, testCart);
          const response = await request(app)
            .put(`${baseUrl}/${cart2Uuid}`)
            .send(updatedCart)
            .expect(200);
          const returnedCart = response.body;
          // convert json date strings to dates
          returnedCart.created = new Date(returnedCart.created);
          returnedCart.modified = new Date(returnedCart.modified);
          // now compare - use deepEqual for dates
          assert.equal(returnedCart.uuid, cart2Uuid); 
          assert.deepEqual(returnedCart.created, updatedCart.created);
          assert.deepEqual(returnedCart.modified, updatedCart.modified);
          assert.equal(returnedCart.user_uuid, updatedCart.user_uuid);
        });
      });
      
      describe(`Invalid ${baseUrl}/:uuid`, function() {
  
        it('called with an invalid uuid returns a 404 error', function() {
          return request(app)
            .put(`${baseUrl}/ABC`)
            .send(testCart)
            .expect(404)
        });

        it('called with a non existing uuid returns a 404 error', function() {
          return request(app)
            .put(`${baseUrl}/${nonexistingUuid}`)
            .send(testCart)
            .expect(404)
        });        

        // other tests for missing data performed in POST tests        
        it('did not PUT with with no modified date', async function() {
          const missingDataCart = Object.assign({}, testCart);
          missingDataCart.modified = null;
          return await request(app)
            .put(`${baseUrl}/${cart2Uuid}`)
            .send(missingDataCart)
            .expect(400)
        });

      });
    });
    
    describe(`DELETE ${baseUrl}/:uuid`, function() {
      const user2Uuid = '6714f724-f838-8f90-65a1-30359152dcdb'; 
      const toDelCart = {
        created: new Date("06/26/2323"),
        modified: new Date("06/26/2323"),    
        user_uuid: user2Uuid
      };
      const resetSqlCommand = `DELETE FROM carts WHERE user_uuid = '${user2Uuid}';`;
      let delCartUuid;
      
      before('before DELETE tests, reset from prior tests', async function() {
        await db.query(resetSqlCommand);
      })

      before('before DELETE tests', async function() {
        const sqlCommand = `
          INSERT INTO carts (created, modified, user_uuid) 
          VALUES ($1, $2, $3) 
          RETURNING *;`;
        const { created, modified, user_uuid } = toDelCart
        const rowValues = [created, modified, user_uuid];
        const response = await db.query(sqlCommand, rowValues);
        const postedCart = response.rows[0];
        delCartUuid = postedCart.uuid;
      });

      after('after DELETE tests', async function() {
        await db.query(resetSqlCommand);
      });

      describe(`Valid DELETE ${baseUrl}/:uuid`, function() {

        it('deletes a cart', async function() {
          const response = await request(app)
            .delete(`${baseUrl}/${delCartUuid}`)
            .expect(200);
          const cartUuid = response.text;
          expect(cartUuid).to.equal(delCartUuid);
        });
      });

      describe(`Invalid DELETE ${baseUrl}/:uuid`, function() {

        it('called with an invalid formatted uuid returns a 404 error', function() {
          return request(app)
            .delete(`${baseUrl}/ABC`)
            .expect(404);
        });

        it('called with a non existing uuid returns a 404 error', function() {
          return request(app)
            .delete(`${baseUrl}/${nonexistingUuid}`)
            .expect(404);
        });
      });
    });

  });
};

module.exports = testCarts;
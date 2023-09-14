const expect = require('chai').expect;
const request = require('supertest');
const db = require('../../db/db');
const { createGoogleUser } = require('../../db/userQueries');

const dbTools = require('../../db/dbTools');
const { assert } = require('chai');

const setupUsers = require('./setupUsers');
const userCount = setupUsers.userCount;

const { 
  usersTableName, 
  guidColName,
  emailColName,
  users_guid_index_name,
  users_email_index_name,
  cartsTableName,
  ordersTableName, 
  cartItemsTableName,
  orderItemsTableName
} = require('../myConsts');
const { findUserByEmail, findUserByGoogleId } = require('../../db/userQueries');
const { afterEach } = require('mocha');

require("dotenv").config();
const baseUrl = `${process.env.BASEURL}/users`; 

const user2Guid = '6714f724-f838-8f90-65a1-30359152dcdb';       // guid of 2nd user'
const user2Email = 'bill@gmail.com';
const user2GoogleId = '123456789012345678902';
const nonExistingGuid = '56d916ec-e6b5-0e62-9330-0248c6792316'; // 2nd product, not in users

function testUsers(app) {

  describe('/user routes', function() {
  
    describe('setup users table', function() {
  
      before('before setup users, DROP cart_items', async function() {
        const doesExist = await dbTools.tableExists(cartItemsTableName); 
        if (doesExist) {
          await dbTools.dropTable(cartItemsTableName);
        }
      });

      before('before setup users, DROP carts', async function() {
        const doesExist = await dbTools.tableExists(cartsTableName); 
        if (doesExist) {
          await dbTools.dropTable(cartsTableName);
        }
      });

      before('before setup users, DROP order_items', async function() {
        const doesExist = await dbTools.tableExists(orderItemsTableName); 
        if (doesExist) {
          await dbTools.dropTable(orderItemsTableName);
        }
      });
      before('before setup users, DROP orders', async function() {
        const doesExist = await dbTools.tableExists(ordersTableName); 
        if (doesExist) {
          await dbTools.dropTable(ordersTableName);
        }
      });

      before('before setup users, DROP orders', async function() {
        const doesExist = await dbTools.tableExists(ordersTableName); 
        if (doesExist) {
          await dbTools.dropTable(ordersTableName);
        }
      });

      it('DROP users', async function() {
        await dbTools.dropTable(usersTableName);      
        const doesExist = await dbTools.tableExists(usersTableName);      
        expect(doesExist).to.be.false;
      });
  
      it('CREATE users', async function() {
        await setupUsers.createUsersTable();
        const doesExist = await dbTools.tableExists(usersTableName);      
        expect(doesExist).to.be.true;
      });
  
      it('CREATE INDEX for users guid', async function () {
        await setupUsers.createUsersIndex(users_guid_index_name, guidColName);    
        const doesExist = await dbTools.indexExists(users_guid_index_name);
        expect(doesExist).to.be.true;
      });


      it('CREATE INDEX for users email', async function () {
        await setupUsers.createUsersIndex(users_email_index_name, emailColName);
        const doesExist = await dbTools.indexExists(users_email_index_name);
        expect(doesExist).to.be.true;
      });
  
      it('INSERT new users', async function() {
        const numInserted = await setupUsers.insertAllUsers(); 
        expect(numInserted).to.equal(userCount);
      });
    });
  
    describe(`GET ${baseUrl}/users`, function() {
  
      it('returns an array', async function() {
        const response = await request(app)
          .get(baseUrl)
          .expect(200);
        expect(response.body).to.be.an.instanceOf(Array);
      });
        
      it('returns an array of all users', async function() {
        const response = await request(app)
          .get(baseUrl)
          .expect(200);
        expect(response.body.length).to.be.equal(userCount);
        response.body.forEach((user) => {
          expect(user).to.have.ownProperty('guid');
          expect(user).to.have.ownProperty('email');
          expect(user).to.have.ownProperty('password_hash');
          expect(user).to.have.ownProperty('first_name');
          expect(user).to.have.ownProperty('last_name');
          expect(user).to.have.ownProperty('phone');
          expect(user).to.have.ownProperty('google');
        });
      });
    });
  
    describe(`GET ${baseUrl}/:guid`, function() {      
  
      it('returns a single user object', async function() {
        const response = await request(app)
          .get(`${baseUrl}/${user2Guid}`)
          .expect(200);
        const user = response.body;
        expect(user).to.be.an.instanceOf(Object);
        expect(user).to.not.be.an.instanceOf(Array);
      });
  
      it('returns a full user object', async function() {
        const response = await request(app)
          .get(`${baseUrl}/${user2Guid}`)
          .expect(200);
        const user = response.body;
        expect(user).to.have.ownProperty('guid');
        expect(user).to.have.ownProperty('email');
        expect(user).to.have.ownProperty('password_hash');
        expect(user).to.have.ownProperty('first_name');
        expect(user).to.have.ownProperty('last_name');
        expect(user).to.have.ownProperty('phone');
        expect(user).to.have.ownProperty('google');
      });
  
      it('returned user has the correct guid', async function() {
        const response = await request(app)
          .get(`${baseUrl}/${user2Guid}`)
          .expect(200);
        const user = response.body;
        expect(user.guid).to.be.an.equal(user2Guid);
      });
  
      it('called with a invalid guid returns a 404 error', function() {
        return request(app)
          .get(`${baseUrl}/ABC`)
          .expect(404);
      });
  
      it('called with a non existing guid returns a 404 error', async function () {        
        return await request(app)
          .get(`${baseUrl}/${nonExistingGuid}`)        
          .expect(404);
      });
    });

    describe(`Invalid GET (malformed guid) ${baseUrl}/:guid`, function () {
      const getGuid = '56d916ec-e6b5-0e62-9330-0248c6792316'; // 2nd product
     
      describe(`Test first section of guid`, function () {

        it('called with an invalid formatted guid (7 chars 1st section) returns a 404 error', async function () {
          // only 7 chars in 1st section
          const malformedGuid = '56d916e-e6b5-0e62-9330-0248c6792316';
          return await request(app)
            .get(`${baseUrl}/${malformedGuid}`)
            .expect(404);
        });

        it('called with an invalid formatted guid (9 chars 1st section) returns a 404 error', async function () {
          // 9 chars in 1st section
          const malformedGuid = '56d916ecc-e6b5-0e62-9330-0248c6792316';
          return await request(app)
            .get(`${baseUrl}/${malformedGuid}`)
            .expect(404);
        });

        it('called with an invalid formatted guid (non-hex 1st section) returns a 404 error', async function () {
          // non hex char in 1st section
          const malformedGuid = '56d96eQ-e6b5-0e62-9330-0248c6792316';
          return await request(app)
            .get(`${baseUrl}/${malformedGuid}`)            
            .expect(404);
        });

      });

      describe(`Test second section of guid`, function () {

        it('called with an invalid formatted guid (3 chars 2nd section) returns a 404 error', async function () {
          const malformedGuid = '56d916ec-e6b-0e62-9330-0248c6792316';
          return await request(app)
            .get(`${baseUrl}/${malformedGuid}`)            
            .expect(404);
        });

        it('called with an invalid formatted guid (5 chars 2nd section) returns a 404 error', async function () {
          const malformedGuid = '56d916ec-e6b55-0e62-9330-0248c6792316';
          return await request(app)
            .get(`${baseUrl}/${malformedGuid}`)
            .expect(404);
        });

        it('called with an invalid formatted guid (non-hex 2nd section) returns a 404 error', async function () {
          const malformedGuid = '56d916ec-e6bZ-0e62-9330-0248c6792316';
          return await request(app)
            .get(`${baseUrl}/${malformedGuid}`)
            .expect(404);
        });

      });

      describe(`Test third section of guid`, function () {

        it('called with an invalid formatted guid (3 chars 3rd section) returns a 404 error', async function () {
          const malformedGuid = '56d916ec-e6b5-0e6-9330-0248c6792316';
          return await request(app)
            .get(`${baseUrl}/${malformedGuid}`)
            .expect(404);
        });

        it('called with an invalid formatted guid (5 chars 3rd section) returns a 404 error', async function () {
          const malformedGuid = '56d916ec-e6b5-0e622-9330-0248c6792316';
          return await request(app)
            .get(`${baseUrl}/${malformedGuid}`)            
            .expect(404);
        });

        it('called with an invalid formatted guid (non-hex 3rd section) returns a 404 error', async function () {
          const malformedGuid = '56d916ec-e6b5-0e6W-9330-0248c6792316';
          return await request(app)
            .get(`${baseUrl}/${malformedGuid}`)            
            .expect(404);
        });

      });

      describe(`Test forth section of guid`, function () {

        it('called with an invalid formatted guid (3 chars 4th section) returns a 404 error', async function () {
          const malformedGuid = '56d916ec-e6b5-0e62-933-0248c6792316';
          return await request(app)
            .get(`${baseUrl}/${malformedGuid}`)
            .expect(404);
        });

        it('called with an invalid formatted guid (5 chars 4th section) returns a 404 error', async function () {
          const malformedGuid = '56d916ec-e6b5-0e62-93300-0248c6792316';
          return await request(app)
            .get(`${baseUrl}/${malformedGuid}`)            
            .expect(404);
        });

        it('called with an invalid formatted guid (non-hex 4th section) returns a 404 error', async function () {
          const malformedGuid = '56d916ec-e6b5-0e62-933P-0248c6792316';
          return await request(app)
            .get(`${baseUrl}/${malformedGuid}`)            
            .expect(404);
        });

      });

      describe(`Test fifth section of guid`, function () {

        it('called with an invalid formatted guid (11 chars 5th section) returns a 404 error', async function () {
          const malformedGuid = '56d916ec-e6b5-0e62-9330-0248c679231';
          return await request(app)
            .get(`${baseUrl}/${malformedGuid}`)            
            .expect(404);
        });

        it('called with an invalid formatted guid (13 chars 5th section) returns a 404 error', async function () {
          const malformedGuid = '56d916ec-e6b5-0e62-9330-0248c67923166';
          return await request(app)
            .get(`${baseUrl}/${malformedGuid}`)            
            .expect(404);
        });

        it('called with an invalid formatted guid (non-hex 5th section) returns a 404 error', async function () {
          const malformedGuid = '56d916ec-e6b5-0e62-9330-0248c679231S';
          return await request(app)
            .get(`${baseUrl}/${malformedGuid}`)            
            .expect(404);
        });

      });

      describe(`Test seperators of guid`, function () {

        it('called with an invalid formatted guid (no "-" at index [8]) returns a 404 error', async function () {
          const malformedGuid = '56d916ec+e6b5-0e62-9330-0248c6792316';
          return await request(app)
            .get(`${baseUrl}/${malformedGuid}`)            
            .expect(404);
        });

        it('called with an invalid formatted guid (no "-" at index [13]) returns a 404 error', async function () {
          const malformedGuid = '56d916ec-e6b5*0e62-9330-0248c6792316';
          return await request(app)
            .get(`${baseUrl}/${malformedGuid}`)            
            .expect(404);
        });

        it('called with an invalid formatted guid (no "-" at index [18]) returns a 404 error', async function () {
          const malformedGuid = '56d916ec-e6b5-0e62+9330-0248c6792316';
          return await request(app)
            .get(`${baseUrl}/${malformedGuid}`)            
            .expect(404);
        });

        it('called with an invalid formatted guid (no "-" at index [18]) returns a 404 error', async function () {
          const malformedGuid = '56d916ec-e6b5-0e62-9330=0248c6792316';
          return await request(app)
            .get(`${baseUrl}/${malformedGuid}`)            
            .expect(404);
        });

      });

    });
  
    describe(`POST ${baseUrl} (no google)`, function() {
      const newUser = {        
        email: 'greg@email.com',
        password_hash: '098765',
        first_name: 'Greg',
        last_name: 'Blue',
        phone: '800 555-8888',
        google: null
      };
      const invalidUser = {
        password_hash: '098765',
        first_name: 'Greg',
        last_name: 'Blue',
        phone: '800 555-8888'
      };
      const resetSqlCommand = `
        DELETE FROM users         
        WHERE email = 'greg@email.com';`

      before('before first POST test', async function() {
        await db.query(resetSqlCommand);
      });

      after('after last POST test', async function() {
        await db.query(resetSqlCommand);
      });

      it('post a new user with valid data', async function() {
        const response = await request(app)
          .post(baseUrl)
          .send(newUser)
          .expect(201);
        const postedUser = response.body;
        assert.equal(postedUser.email, newUser.email);
        assert.equal(postedUser.password_hash, newUser.password_hash);
        assert.equal(postedUser.first_name, newUser.first_name);
        assert.equal(postedUser.last_name, newUser.last_name);
        assert.equal(postedUser.phone, newUser.phone);
        assert.equal(postedUser.google, newUser.google);
      });
  
      it('did NOT post user with a duplicate email', async function() {
        return await request(app)
          .post(baseUrl)
          .send(newUser)
          .expect(400);
      });
  
      it('did NOT post user with no email', async function() {
        return await request(app)
          .post(baseUrl)
          .send(invalidUser)
          .expect(400);
      });
    
      // it('did NOT post user with blank password_hash', async function() {
      //   invalidUser.email = 'invalid@email.com';
      //   invalidUser.password_hash = null;
      //   return await request(app)
      //     .post(baseUrl)
      //     .send(invalidUser)
      //     .expect(400);
      // });
  
      it('did NOT post user with blank first_name', async function() {
        invalidUser.password_hash = '123456';
        invalidUser.first_name = null;
        return await request(app)
          .post(baseUrl)
          .send(invalidUser)
          .expect(400);
      });
      
      it('did NOT post user with blank last_name', async function() {      
        invalidUser.first_name = 'Fred';
        invalidUser.last_name = null;
        return await request(app)
          .post(baseUrl)
          .send(invalidUser)
          .expect(400);
      });
  
    //   it('did NOT post user with blank phone', async function() {
    //     invalidUser.last_name = 'Green';
    //     invalidUser.phone = null;
    //     return await request(app)
    //       .post(baseUrl)
    //       .send(invalidUser)
    //       .expect(400);
    //   });
      
    }); 

    describe(`POST ${baseUrl} (with google)`, function() {
      const newUser = {        
        email: 'greg@email.com',
        password_hash: '098765',
        first_name: 'Greg',
        last_name: 'Blue',
        phone: '800 555-8888',
        google: '123456789012345678909'
      };
      const resetSqlCommand = `
        DELETE FROM users         
        WHERE email = 'greg@email.com';`

      before('before first POST test', async function() {
        await db.query(resetSqlCommand);
      });

      after('after last POST test', async function() {
        await db.query(resetSqlCommand);
      });

      it('post a new user with valid data', async function() {
        const response = await request(app)
          .post(baseUrl)
          .send(newUser)
          .expect(201);
        const postedUser = response.body;
        assert.equal(postedUser.email, newUser.email);
        assert.equal(postedUser.password_hash, newUser.password_hash);
        assert.equal(postedUser.first_name, newUser.first_name);
        assert.equal(postedUser.last_name, newUser.last_name);
        assert.equal(postedUser.phone, newUser.phone);
        assert.equal(postedUser.google, newUser.google);
      });
        
    });

    describe(`POST ${baseUrl}/google (from google)`, function() {
      const newUser = {        
        email: 'greg@email.com',        
        first_name: 'Greg',
        last_name: 'Blue',        
        google: '123456789012345678909'
      };
      const resetSqlCommand = `
        DELETE FROM users         
        WHERE email = 'greg@email.com';`

      before('before first POST test', async function() {
        await db.query(resetSqlCommand);
      });

      afterEach('after last POST test', async function() {
        await db.query(resetSqlCommand);
      });

      it('post a new user with valid data', async function() {
        const response = await request(app)
          .post(`${baseUrl}/google`)
          .send(newUser)
          .expect(201);
        const postedUser = response.body;
        assert.equal(postedUser.email, newUser.email);
        assert.equal(postedUser.password_hash, null);
        assert.equal(postedUser.first_name, newUser.first_name);
        assert.equal(postedUser.last_name, newUser.last_name);
        assert.equal(postedUser.phone, null);
        assert.equal(postedUser.google, newUser.google);
      });      
        
      it('create a google user via createGoogleUser()', async function () {
        const userRow = await createGoogleUser(newUser);
        expect(userRow).to.be.an.instanceOf(Object);
        assert.equal(userRow.email, newUser.email);
        assert.equal(userRow.password_hash, null);
        assert.equal(userRow.first_name, newUser.first_name);
        assert.equal(userRow.last_name, newUser.last_name);
        assert.equal(userRow.phone, null);
        assert.equal(userRow.google, newUser.google);
      });

    });
  
    describe(`PUT ${baseUrl}/:guid (no google)`, function() {
      const putUserGuid = user2Guid;
      const resetSqlCommand = `
        UPDATE users 
        SET email = 'bill@gmail.com', password_hash = 'abcdef', first_name = 'Bill', last_name = 'Smith', phone = '800-555-5555', google = '123456789012345678902'
        WHERE guid = '${user2Guid}';`;
      const testUser = {        
        email: "bob@email.com",
        password_hash: "zyxwvu",
        first_name: "Bob",
        last_name: "Jones",
        phone: "(800) 555-2211",
        google: null
      };

      describe(`Valid ${baseUrl}/:guid`, function() {

        before('before 1st PUT test', async function() {
          await db.query(resetSqlCommand);
        });
  
        afterEach('afterEach PUT test ', async function() {
          await db.query(resetSqlCommand);
        });
  
        it('updates the correct user and returns it', async function() {
          let initialUser;
          let updatedUser;      
          
          const response = await request(app)
            .get(`${baseUrl}/${putUserGuid}`);
          initialUser = response.body;          
          updatedUser = Object.assign({}, testUser);
          updatedUser.guid = putUserGuid;
          const response_1 = await request(app)
            .put(`${baseUrl}/${putUserGuid}`)
            .send(updatedUser)
            .expect(200);
          expect(response_1.body).to.be.deep.equal(updatedUser);
        });
      });
  
      describe(`Invalid PUT ${baseUrl}/:guid`, function() {
  
        it('called with an invalid guid returns a 404 error', function() {
          return request(app)
            .put(`${baseUrl}/ABC`)
            .send(testUser)
            .expect(404);
        });
  
        it('called with a non existing guid returns a 404 error', async function () {
          return await request(app)
            .put(`${baseUrl}/${nonExistingGuid}`)
            .send(testUser)
            .expect(404);
        });

        it('PUT duplicate email value', function() {  
          const putDuplicateEmail = 'adam@email.com';                  
          const duplicateUser = Object.assign({}, testUser);
          duplicateUser.email = putDuplicateEmail;
          return request(app)
            .put(`${baseUrl}/${putUserGuid}`)
            .send(duplicateUser)
            .expect(404)
        });

        // all missing data paths tested in /POST section
        // this test is to confirm PUT route returns correct value if missing data
        it('PUT with missing data', function() {
          const missingDataUser = Object.assign({}, testUser);
          missingDataUser.first_name = null;
          return request(app)
            .put(`${baseUrl}/${putUserGuid}`)
            .send(missingDataUser)
            .expect(404)
        });
      });
  
    });

    describe(`PUT ${baseUrl}/:guid (with google)`, function() {
      const putUserGuid = user2Guid;
      const resetSqlCommand = `
        UPDATE users 
        SET email = 'bill@gmail.com', password_hash = 'abcdef', first_name = 'Bill', last_name = 'Smith', phone = '800-555-5555', google = '123456789012345678902'
        WHERE guid = '${user2Guid}';`;
      const testUser = {        
        email: "bob@email.com",
        password_hash: "zyxwvu",
        first_name: "Bob",
        last_name: "Jones",
        phone: "(800) 555-2211",
        google: '123456789012345678909'
      };

      describe(`Valid ${baseUrl}/:guid`, function() {

        before('before 1st PUT test', async function() {
          await db.query(resetSqlCommand);
        });
  
        afterEach('afterEach PUT test ', async function() {
          await db.query(resetSqlCommand);
        });
  
        it('updates the correct user and returns it', async function() {
          let initialUser;
          let updatedUser;      
          
          const response = await request(app)
            .get(`${baseUrl}/${putUserGuid}`);
          initialUser = response.body;          
          updatedUser = Object.assign({}, testUser);
          updatedUser.guid = putUserGuid;
          const response_1 = await request(app)
            .put(`${baseUrl}/${putUserGuid}`)
            .send(updatedUser)
            .expect(200);
          expect(response_1.body).to.be.deep.equal(updatedUser);
        });
      });
   
    });   

    describe(`DELETE ${baseUrl}/:guid`, function() {
      const toDelUser = {
        email: 'greg@email.com',
        password_hash: '098765',
        first_name: 'Greg',
        last_name: 'Blue',
        phone: '800 555-8888'
      }
      let delUserGuid;
  
      before('before DELETE tests, remove test user if needed', async function () {
        const sqlCommand = `
          DELETE FROM users
          WHERE email = '${toDelUser.email}'`;
        await db.query(sqlCommand);
      });

      before('before DELETE tests', async function() {
        const { email, password_hash, first_name, last_name, phone } = toDelUser
        const rowValues = [email, password_hash, first_name, last_name, phone];
        const sqlCommand = `
          INSERT INTO users (email, password_hash, first_name, last_name, phone) 
          VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
        const response = await db.query(sqlCommand, rowValues);
        const postedUser = response.rows[0];
        delUserGuid = postedUser.guid;
      });

      describe(`Valid deletes ${baseUrl}/:guid`, function() {
        
        it('deletes a user', async function() {
          const response = await request(app)
            .delete(`${baseUrl}/${delUserGuid}`)
            .expect(200);
          const userGuid = response.text;
          expect(userGuid).to.equal(delUserGuid);
        });      
      });
  
      describe(`Invalid deletes ${baseUrl}/:guid`, function() {
  
        it('called with an user id that is not in database', async function() {
          return await request(app)
            .delete(`${baseUrl}/${nonExistingGuid}`)
            .expect(404);
        });
  
        it('called with a invalid user guid', function() {
          return request(app)
            .delete(`${baseUrl}/ABC`)
            .expect(404);
        });
      });
    });    

  });

  describe('get user by email', function () {
    
    it('returns a single user object', async function () {
      const userObj = await findUserByEmail(user2Email);
      expect(userObj).to.be.an.instanceOf(Object);
      expect(userObj).to.not.be.an.instanceOf(Array);
    });

    it('returns a full user object', async function () {
      const userObj = await findUserByEmail(user2Email);
      expect(userObj).to.have.ownProperty('guid');
      expect(userObj).to.have.ownProperty('email');
      expect(userObj).to.have.ownProperty('password_hash');
      expect(userObj).to.have.ownProperty('first_name');
      expect(userObj).to.have.ownProperty('last_name');
      expect(userObj).to.have.ownProperty('phone');
    });

    it('returned user has the correct email', async function () {
      const userObj = await findUserByEmail(user2Email);
      expect(userObj.email).to.be.an.equal(user2Email);
    });

    it('called with a non existing email returns null', async function () {
      const userObj = await findUserByEmail('nothere@email.com');
      expect(userObj).to.be.null;
    });

  });

  describe('get user by google', function () {
    
    it('returns a single user object', async function () {
      const userObj = await findUserByGoogleId(user2GoogleId);
      expect(userObj).to.be.an.instanceOf(Object);
      expect(userObj).to.not.be.an.instanceOf(Array);
    });

    it('returns a full user object', async function () {
      const userObj = await findUserByGoogleId(user2GoogleId);
      expect(userObj).to.have.ownProperty('guid');
      expect(userObj).to.have.ownProperty('email');
      expect(userObj).to.have.ownProperty('password_hash');
      expect(userObj).to.have.ownProperty('first_name');
      expect(userObj).to.have.ownProperty('last_name');
      expect(userObj).to.have.ownProperty('phone');
    });

    it('returned user has the correct google id', async function () {
      const userObj = await findUserByGoogleId(user2GoogleId);
      expect(userObj.google).to.be.an.equal(user2GoogleId);
    });

    it('called with a non existing email returns null', async function () {
      const userObj = await findUserByGoogleId('XYZ');
      expect(userObj).to.be.null;
    });

  });

};

module.exports = testUsers;
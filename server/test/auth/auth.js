const expect = require('chai').expect;
const request = require('supertest');
const db = require('../../db/db');

const { assert } = require('chai');
const { response } = require('express');

require("dotenv").config();
const baseUrl = `${process.env.BASEURL}/auth`; 

function testAuth(app) {

  describe(`${baseUrl} routes`, function() {

    // use password property, not password_hash property
    const newUser = {        
      email: 'greg@email.com',
      password: 'ABC123',
      first_name: 'Greg',
      last_name: 'Blue',
      phone: '800 555-0000'
    };
    const duplicateUser = {        
      email: 'fred@email.com',
      password: '123456',
      first_name: 'Fred',
      last_name: 'Green',
      phone: '800 555-4321'
    };
    const logInUser = {        
      email: newUser.email,
      password: newUser.password
    };
    const invalidUser = {
      email: 'invalid@gmail.com',
      password: newUser.password
    }    

    before('remove registed user that might be left over from failed tests', async function() {
      const sqlCommand = `DELETE FROM users WHERE email = '${newUser.email}';`;
      await db.query(sqlCommand);
    });

    after('remove newly registered user', async function() {
      const sqlCommand = `DELETE FROM users WHERE email = '${newUser.email}';`;
      await db.query(sqlCommand);      
    });
  
    describe('register valid new user', function() {

      it('registers a new user with valid data', async function() {
        return await request(app)
          .post(`${baseUrl}/register`)
          .send(newUser)
          .expect(200)
          .then((response) => {
            const regUser = response.body;
            // do not check password_hash
            assert.equal(regUser.email, newUser.email);          
            assert.equal(regUser.first_name, newUser.first_name);
            assert.equal(regUser.last_name, newUser.last_name);
            assert.equal(regUser.phone, newUser.phone);
            // save new user uuid for other test
            newUser.uuid = regUser.uuid;
          });
      });

    });
  
    describe('register invalid new user', function() {
  
      it('do NOT register user with duplicate email', async function() {
        return await request(app)
          .post(`${baseUrl}/register`)
          .send(duplicateUser)
          .expect(409);
      });  
    });
  
    describe('login a user', function() {
  
      it('log in user with matching email and password', async function() {

        const response = await request(app)
          .post(`${baseUrl}/login`)
          .send(logInUser)
          .expect(200);
        expect(response.body).to.be.an.instanceOf(Object);
        const loginObj = response.body
        expect(loginObj).to.have.ownProperty('errors');
        expect(loginObj).to.have.ownProperty('user');
        assert.equal(loginObj.errors, false);
        const user = loginObj.user;
        // logInUser is just the email and password properties of NewUser
        // can use newUser here to compare property values
        assert.equal(user.first_name, newUser.first_name);
        assert.equal(user.last_name, newUser.last_name);
        assert.equal(user.phone, newUser.phone);
        assert.equal(user.email, newUser.email);
        assert.equal(user.uuid, newUser.uuid);
      });

      // it('goto profile for user who is logged in', async function () {
      //   await request(app)
      //     .get(`${baseUrl}/profile`)
      //     .then((response) => {
      //       assert.equal(response.text, 'Welcome to your profile');
      //     });
      // });

    });

    // describe('get logged in user', function () {
      
    //   it('get user', async function () {
    //     await request(app)
    //       .get(`${baseUrl}/user`)
    //       .expect(200);
    //     const user = response.body
    //     assert.equal(user.first_name, newUser.first_name);
    //     assert.equal(user.last_name, newUser.last_name);
    //     assert.equal(user.phone, newUser.phone);
    //     assert.equal(user.email, newUser.email);
    //     assert.equal(user.uuid, newUser.uuid);
    //   })
    // })

    describe('logout a user', function() {

      it('logout user', async function () {
        await request(app)
          .get(`${baseUrl}/logout`)
          .expect(205)
          .then((response) => {            
            assert.equal(response.text, '');
          });
      });

      it('confirm user is not logged in', async function () {
        return await request(app)
          .get(`${baseUrl}/is_logged_in`)
          .expect(401);
          // .then((response) => {
          //   assert.equal(response.text, 'not logged in');
          // });        
      });

      it('logout user who is not logged in', async function () {
        await request(app)
          .get(`${baseUrl}/logout`)
          .expect(205)
          .then((response) => {            
            assert.equal(response.text, '');
          });
      });

      it('goto profile for user who is not logged in', async function () {
        await request(app)
          .get(`${baseUrl}/profile`)
          .then((response) => {
            assert.equal(response.text, 'Unauthorized');
          });
      });

    });    

    describe('invalid login attempts', function () {

      it('cannot login with email not in database', async function () {
        return await request(app)
          .post(`${baseUrl}/login`)
          .send(invalidUser)
          .then((response) => {            
            assert.equal(response.body.message, 'Incorrect username or password');
          });
      });
      
      it('cannot login with invalid password', async function() {
        invalidUser.email = newUser.email;
        invalidUser.password = 'INVALID';
        return await request(app)
          .post(`${baseUrl}/login`)
          .send(invalidUser)
          .then((response) => {            
            assert.equal(response.body.message, 'Incorrect username or password');
          });
      });
    });

  });  
  
};

module.exports = testAuth;

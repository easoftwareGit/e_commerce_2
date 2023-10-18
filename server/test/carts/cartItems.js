const expect = require('chai').expect;
const request = require('supertest');
const db = require('../../db/db');

const dbTools = require('../../db/dbTools');
const { assert } = require('chai');

const setupCartItems = require('./setupCartItems');
const cartItemsCount = setupCartItems.cartItemsCount;

const {
  cartItemsTableName,
  cartItemsCartsForeignKeyName,
  cartItemsProductUuidForeignKeyName
} = require('../myConsts');

require("dotenv").config();
const baseUrl = `${process.env.BASEURL}/carts`; 

function testCartItems(app) {

  describe(`${baseUrl} routes`, function () {   
    const cartItem2Uuid = '74a9e017-c194-02be-b8b4-a0ac6c965917';   // uuid of cart item #2
    const cart1Uuid = '9603b681-53bf-1acc-4d60-c8c19e3a872e';       // uuid of cart # 1
    const product1Uuid = 'fd99387c-33d9-c78a-ba29-0286576ddce5';    // uuid of product #1
    const product2Uuid = '56d916ec-e6b5-0e62-9330-0248c6792316';    // uuid of product #2
    const product3Uuid = 'd9b1af94-4d49-41f6-5b2d-2d4ac160cdea';    // uuid of product #3
    const product4Uuid = '467e51d7-1659-d2e4-12cb-c64a0d19ecb4';    // uuid of product #4
    const nonexistingUuid = '56d916ec-e6b5-0e62-9330-0248c6792317';    

    describe('setup cart_items table', function() {
      it('DROP cart_items table', async function() {
        await dbTools.dropTable(cartItemsTableName);
        const doesExist = await dbTools.tableExists(cartItemsTableName);      
        expect(doesExist).to.be.false;
      });

      it('CREATE cart_items', async function() {
        await setupCartItems.createCartItemsTable();
        const doesExist = await dbTools.tableExists(cartItemsTableName);      
        expect(doesExist).to.be.true;     
      });

      it('check for carts FOREIGN KEY', async function() {        
        const doesExist = await dbTools.foreignKeyExists(cartItemsCartsForeignKeyName);      
        expect(doesExist).to.be.true;
      });

      it('check for products FOREIGN KEY', async function() {        
        const doesExist = await dbTools.foreignKeyExists(cartItemsProductUuidForeignKeyName);      
        expect(doesExist).to.be.true;
      });

      it('INSERT new cart items', async function() {
        const numInserted = await setupCartItems.insertAllCartItems(); 
        expect(numInserted).to.equal(cartItemsCount);
      });      
    });

    describe('cannot DELETE cart with cart_items', function() {
      let testCartUuid;
      let testItemUuid;
      const testQuantity = 5;
      const testUserUuid = '6714f724-f838-8f90-65a1-30359152dcdb'; // uuid from user #2
      const testProductUuid = 'd9b1af94-4d49-41f6-5b2d-2d4ac160cdea' // uuid from product #3

      const resetCartItemsSqlCommand = `DELETE FROM cart_items WHERE quantity = ${testQuantity};`;
      const resetCartsSqlCommand = `DELETE FROM carts WHERE user_uuid = '${testUserUuid}';`;

      before('before DELETE, delete test cart item from prior tests', async function() {
        await db.query(resetCartItemsSqlCommand);
      });

      before('before DELETE, delete test cart from prior tests', async function() {
        await db.query(resetCartsSqlCommand);
      });

      before('insert test cart', async function() {
        const cart = {
          created: new Date("02/22/2023"),
          modified: new Date("02/22/2323"),    
          user_uuid: testUserUuid
        }
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

      before('insert test cart items', async function() {
        const items =   {
          cart_uuid: testCartUuid,
          product_uuid: testProductUuid,
          quantity: testQuantity
        };
        const sqlCommand = `
          INSERT INTO cart_items (cart_uuid, product_uuid, quantity) 
          VALUES ($1, $2, $3) 
          RETURNING *;`;
        const { cart_uuid, product_uuid, quantity } = items;
        const rowValues = [cart_uuid, product_uuid, quantity];
        const response = await db.query(sqlCommand, rowValues);
        const testItem = response.rows[0];
        testItemUuid = testItem.uuid;
      });

      after('delete test cart item', async function() {
        await db.query(resetCartItemsSqlCommand);
      });

      after('delete test cart', async function() {        
        await db.query(resetCartsSqlCommand);
      });

      it('test cart exists before DELETE cart', async function() {
        const sqlCommand = `SELECT * FROM carts WHERE uuid = '${testCartUuid}';`;
        const response = await db.query(sqlCommand);
        const doesExist = response.rows.length === 1;
        expect(doesExist).to.be.true;
      });

      it('test cart item exists before DELETE cart', async function() {
        const sqlCommand = `SELECT * FROM cart_items WHERE uuid = '${testItemUuid}';`;
        const response = await db.query(sqlCommand);
        const doesExist = response.rows.length === 1;
        expect(doesExist).to.be.true;
      });

      it('try to DELETE cart that has a cart_item(s)', async function () {
        // DO NOT use baseUrl here
        return await request(app)
          .delete(`/api/carts/${testCartUuid}`)
          .expect(409); // constraint error
      });

    });

    describe(`/GET ${baseUrl}/:uuid/items`, function() {      
      const countForGetCart = 2;

      it('returns an array', async function() {
        const response = await request(app)
          .get(`${baseUrl}/${cart1Uuid}/items`)
          .expect(200);
        expect(response.body).to.be.an.instanceOf(Array);
      });

      it('returns an array of all cart_items', async function() {
        const response = await request(app)
          .get(`${baseUrl}/${cart1Uuid}/items`)
          .expect(200);
        expect(response.body.length).to.be.equal(countForGetCart);
        response.body.forEach((cart) => {
          expect(cart).to.have.ownProperty('uuid');
          expect(cart).to.have.ownProperty('cart_uuid');
          expect(cart).to.have.ownProperty('product_uuid');
          expect(cart).to.have.ownProperty('quantity');
          expect(cart).to.have.ownProperty('name');
          expect(cart).to.have.ownProperty('category');
          expect(cart).to.have.ownProperty('description');
          expect(cart).to.have.ownProperty('designer');
          expect(cart).to.have.ownProperty('price');
          expect(cart).to.have.ownProperty('item_total');
        });
      });

      it('returned cart items have the correct cart uuid', async function() {
        const response = await request(app)
          .get(`${baseUrl}/${cart1Uuid}/items`)
          .expect(200);
        response.body.forEach((cartItem) => {
          expect(cartItem.cart_uuid).to.be.equal(cart1Uuid);
        });
      });

      it('called with an invalid formatted uuid returns a 404 error', function() {
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
      
      it('returns a single cart_item object', async function() {
        const response = await request(app)
          .get(`${baseUrl}/items/${cartItem2Uuid}`)
          .expect(200);
        const item = response.body;
        expect(item).to.be.an.instanceOf(Object);
        expect(item).to.not.be.an.instanceOf(Array);
      });

      it('returns a full cart_item object', async function() {
        const response = await request(app)
          .get(`${baseUrl}/items/${cartItem2Uuid}`)
          .expect(200);
        const item = response.body;
        expect(item).to.have.ownProperty('uuid');
        expect(item).to.have.ownProperty('cart_uuid');
        expect(item).to.have.ownProperty('product_uuid');
        expect(item).to.have.ownProperty('quantity');
      });

      it('returned cart_item has the correct uuid', async function() {
        const response = await request(app)
          .get(`${baseUrl}/items/${cartItem2Uuid}`)
          .expect(200);
        const item = response.body;
        expect(item.uuid).to.be.an.equal(cartItem2Uuid);
      });

      it('called with an invalid formatted uuid returns a 404 error', function() {
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
      const postQuantity = 5
      const newItem = {            
        product_uuid: product2Uuid,
        quantity: postQuantity 
      };
      const invalidItem = {                    
        product_uuid: nonexistingUuid,  
        quantity: postQuantity
      };

      const resetSqlCommand = `
        DELETE FROM cart_items
        WHERE product_uuid = '${product2Uuid}';`

      before('before first POST test', async function() {
        await db.query(resetSqlCommand);
      })

      after('after last POST test', async function() {
        await db.query(resetSqlCommand);
      });

      it('post a new cart item with valid data', async function() {
        const response = await request(app)
          .post(`${baseUrl}/${cart1Uuid}/items`)
          .send(newItem)
          .expect(201);
        const postedItem = response.body;
        assert.equal(postedItem.cart_uuid, cart1Uuid);
        assert.equal(postedItem.product_uuid, newItem.product_uuid);
        assert.equal(postedItem.quantity, newItem.quantity);
      });

      it('did NOT post cart item with a non existing cart uuid', async function() {      
        return await request(app)
          .post(`${baseUrl}/${nonexistingUuid}/items`)
          .send(invalidItem)
          .expect(409);
      });

      it('did NOT post cart item with a non existing product uuid', async function() {      
        return await request(app)
          .post(`${baseUrl}/${cart1Uuid}/items`)
          .send(invalidItem)
          .expect(409);
      });

      it('did NOT post cart item with no product_uuid', async function() {      
        invalidItem.product_uuid = null;
        return await request(app)
          .post(`${baseUrl}/${cart1Uuid}/items`)
          .send(invalidItem)
          .expect(400);
      });

      it('did NOT post cart item with no quantity', async function() {      
        invalidItem.product_uuid = product2Uuid;
        invalidItem.quantity = null;
        return await request(app)
          .post(`${baseUrl}/${cart1Uuid}/items`)
          .send(invalidItem)
          .expect(400);
      });

    });

    describe(`PUT ${baseUrl}/items/:itemUuid`, function() {            
      const putQuantity = 5;
      const resetSqlCommand = `
        UPDATE cart_items
        SET cart_uuid = '${cart1Uuid}', product_uuid = '${product4Uuid}', quantity = 2
        WHERE uuid = '${cartItem2Uuid}';`;
      const testItem = {        
        quantity: putQuantity
      }

      describe(`Valid ${baseUrl}/items/:itemUuid`, function() {

        before('before 1st PUT test', async function() {
          await db.query(resetSqlCommand);
        });

        afterEach('afterEach PUT test ', async function() {      
          await db.query(resetSqlCommand);
        });

        it('updates the correct cart_item and returns it', async function() {          
          let updatedItem;                              
          updatedItem = Object.assign({}, testItem);
          updatedItem.cart_uuid = cart1Uuid;
          const response = await request(app)
            .put(`${baseUrl}/items/${cartItem2Uuid}`)
            .send(updatedItem)
            .expect(200);
          const resturnedItem = response.body;
          assert.equal(resturnedItem.uuid, cartItem2Uuid);
          assert.equal(resturnedItem.cart_uuid, updatedItem.cart_uuid);
          assert.equal(resturnedItem.product_uuid, product4Uuid);
          assert.equal(resturnedItem.quantity, updatedItem.quantity);
        });
      });

      describe(`Invalid ${baseUrl}/items/:itemUuid`, function() {
        const testItem = {
          quantity: putQuantity
        };
        
        it('called with an invalid formatted uuid returns a 404 error', function() {          
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

        // it('did not put with a non existant product_uuid', async function() {
        //   const invalidItem = Object.assign({}, testItem);
        //   invalidItem.product_uuid = nonexistingUuid;
        //   return await request(app)
        //     .put(`${baseUrl}/items/${cartItem2Uuid}`)
        //     .send(invalidItem)
        //     .expect(409)
        // });

        // other tests for missing data performed in POST tests 
        it('did not put with a missing product_uuid', async function() {
          const invalidItem = Object.assign({}, testItem);
          invalidItem.quantity = null;
          return await request(app)
            .put(`${baseUrl}/items/${cartItem2Uuid}`)
            .send(invalidItem)
            .expect(400)
        });
      });
    });

    describe(`DELETE ${baseUrl}/items/:itemUuid`, function () {                  
      const toDelItem = {
        product_uuid: product2Uuid,
        quantity: 3
      };
      let delItemUuid;      

      before(`before DELETE ${baseUrl}/items/:itemUuid tests`, async function() {
        const sqlCommand = `
          INSERT INTO cart_items (cart_uuid, product_uuid, quantity) 
          VALUES ($1, $2, $3) RETURNING *`;
        const { product_uuid, quantity } = toDelItem;
        const rowValues = [cart1Uuid, product_uuid, quantity];
        const response = await db.query(sqlCommand, rowValues);
        const postedItem = response.rows[0];
        delItemUuid = postedItem.uuid;        
      });

      describe(`Valid DELETE ${baseUrl}/items/:itemUuid`, function() {

        it('deletes a cart item', async function() {
          const response = await request(app)
            .delete(`${baseUrl}/items/${delItemUuid}`)
            .expect(200)
          const itemUuid = response.text;
          expect(itemUuid).to.equal(delItemUuid);
        });
      });

      describe(`Invalid DELETE ${baseUrl}/items/:itemUuid`, function() {

        it('called with an invalid formatted returns a 404 error', function() {
          return request(app)
            .delete(`${baseUrl}/items/ABC`)          
            .expect(404)
        });

        it('called with an non existing uuid returns a 404 error', function() {
          return request(app)
            .delete(`${baseUrl}/items/${nonexistingUuid}`)          
            .expect(404)
        });        
      });
    });

    describe(`DELETE ${baseUrl}/:uuid/allItems`, function () {
      let testCartUuid;
      const user2Uuid = '6714f724-f838-8f90-65a1-30359152dcdb'; // uuid of user #2   
      const testQuantity = 5
      const toDelCart = {
        created: new Date("05/15/2023"),
        modified: new Date("05/15/2323"),    
        user_uuid: user2Uuid
      }
      const toDelItems = [
        {
          product_uuid: product1Uuid,
          quantity: testQuantity
        },
        {
          product_uuid: product2Uuid,
          quantity: testQuantity
        },
        {
          product_uuid: product3Uuid,
          quantity: testQuantity
        },
      ];
      const resetCartItemsSqlCommand = `DELETE FROM cart_items WHERE quantity = ${testQuantity}`;
      const resetCartsSqlCommand = `DELETE FROM carts WHERE user_uuid = '${user2Uuid}'`;

      before(`before DELETE ${baseUrl}/:uuid/allItems, remove test cart_items from prior tests`, async function() {
        await db.query(resetCartItemsSqlCommand);
      });

      before(`before DELETE ${baseUrl}/:uuid/allItems, remove test cart from prior test`, async function() {        
        await db.query(resetCartsSqlCommand);
      });

      before(`before DELETE ${baseUrl}/:uuid/allItems, insert test cart`, async function() {
        const sqlCommand = `
          INSERT INTO carts (created, modified, user_uuid) 
          VALUES ($1, $2, $3) 
          RETURNING *`;
        const { created, modified, user_uuid } = toDelCart;
        const rowValues = [created, modified, user_uuid];
        const response = await db.query(sqlCommand, rowValues);
        const testCart = response.rows[0];
        testCartUuid = testCart.uuid;
      });

      before(`before DELETE ${baseUrl}/:uuid/allItems, insert test cart_items`, async function() {
        const sqlCommand = `
          INSERT INTO cart_items (cart_uuid, product_uuid, quantity) 
          VALUES ($1, $2, $3) 
          RETURNING *`;
        try {
          for (let i = 0; i < toDelItems.length; i++) {
            const item = toDelItems[i];
            const { product_uuid, quantity } = item;
            const rowValues = [testCartUuid, product_uuid, quantity];
            await db.query(sqlCommand, rowValues);
          }
          return toDelItems.length;
        } catch (error) {
          return error;
        }      
      });

      after(`after DELETE ${baseUrl}/:uuid/allItems, remove test cart_items`, async function() {        
        await db.query(resetCartItemsSqlCommand);
      });

      after(`after DELETE ${baseUrl}/:uuid/allItems, remove test cart`, async function() {        
        await db.query(resetCartsSqlCommand);
      });

      describe(`Valid DELETE ${baseUrl}/:uuid/allItems`, function() {

        it('deletes all cart items from a cart', async function() {
          const response = await request(app)
            .delete(`${baseUrl}/${testCartUuid}/allItems`)
            .expect(200);
          const itemUuid = response.text;
          expect(itemUuid).to.equal(testCartUuid);
        });

        it('called with an existing cart uuid, but no cart items', async function() {
          const response = await request(app)
            .delete(`${baseUrl}/${testCartUuid}/allItems`)
            .expect(200);
          const itemUuid = response.text;
          expect(itemUuid).to.equal(testCartUuid);
        });

        it('called with a non-existing cart uuid, but no cart items', async function() {          
          const response = await request(app)
            .delete(`${baseUrl}/${nonexistingUuid}/allItems`)
            .expect(200);
          const itemUuid = response.text;
          expect(itemUuid).to.equal(nonexistingUuid);
        });

      });

      describe(`Invalid DELETE ${baseUrl}/:uuid/allItems`, function() {

        it('called with an invalid formatted uuid returns a 404 error', function() {
          return request(app)
            .delete(`${baseUrl}/ABC/allItems`)
            .expect(404)
        });

      });
    });

  });

};

module.exports = testCartItems;
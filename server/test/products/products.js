const expect = require('chai').expect;
const request = require('supertest');
const db = require('../../db/db');

const dbTools = require('../../db/dbTools');
const { assert } = require('chai');

const setupProducts = require('./setupProducts');
const productCount = setupProducts.productCount;

const {
  productsTableName, 
  guidColName,
  nameColName,
  products_guid_index_name,
  products_name_index_name,
  cartItemsTableName,
  orderItemsTableName
} = require('../myConsts');

require("dotenv").config();
const baseUrl = `${process.env.BASEURL}/products`; 

function testProducts(app) {

  describe(`${baseUrl} routes`, function() {
    const nonexistingGuid = '56d916ec-e6b5-0e62-9330-0248c6792317'

    describe('setup products table', function() {      

      before('before setup products, drop cart_items', async function() {
        const doesExist = await dbTools.tableExists(cartItemsTableName); 
        if (doesExist) {
          await dbTools.dropTable(cartItemsTableName);
        }
      });

      before('before setup products, drop order_items', async function() {
        const doesExist = await dbTools.tableExists(orderItemsTableName); 
        if (doesExist) {
          await dbTools.dropTable(orderItemsTableName);
        }
      });

      it("DROP products", async function() {
        await dbTools.dropTable(productsTableName);
        const doesExist = await dbTools.tableExists(productsTableName);      
        expect(doesExist).to.be.false;
      });

      it('CREATE products', async function() {
        await setupProducts.createProductsTable();
        const doesExist = await dbTools.tableExists(productsTableName);      
        expect(doesExist).to.be.true;
      });

      it('CREATE INDEX for products guid', async function() {
        await setupProducts.createProductsIndex(products_guid_index_name, guidColName);
        const doesExist = await dbTools.indexExists(products_guid_index_name);
        expect(doesExist).to.be.true;
      });

      it('CREATE INDEX for products name', async function() {
        await setupProducts.createProductsIndex(products_name_index_name, nameColName);
        const doesExist = await dbTools.indexExists(products_name_index_name);
        expect(doesExist).to.be.true;
      });

      it('INSERT new products', async function() {
        const numInserted = await setupProducts.insertAllProducts(); 
        expect(numInserted).to.equal(productCount);
      });
    });

    describe(`GET ${baseUrl}`, function() {

      it('returns an array', async function() {
        const response = await request(app)
          .get(baseUrl)
          .expect(200);
        expect(response.body).to.be.an.instanceOf(Array);
      })

      it('returns an array of all users', async function() {
        const response = await request(app)
          .get(baseUrl)
          .expect(200);
        expect(response.body.length).to.be.equal(productCount);
        response.body.forEach(product => {
          expect(product).to.have.ownProperty("guid");
          expect(product).to.have.ownProperty("name");
          expect(product).to.have.ownProperty("category");
          expect(product).to.have.ownProperty("price");
          expect(product).to.have.ownProperty("description");
          expect(product).to.have.ownProperty("designer");
        });
      });
    });

    describe(`GET ${baseUrl}/:guid`, function() {
      const getProductId = '56d916ec-e6b5-0e62-9330-0248c6792316'; // 2nd product

      it('returns a single product object', async function() {
        const response = await request(app)
          .get(`${baseUrl}/${getProductId}`)
          .expect(200);
        const product = response.body;
        expect(product).to.be.an.instanceOf(Object);
        expect(product).to.not.be.an.instanceOf(Array);
      });

      it('returns a full product object', async function() {
        const response = await request(app)
          .get(`${baseUrl}/${getProductId}`)
          .expect(200);
        const product = response.body;
        expect(product).to.have.ownProperty('guid');
        expect(product).to.have.ownProperty('name');
        expect(product).to.have.ownProperty("category");
        expect(product).to.have.ownProperty("price");
        expect(product).to.have.ownProperty("description");
        expect(product).to.have.ownProperty("designer");
    });

      it('returned product has the correct guid', async function() {
        const response = await request(app)
          .get(`${baseUrl}/${getProductId}`)
          .expect(200);
        const product = response.body;
        expect(product.guid).to.be.an.equal(getProductId);
      });

      it('called with an invalid formatted guid returns a 404 error', function() {
        return request(app)
          .get(`${baseUrl}/ABC`)
          .expect(404);
      });

      it('called with a non existing guid returns a 404 error', function () {        
        return request(app)
          .get(`${baseUrl}/${nonexistingGuid}`)
          .expect(404);
      });
    });

    describe(`POST ${baseUrl}`, function() {
      const newProduct = {
        name: 'PAX',
        category: 'Wardrobes',
        price: 475,
        description: 'Wardrobe with 2 doors, 78x190 cm',
        designer: 'K Hagberg/M Hagber'
      };
      const invalidProduct = {   
        name: 'PAX',
        category: 'Wardrobes',
        price: 475,
        description: 'Wardrobe with 2 doors, 78x190 cm',
        designer: 'K Hagberg/M Hagber'
      };
      const resetSqlCommand = `
        DELETE FROM products         
        WHERE category = 'Wardrobes';`

      before('before first POST test', async function() {
        await db.query(resetSqlCommand);
      })

      after('after last POST test', async function() {
        await db.query(resetSqlCommand);
      });

      it('post a new product with valid data', async function() {
        const response = await request(app)
          .post(baseUrl)
          .send(newProduct)
          .expect(201);
        const postedProduct = response.body;
        assert.equal(postedProduct.name, newProduct.name);
        assert.equal(postedProduct.category, newProduct.category);
        assert.equal(postedProduct.price, newProduct.price);
        assert.equal(postedProduct.description, newProduct.description);
        assert.equal(postedProduct.designer, newProduct.designer);
      });

      it('did NOT post product with a duplicate name', async function() {
        return await request(app)
          .post(baseUrl)
          .send(invalidProduct)
          .expect(400);
      });

      it('did NOT post product with no name', async function() {
        invalidProduct.name = null;        
        return await request(app)
          .post(baseUrl)
          .send(invalidProduct)
          .expect(400);
      });

      it('did NOT post product with no category', async function() {
        invalidProduct.name = 'VALIDNAME';
        invalidProduct.category = null;
        return await request(app)
          .post(baseUrl)
          .send(invalidProduct)
          .expect(400);
      });

      it('did NOT post product with no price', async function() {        
        invalidProduct.category = 'Wardrobes';
        invalidProduct.price = null;
        return await request(app)
          .post(baseUrl)
          .send(invalidProduct)
          .expect(400);
      });

      it('did NOT post product with no description', async function() {
        invalidProduct.price = 475;
        invalidProduct.description = null;
        return await request(app)
          .post(baseUrl)
          .send(invalidProduct)
          .expect(400);
      });
      
      it('did NOT post product with no designer', async function() {
        invalidProduct.description = 'Wardrobe with 2 doors, 78x190 cm';
        invalidProduct.designer = null;
        return await request(app)
          .post(baseUrl)
          .send(invalidProduct)
          .expect(400);
      });
    });

    describe(`PUT ${baseUrl}/:guid`, function() {
      const putProductGuid = '56d916ec-e6b5-0e62-9330-0248c6792316'; // 2nd product
      const resetSqlCommand = `
        UPDATE products 
        SET name = 'NORDVIKEN', category = 'Bar furniture', price = 475, description = 'Bar table, 140x80 cm', designer = 'Francis Cayouett'
        WHERE id = ${putProductGuid};`
      const testProduct = {        
        name: "TESTNAME",
        category: "Testing",
        price: 999.99,
        description: "This is only a test",
        designer: 'Eric'
      };      
  
      describe(`Valid ${baseUrl}/:guid`, function() {

        before('before 1st PUT test', function() {
          db.query(resetSqlCommand);
        });
  
        afterEach('afterEach PUT test ', function() {      
          db.query(resetSqlCommand);
        });

        it('updates the correct product and returns it', async function() {
          let initialProduct;
          let updatedProduct;      

          const response = await request(app)
            .get(`${baseUrl}/${putProductGuid}`);
          initialProduct = response.body;          
          updatedProduct = Object.assign({}, testProduct);
          updatedProduct.guid = putProductGuid;
          const response_1 = await request(app)
            .put(`${baseUrl}/${putProductGuid}`)
            .send(updatedProduct)
            .expect(200);
          // convert response_1.body.price to number BEFORE expect
          response_1.body.price = Number(response_1.body.price);
          expect(response_1.body).to.be.deep.equal(updatedProduct);
        });
      });

      describe(`Invalid PUT ${baseUrl}/:guid`, function() {
        const invalidProduct = {
          name: "TESTNAME",
          category: "Testing",
          price: 999.99,
          description: "This is only a test",
          designer: 'Eric'
        };

        // full guid format testing is done in /test/users.js /api/users/guid section
        
        it('called with an invalid formatted guid returns a 404 error', async function() {
          return await request(app)
            .put(`${baseUrl}/ABC`)
            .send(invalidProduct)
            .expect(404);
        });

        it('called with a non existing guid returns a 404 error', async function() {
          return await request(app)
            .put(`${baseUrl}/${nonexistingGuid}`)
            .send(invalidProduct)
            .expect(404);
        });
        
        // all duplicate data paths tested in /POST section
        // this test is to confirm PUT route returns correct value if missing data
        it('PUT duplicate name value', function() {          
          const putDuplicateName = 'FREKVENS';
          const duplicateProduct = Object.assign({}, invalidProduct);
          duplicateProduct.name = putDuplicateName;
          return request(app)
            .put(`${baseUrl}/${putProductGuid}`)
            .send(duplicateProduct)
            .expect(400)
        });

        // all missing data paths tested in /POST section
        // this test is to confirm PUT route returns correct value if missing data
        it('PUT with missing data', function() {
          const missingDataProduct = Object.assign({}, invalidProduct);
          missingDataProduct.name = null;
          return request(app)
            .put(`${baseUrl}/${putProductGuid}`)
            .send(missingDataProduct)
            .expect(400)
        });
      });

    });

    describe(`DELETE ${baseUrl}/:guid`, function() {
      const toDelProduct = {
        name: "DELETEME",
        category: "Testing",
        price: 999.99,
        description: "This is to ne deleted",
        designer: 'Eric'
      };
      let delProductGuid;

      before('before DELETE tests', async function() {
        const sqlCommand = `
          INSERT INTO products (name, category, price, description, designer) 
          VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
        const { name, category, price, description, designer } = toDelProduct;
        const rowValues = [name, category, price, description, designer];
        const response = await db.query(sqlCommand, rowValues);
        const postedProduct = response.rows[0];
        delProductGuid = postedProduct.guid;
      });

      describe(`Valid deletes ${baseUrl}/:guid`, function() {

        it('deletes a product', async function() {
          const response = await request(app)
            .delete(`${baseUrl}/${delProductGuid}`)
            .expect(200);
          const productGuid = response.text;
          expect(productGuid).to.equal(delProductGuid);
        });
      });

      describe(`invalid deletes ${baseUrl}/:guid`, function() {

        it('called with an product guid that is not in database', function() {
          return request(app)
            .delete(`${baseUrl}/${nonexistingGuid}`)
            .expect(404);
        });

        it('called with an invalid formatted product id', function() {
          return request(app)
            .delete(`${baseUrl}/ABC`)
            .expect(404);
        });
      });

    });
  });

};

module.exports = testProducts;
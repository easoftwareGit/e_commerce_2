const db = require('../../db/db');

const {
  productsTableName 
} = require('../myConsts');

const { products } = require('./productsData');
const productCount = products.length;

async function createProductsIndex(indexName, columnName) {  
  const sqlCreateIndex = `CREATE UNIQUE INDEX IF NOT EXISTS ${indexName} ON ${productsTableName} (${columnName});`;
  try {
    return await db.query(sqlCreateIndex);
  } catch (err) {
    return err;
  }
};

function createProductsTable() {
  const sqlCreateTable = `CREATE TABLE IF NOT EXISTS ${productsTableName} (
    "guid"          uuid      PRIMARY KEY DEFAULT gen_random_uuid(),
    "name"          varchar   NOT NULL UNIQUE,
    "category"      varchar   NOT NULL,
    "price"         DECIMAL   NOT NULL,
    "description"   varchar   NOT NULL,
    "designer"      varchar   NOT NULL    
  );`;
  try {
    return db.query(sqlCreateTable);
  } catch (err) {
    return err;
  }
};

async function insertAllProducts() {
  const sqlCommand = `
    INSERT INTO ${productsTableName} (guid, name, category, price, description, designer)
    VALUES ($1, $2, $3, $4, $5, $6) 
    RETURNING *;`;
  try {
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const { guid, name, category, price, description, designer } = product;
      const rowValues = [guid, name, category, price, description, designer];
      await db.query(sqlCommand, rowValues);      
    }
    return products.length;
  } catch (error) {
    return error;
  }
};

module.exports = {
  productCount,
  createProductsIndex,
  createProductsTable,
  insertAllProducts
}
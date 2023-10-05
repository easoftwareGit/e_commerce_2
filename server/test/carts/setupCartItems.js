const db = require('../../db/db');

const { 
  cartItemsTableName,
  cartsTableName,
  cartsKeyColName,
  productsTableName,
  productsKeyColName
} = require('../myConsts');

const items = [
  {
    uuid: '973d25c4-a898-a995-57fa-326d12f5ba05',
    cart_uuid: '9603b681-53bf-1acc-4d60-c8c19e3a872e',
    product_uuid: 'd9b1af94-4d49-41f6-5b2d-2d4ac160cdea',
    quantity: 1
  },
  {
    uuid: '74a9e017-c194-02be-b8b4-a0ac6c965917',
    cart_uuid: '9603b681-53bf-1acc-4d60-c8c19e3a872e',
    product_uuid: '467e51d7-1659-d2e4-12cb-c64a0d19ecb4',
    quantity: 2
  },
  {
    uuid: '074e1f44-c8c2-481c-9838-1b8ebbc5526c',
    cart_uuid: '82433d04-acae-0036-7391-ab6356601ad0',
    product_uuid: 'fd99387c-33d9-c78a-ba29-0286576ddce5',
    quantity: 2
  },
  {
    uuid: '3a9e8d69-9e12-a725-d05a-44f62e403dd1',
    cart_uuid: 'ddf66bac-2c95-c4e7-1b3a-2e2d64ca5b2c',
    product_uuid: 'd9b1af94-4d49-41f6-5b2d-2d4ac160cdea',
    quantity: 1
  },
  {
    uuid: 'd43026db-8f71-fcf7-74b1-9b46d103cc37',
    cart_uuid: 'ddf66bac-2c95-c4e7-1b3a-2e2d64ca5b2c',
    product_uuid: '467e51d7-1659-d2e4-12cb-c64a0d19ecb4',
    quantity: 1
  }
];

const cartItemsCount = items.length;

async function createCartItemsTable() {
  const sqlCreateTable = `CREATE TABLE IF NOT EXISTS ${cartItemsTableName} (
    "uuid"          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    "cart_uuid"     uuid        NOT NULL REFERENCES ${cartsTableName}(${cartsKeyColName}),
    "product_uuid"  uuid        NOT NULL REFERENCES ${productsTableName}(${productsKeyColName}),
    "quantity"      integer     NOT NULL
  );`;
  try {
    return db.query(sqlCreateTable);
  } catch (error) {
    return error;
  }
};

async function insertAllCartItems() {
  const sqlCommand = `
    INSERT INTO ${cartItemsTableName} (uuid, cart_uuid, product_uuid, quantity) 
    VALUES ($1, $2, $3, $4) 
    RETURNING *;`;
  try {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const { uuid, cart_uuid, product_uuid, quantity } = item;
      const rowValues = [uuid, cart_uuid, product_uuid, quantity];
      await db.query(sqlCommand, rowValues);
    }
    return items.length;
  } catch (error) {
    return error;
  }
};

module.exports = {
  cartItemsCount,
  createCartItemsTable,  
  insertAllCartItems
};
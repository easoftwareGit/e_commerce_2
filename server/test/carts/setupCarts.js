const db = require('../../db/db');

const {
  cartsTableName,
  usersKeyColName,
  usersTableName
} = require('../myConsts');

// user_uuid's coorespnd to users #1, #3, #4 in setupUsers.js

const carts = [
  {
    uuid: '9603b681-53bf-1acc-4d60-c8c19e3a872e',
    created: new Date("01/02/2323"),
    modified: new Date("01/02/2323"),    
    user_uuid: '5bcefb5d-314f-ff1f-f5da-6521a2fa7bde'
  },
  {
    uuid: '82433d04-acae-0036-7391-ab6356601ad0',
    created: new Date("01/03/2023"),
    modified: new Date("01/04/2323"),    
    user_uuid: '516a1130-8398-3234-fc31-6e31fb695b85',
  },
  {
    uuid: 'ddf66bac-2c95-c4e7-1b3a-2e2d64ca5b2c',
    created: new Date("01/05/2023"),
    modified: new Date("01/05/2323"),    
    user_uuid: '5735c309-d480-3236-62da-31e13c35b91e',
  }
];

const cartCount = carts.length;

async function createCartsTable() {
  const sqlCreateTable = `CREATE TABLE IF NOT EXISTS ${cartsTableName} (
    "uuid"        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    "created"     DATE        NOT NULL,
    "modified"    DATE        NOT NULL CHECK (modified >= created),
    "user_uuid"   uuid        NOT NULL UNIQUE REFERENCES ${usersTableName}(${usersKeyColName})
  );`;
  try {
    return await db.query(sqlCreateTable);
  } catch (error) {
    return error;
  }
};

async function insertAllCarts() {
  const sqlCommand = `
    INSERT INTO ${cartsTableName} (uuid, created, modified, user_uuid) 
    VALUES ($1, $2, $3, $4) 
    RETURNING *`;
  try {
    for (let i = 0; i < carts.length; i++) {
      const cart = carts[i];
      const { uuid, created, modified, user_uuid } = cart;
      const rowValues = [uuid, created, modified, user_uuid];
      await db.query(sqlCommand, rowValues);
    }
    return carts.length;
  } catch (error) {
    return error;
  }
};

module.exports = {
  cartCount,
  createCartsTable,  
  insertAllCarts
};
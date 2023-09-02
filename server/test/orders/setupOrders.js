const db = require('../../db/db');

const {
  ordersTableName,
  usersTableName,
  usersKeyColName
} = require('../myConsts');

const user3Guid = '516a1130-8398-3234-fc31-6e31fb695b85';  // guid for user #3
const user4Guid = '5735c309-d480-3236-62da-31e13c35b91e';  // guid for user #4

const orders = [
  {
    guid: 'bbdedc95-c697-147e-5232-a23b2d5a4aa4',
    created: new Date("01/02/2023"),
    modified: new Date("01/02/2023"),        
    status: 'Created',
    total_price: 13.98,
    user_guid: user3Guid
  },
  {
    guid: 'd2f5edc9-156f-fbf2-695e-3eab6a7871b4',
    created: new Date("02/02/2023"),
    modified: new Date("02/02/2023"),    
    status: 'Created',
    total_price: 57.97,
    user_guid: user4Guid
  }
];

const orderCount = orders.length;

async function createOrdersTable() {
  const sqlCreateTable = `CREATE TABLE IF NOT EXISTS ${ordersTableName} (
    "guid"          uuid      PRIMARY KEY DEFAULT gen_random_uuid(),
    "created"       DATE      NOT NULL,
    "modified"      DATE      NOT NULL CHECK (modified >= created),
    "status"        varchar   NOT NULL,
    "total_price"   DECIMAL   NOT NULL,
    "user_guid"     uuid      NOT NULL REFERENCES ${usersTableName}(${usersKeyColName})
  );`;
  try {
    return await db.query(sqlCreateTable);
  } catch (error) {
    return error;
  };
};

async function insertAllOrders() {
  const sqlCommand = `
    INSERT INTO ${ordersTableName} (guid, created, modified, status, total_price, user_guid) 
    VALUES ($1, $2, $3, $4, $5, $6) 
    RETURNING *`;
  try {
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const { guid, created, modified, status, total_price, user_guid } = order;
      const rowValues = [guid, created, modified, status, total_price, user_guid];
      await db.query(sqlCommand, rowValues);
    }
    return orders.length;
  } catch (error) {
    return error;
  }
};

module.exports = {
  orderCount, 
  createOrdersTable,
  insertAllOrders
};
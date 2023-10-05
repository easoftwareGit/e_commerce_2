const db = require('../../db/db');

const {
  ordersTableName,
  usersTableName,
  usersKeyColName
} = require('../myConsts');

const user3Uuid = '516a1130-8398-3234-fc31-6e31fb695b85';  // uuid for user #3
const user4Uuid = '5735c309-d480-3236-62da-31e13c35b91e';  // uuid for user #4

const orders = [
  {
    uuid: 'bbdedc95-c697-147e-5232-a23b2d5a4aa4',
    created: new Date("01/02/2023"),
    modified: new Date("01/02/2023"),        
    status: 'Created',
    total_price: 13.98,
    user_uuid: user3Uuid
  },
  {
    uuid: 'd2f5edc9-156f-fbf2-695e-3eab6a7871b4',
    created: new Date("02/02/2023"),
    modified: new Date("02/02/2023"),    
    status: 'Created',
    total_price: 57.97,
    user_uuid: user4Uuid
  }
];

const orderCount = orders.length;

async function createOrdersTable() {
  const sqlCreateTable = `CREATE TABLE IF NOT EXISTS ${ordersTableName} (
    "uuid"          uuid      PRIMARY KEY DEFAULT gen_random_uuid(),
    "created"       DATE      NOT NULL,
    "modified"      DATE      NOT NULL CHECK (modified >= created),
    "status"        varchar   NOT NULL,
    "total_price"   DECIMAL   NOT NULL,
    "user_uuid"     uuid      NOT NULL REFERENCES ${usersTableName}(${usersKeyColName})
  );`;
  try {
    return await db.query(sqlCreateTable);
  } catch (error) {
    return error;
  };
};

async function insertAllOrders() {
  const sqlCommand = `
    INSERT INTO ${ordersTableName} (uuid, created, modified, status, total_price, user_uuid) 
    VALUES ($1, $2, $3, $4, $5, $6) 
    RETURNING *`;
  try {
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const { uuid, created, modified, status, total_price, user_uuid } = order;
      const rowValues = [uuid, created, modified, status, total_price, user_uuid];
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
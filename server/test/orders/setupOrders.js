const db = require('../../db/db');

const {
  ordersTableName,
  usersTableName,
  usersKeyColName
} = require('../myConsts');

const user2Uuid = '6714f724-f838-8f90-65a1-30359152dcdb';  // uuid for user #2
const user3Uuid = '516a1130-8398-3234-fc31-6e31fb695b85';  // uuid for user #3
const user4Uuid = '5735c309-d480-3236-62da-31e13c35b91e';  // uuid for user #4

const orders = [
  {
    uuid: 'bbdedc95-c697-147e-5232-a23b2d5a4aa4',
    created: new Date(Date.now() - (10 * 24 * 60 * 60 * 1000)), 
    modified: new Date(Date.now() - (9 * 24 * 60 * 60 * 1000)),        
    status: 'Created',
    total_price: 13.98,
    user_uuid: user3Uuid
  },
  {
    uuid: 'd2f5edc9-156f-fbf2-695e-3eab6a7871b4',
    created: new Date(Date.now() - (8 * 24 * 60 * 60 * 1000)), 
    modified: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)),     
    status: 'Created',
    total_price: 57.97,
    user_uuid: user4Uuid
  },
  {
    uuid: 'a15ef4dd-da90-40c4-b2e3-da8711e79060',
    created: new Date('2023-10-13 22:51:29.717-07'), 
    modified: new Date('2023-10-14 22:51:29.717-07'), 
    status: 'Shipped',
    total_price: 2245,
    user_uuid: user2Uuid
  },
  {
    uuid: '5ed9672d-7356-42b8-94d1-2b6bf9cc812c',
    created: new Date('2023-10-15 22:51:29.717-07'), 
    modified: new Date('2023-10-16 22:51:29.717-07'), 
    status: 'Created',
    total_price: 1095,
    user_uuid: user2Uuid
  },
];

const orderCount = orders.length;

async function createOrdersTable() {
  const sqlCreateTable = `CREATE TABLE IF NOT EXISTS ${ordersTableName} (
    "uuid"          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    "created"       timestamptz NOT NULL,
    "modified"      timestamptz NOT NULL CHECK (modified >= created),
    "status"        varchar     NOT NULL,
    "total_price"   DECIMAL     NOT NULL,
    "user_uuid"     uuid        NOT NULL REFERENCES ${usersTableName}(${usersKeyColName})
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
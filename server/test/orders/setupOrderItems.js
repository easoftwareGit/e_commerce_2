const db = require('../../db/db');

const {
  orderItemsTableName,
  ordersTableName,
  ordersKeyColName,
  productsTableName,
  productsKeyColName
} = require('../myConsts');

const items = [
  {
    uuid: '6f9bd091-cc91-bf68-a222-16b2cbe1cc17',
    order_uuid: 'bbdedc95-c697-147e-5232-a23b2d5a4aa4',
    product_uuid: 'fd99387c-33d9-c78a-ba29-0286576ddce5',
    quantity: 1,
    price_unit: 9.99
  },
  {
    uuid: '50bcd6bf-1e3b-76f7-05cf-758a1942ae33',
    order_uuid: 'bbdedc95-c697-147e-5232-a23b2d5a4aa4',
    product_uuid: 'fd99387c-33d9-c78a-ba29-0286576ddce5',
    quantity: 1,
    price_unit: 3.99
  },
  {
    uuid: '0d7bc43a-b95b-a04b-1d26-128e53b3edb5',
    order_uuid: 'd2f5edc9-156f-fbf2-695e-3eab6a7871b4',
    product_uuid: 'd9b1af94-4d49-41f6-5b2d-2d4ac160cdea',
    quantity: 1,
    price_unit: 49.99
  },
  {
    uuid: 'e6710ea9-f1b4-8a55-0989-612ba83879a5',
    order_uuid: 'd2f5edc9-156f-fbf2-695e-3eab6a7871b4',
    product_uuid: 'fd99387c-33d9-c78a-ba29-0286576ddce5',
    quantity: 1,
    price_unit: 3.99
  },

  {
    uuid: '0f9bd091-cc91-bf68-a222-16b2cbe1cc17',
    order_uuid: 'a15ef4dd-da90-40c4-b2e3-da8711e79060',
    product_uuid: '02e90226-87d1-3c2c-922d-43682e6b6a80',
    quantity: 2,
    price_unit: 195
  },
  {
    uuid: '10bcd6bf-1e3b-76f7-05cf-758a1942ae33',
    order_uuid: 'a15ef4dd-da90-40c4-b2e3-da8711e79060',
    product_uuid: '56d916ec-e6b5-0e62-9330-0248c6792316',
    quantity: 1,
    price_unit: 475
  },
  {
    uuid: '2d7bc43a-b95b-a04b-1d26-128e53b3edb5',
    order_uuid: 'a15ef4dd-da90-40c4-b2e3-da8711e79060',
    product_uuid: 'fa79198c-d471-018d-1498-deba88a184ef',
    quantity: 3,
    price_unit: 195
  },
  {
    uuid: '36710ea9-f1b4-8a55-0989-612ba83879a5',
    order_uuid: 'a15ef4dd-da90-40c4-b2e3-da8711e79060',
    product_uuid: 'a78f0737-89cc-0f8a-9a0d-e8c6e273eab1',
    quantity: 1,
    price_unit: 795
  },

  {
    uuid: 'af9bd091-cc91-bf68-a222-16b2cbe1cc17',
    order_uuid: '5ed9672d-7356-42b8-94d1-2b6bf9cc812c',
    product_uuid: 'f72475e8-f0e0-f5c8-54c6-0d9d186c7192',
    quantity: 1,
    price_unit: 595
  },
  {
    uuid: 'b0bcd6bf-1e3b-76f7-05cf-758a1942ae33',
    order_uuid: '5ed9672d-7356-42b8-94d1-2b6bf9cc812c',
    product_uuid: 'b1b51428-6873-1892-950a-2e56a731c55c',
    quantity: 2,
    price_unit: 250
  },

];

const orderItemsCount = items.length;

async function createOrderItemsTable() {
  const sqlCreateTable = `CREATE TABLE IF NOT EXISTS ${orderItemsTableName} (
    "uuid"          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    "order_uuid"    uuid        NOT NULL REFERENCES ${ordersTableName}(${ordersKeyColName}),
    "product_uuid"  uuid        NOT NULL REFERENCES ${productsTableName}(${productsKeyColName}),
    "quantity"      integer     NOT NULL,
    "price_unit"    DECIMAL     NOT NULL	
  )`;
  try {
    return db.query(sqlCreateTable);
  } catch (error) {
    return error;
  }
}

async function insertAllOrderItems() {
  const sqlCommand = `
    INSERT INTO ${orderItemsTableName} (uuid, order_uuid, product_uuid, quantity, price_unit) 
    VALUES ($1, $2, $3, $4, $5) 
    RETURNING *`;
  try {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const { uuid, order_uuid, product_uuid, quantity, price_unit } = item;
      const rowValues = [uuid, order_uuid, product_uuid, quantity, price_unit];
      await db.query(sqlCommand, rowValues);
    }
    return items.length;
  } catch (error) {
    return error;
  }
};

module.exports = {
  orderItemsCount,
  createOrderItemsTable,  
  insertAllOrderItems
};
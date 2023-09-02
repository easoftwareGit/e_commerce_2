const db = require('../../db/db');

const { 
  usersTableName, 
  user_email_index_name 
} = require('../myConsts');

const users = [
  {  
    guid: '5bcefb5d-314f-ff1f-f5da-6521a2fa7bde',        
    email: 'adam@email.com',
    password_hash: '123ABC',
    first_name: 'Adam',
    last_name: 'Smith',
    phone: '800 555-1212',    
  },
  {
    guid: '6714f724-f838-8f90-65a1-30359152dcdb',
    email: 'bill@gmail.com',
    password_hash: 'abcdef',
    first_name: 'Bill',
    last_name: 'Black',
    phone: '800 555-5555'
  },
  {
    guid: '516a1130-8398-3234-fc31-6e31fb695b85',
    email: 'chad@email.com',
    password_hash: 'HASHME',
    first_name: 'Chad',
    last_name: 'White',
    phone: '800 555-7890'
  },
  {
    guid: '5735c309-d480-3236-62da-31e13c35b91e',
    email: 'doug@email.com',
    password_hash: 'QWERTY',
    first_name: 'Doug',
    last_name: 'Jones',
    phone: '800 555-2211'
  },
{
    guid: 'a24894ed-10c5-dd83-5d5c-bbfea7ac6dca',
    email: 'eric@email.com',
    password_hash: 'NOHASH',
    first_name: 'Eric',
    last_name: 'Johnson',
    phone: '800 555-1234'
  },
  {        
    guid: '07de1192-9565-1794-87c7-a04759ff9866',
    email: "fred@email.com",
    password_hash: "123456",
    first_name: "Fred",
    last_name: "Green",
    phone: "800 555-4321"
  }
];

const userCount = users.length;

async function createUsersIndex(indexName, columnName) {  
  const sqlCreateIndex = `CREATE UNIQUE INDEX IF NOT EXISTS ${indexName} ON ${usersTableName} (${columnName});`;
  try {
    return await db.query(sqlCreateIndex);
  } catch (err) {
    return err;
  }
};

// async function createUserEmailIndex() {  
//   const sqlCreateIndex = `CREATE UNIQUE INDEX IF NOT EXISTS ${user_email_index_name} ON ${usersTableName} (email);`;
//   try {
//     return await db.query(sqlCreateIndex);
//   } catch (err) {
//     return err;
//   }
// };

function createUsersTable() {
  const sqlCreateTable = `CREATE TABLE IF NOT EXISTS ${usersTableName} (
    "guid"          uuid      PRIMARY KEY DEFAULT gen_random_uuid(),
    "email"         varchar   NOT NULL UNIQUE,
    "password_hash" TEXT      NOT NULL,
    "first_name"    varchar   NOT NULL,
    "last_name"     varchar   NOT NULL,
    "phone"         varchar   NOT NULL,
    "google"        JSON      
  );`
  try {
    return db.query(sqlCreateTable);
  } catch (err) {
    return err;
  }
};

async function insertAllUsers() {
  const sqlCommand = `
    INSERT INTO ${usersTableName} (guid, email, password_hash, first_name, last_name, phone) 
    VALUES ($1, $2, $3, $4, $5, $6) 
    RETURNING *;`;
  try {
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const { guid, email, password_hash, first_name, last_name, phone } = user;
      const rowValues = [guid, email, password_hash, first_name, last_name, phone];      
      await db.query(sqlCommand, rowValues);
    }
    return users.length;
  } catch (error) {
    return error;
  }
}

module.exports = {
  userCount,
  createUsersIndex, 
  createUsersTable,   
  insertAllUsers
};
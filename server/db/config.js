require("dotenv").config();

const devConfig = {
  host: process.env.HOST,
  database: process.env.DATABASE,
  user: process.env.USER,
  password: process.env.PASSWORD,
  port: process.env.PGPORT
}

module.exports = devConfig; 
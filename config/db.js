const dotenv = require("dotenv");
const mysql = require("mysql2");
dotenv.config({ path: "./config/config.env" });


const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port:process.env.DB_PORT,
});
// Exports the pool variable
module.exports = pool;

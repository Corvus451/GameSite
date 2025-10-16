const { Pool } = require('pg');
const {
  PGUSER,
  PGPASSWORD,
  PGDATABASE,
  PGHOST,
  PGPORT,
  DEVENV
} = require("../config/config");


// Configure the database connection
const pool = new Pool({
  user: PGUSER,
  host: PGHOST,
  database: PGDATABASE,
  password: PGPASSWORD,
  port: PGPORT,
  ssl: DEVENV != "yes" ? {rejectUnauthorized: false} : false
});

// Function to execute SQL queries
exports.query = async (text, params) => {
  try {
    const result = await pool.query(text, params);
    return result.rows; // Return the query results (rows)
  } catch (error) {
    console.error('Database query error:', error.stack);
    throw error; // Rethrow the error for the caller to handle
  }
}

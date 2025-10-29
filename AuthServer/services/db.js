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
exports.query = async (text, params, notify) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    // If notify is true, notify subscribed servers about the created user !! todo parameterize notify channel !! 
    if(notify) {
      const payload = JSON.stringify(result.rows[0] || {})
      await client.query(`NOTIFY user_created, '${payload.replace(/'/g, "''")}'`);
    }
    return result.rows; // Return the query results (rows)
  } catch (error) {
    console.error('Database query error:', error.stack);
    throw error; // Rethrow the error for the caller to handle
  } finally {
    client.release();
  }
}

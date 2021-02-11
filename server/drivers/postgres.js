const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({ssl: {
  rejectUnauthorized: false,
}});

const query = fs.readFileSync(path.join(__dirname, 'query.sql')).toString();

const getDataForContact = async (contactEmail) => {
  const client = await pool.connect();
  let data;

  try {
    const res = await client.query(query, [contactEmail]);
    data = res.rows.length === 0 ? null : res.rows;
  } finally {
    // Make sure to release the client before any error handling,
    // just in case the error handling itself throws an error.
    client.release();
    return data;
  }
};

module.exports = {
  getDataForContact: getDataForContact
};
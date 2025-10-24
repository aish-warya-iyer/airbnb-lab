// backend/src/models/property.model.js
const { pool } = require('../db');

/** List properties (lightweight list for cards) */
async function listProperties({ city, country } = {}) {
  const params = [];
  let sql = `
    SELECT
      p.id,
      p.owner_id,
      p.name,
      p.type,
      p.location_city,
      p.location_state,
      p.country,
      p.bedrooms,
      p.bathrooms,
      p.capacity,
      p.amenities,
      p.price_per_night,
      p.description,
      p.created_at,
      u.name AS owner_name
    FROM properties p
    JOIN users u ON u.id = p.owner_id
  `;
  const where = [];
  if (city)    { where.push('p.location_city = ?'); params.push(city); }
  if (country) { where.push('p.country = ?');      params.push(country); }
  if (where.length) sql += ` WHERE ${where.join(' AND ')}`;
  sql += ' ORDER BY p.created_at DESC LIMIT 100';

  const [rows] = await pool.query(sql, params);

  return rows.map((row) => {
    let amenities = row.amenities;
    if (typeof amenities === 'string') {
      try { amenities = JSON.parse(amenities); } catch {}
    }
    return {
      ...row,
      amenities,
      title: row.name,
      city: row.location_city,
      state: row.location_state,
    };
  });
}

/** Single property (full) */
async function getProperty(id) {
  const [rows] = await pool.query(`SELECT * FROM properties WHERE id = ?`, [id]);
  const row = rows[0] || null;
  if (!row) return null;

  let amenities = row.amenities;
  if (typeof amenities === 'string') {
    try { amenities = JSON.parse(amenities); } catch {}
  }
  return {
    ...row,
    amenities,
    title: row.name,
    city: row.location_city,
    state: row.location_state,
  };
}

/** Create property */
async function createProperty(data) {
  const {
    owner_id, name, type, location_city, location_state, country,
    bedrooms = 1, bathrooms = 1.0, capacity = 2, amenities = null,
    price_per_night, description = null
  } = data;

  const [result] = await pool.query(
    `INSERT INTO properties
     (owner_id, name, type, location_city, location_state, country,
      bedrooms, bathrooms, capacity, amenities, price_per_night, description)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      owner_id, name, type, location_city, location_state, country,
      bedrooms, bathrooms, capacity,
      amenities ? JSON.stringify(amenities) : null,
      price_per_night, description
    ]
  );

  return getProperty(result.insertId);
}

/** Owner’s properties */
async function listMyProperties(owner_id) {
  const [rows] = await pool.query(
    `SELECT * FROM properties WHERE owner_id = ? ORDER BY created_at DESC`,
    [owner_id]
  );
  return rows.map((row) => ({
    ...row,
    title: row.name,
    city: row.location_city,
    state: row.location_state,
  }));
}

module.exports = {
  createProperty,
  listProperties,
  getProperty,
  listMyProperties,
};

// Debug: show what we export when required
if (require.main !== module) {
  // eslint-disable-next-line no-console
  console.log('[property.model exports]', Object.keys(module.exports));
}

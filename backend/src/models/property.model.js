// src/models/property.model.js
const { pool } = require('../db');

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
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      owner_id, name, type, location_city, location_state, country,
      bedrooms, bathrooms, capacity,
      amenities ? JSON.stringify(amenities) : null,
      price_per_night, description
    ]
  );
  return { id: result.insertId, ...data };
}

async function listProperties({ city, country }) {
  const params = [];
  let sql = `SELECT p.*, u.name AS owner_name
             FROM properties p
             JOIN users u ON u.id = p.owner_id`;
  const where = [];
  if (city) { where.push('p.location_city = ?'); params.push(city); }
  if (country) { where.push('p.country = ?'); params.push(country); }
  if (where.length) sql += ' WHERE ' + where.join(' AND ');
  sql += ' ORDER BY p.created_at DESC LIMIT 100';
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function getProperty(id) {
  const [rows] = await pool.query(`SELECT * FROM properties WHERE id = ?`, [id]);
  return rows[0] || null;
}

async function listMyProperties(owner_id) {
  const [rows] = await pool.query(
    `SELECT * FROM properties WHERE owner_id = ? ORDER BY created_at DESC`,
    [owner_id]
  );
  return rows;
}

module.exports = { createProperty, listProperties, getProperty, listMyProperties };

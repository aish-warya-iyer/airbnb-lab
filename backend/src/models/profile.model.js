// backend/src/models/profile.model.js
const { pool } = require('../db');

async function getProfile(user_id) {
  const [rows] = await pool.query(`SELECT user_id, phone, city, state_abbr, country, languages, gender, about, avatar_url FROM profiles WHERE user_id = ? LIMIT 1`, [user_id]);
  return rows[0] || null;
}

async function upsertProfile(user_id, payload) {
  const current = await getProfile(user_id);
  if (current) {
    await pool.query(
      `UPDATE profiles SET phone=?, city=?, state_abbr=?, country=?, languages=?, gender=?, about=?, avatar_url=? WHERE user_id=?`,
      [payload.phone || null, payload.city || null, payload.state_abbr || null, payload.country || null, payload.languages || null, payload.gender || null, payload.about || null, payload.avatar_url || null, user_id]
    );
  } else {
    await pool.query(
      `INSERT INTO profiles (user_id, phone, city, state_abbr, country, languages, gender, about, avatar_url) VALUES (?,?,?,?,?,?,?,?,?)`,
      [user_id, payload.phone || null, payload.city || null, payload.state_abbr || null, payload.country || null, payload.languages || null, payload.gender || null, payload.about || null, payload.avatar_url || null]
    );
  }
  return getProfile(user_id);
}

module.exports = { getProfile, upsertProfile };



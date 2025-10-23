// src/models/booking.model.js
const { pool } = require('../db');

/**
 * Returns true if any overlapping booking exists for a given property & date range.
 * Overlap logic: NOT (end_date <= new.start OR start_date >= new.end)
 */
async function hasOverlap({ property_id, start_date, end_date }) {
  const [rows] = await pool.query(
    `SELECT 1
     FROM bookings
     WHERE property_id = ?
       AND status IN ('PENDING','ACCEPTED')
       AND NOT (end_date <= ? OR start_date >= ?)
     LIMIT 1`,
    [property_id, start_date, end_date]
  );
  return rows.length > 0;
}

async function createBooking({ traveler_id, property_id, start_date, end_date, guests }) {
  const [result] = await pool.query(
    `INSERT INTO bookings
     (traveler_id, property_id, start_date, end_date, guests, status)
     VALUES (?, ?, ?, ?, ?, 'PENDING')`,
    [traveler_id, property_id, start_date, end_date, guests]
  );
  const [rows] = await pool.query(`SELECT * FROM bookings WHERE id = ?`, [result.insertId]);
  return rows[0];
}

async function listMyBookings(traveler_id) {
  const [rows] = await pool.query(
    `SELECT b.*, p.name AS property_name, p.location_city, p.country
     FROM bookings b
     JOIN properties p ON p.id = b.property_id
     WHERE b.traveler_id = ?
     ORDER BY b.start_date DESC`,
    [traveler_id]
  );
  return rows;
}

/** For owners: see bookings across their properties */
async function listBookingsForOwner(owner_id) {
  const [rows] = await pool.query(
    `SELECT b.*, p.name AS property_name, u.name AS traveler_name, u.email AS traveler_email
     FROM bookings b
     JOIN properties p ON p.id = b.property_id
     JOIN users u ON u.id = b.traveler_id
     WHERE p.owner_id = ?
     ORDER BY b.start_date DESC`,
    [owner_id]
  );
  return rows;
}

/** Owner can update status (PENDING → ACCEPTED/CANCELLED) */
async function updateBookingStatus({ booking_id, owner_id, status }) {
  // ensure the booking belongs to one of this owner's properties
  const [rows] = await pool.query(
    `SELECT b.id
     FROM bookings b
     JOIN properties p ON p.id = b.property_id
     WHERE b.id = ? AND p.owner_id = ?
     LIMIT 1`,
    [booking_id, owner_id]
  );
  if (!rows.length) return null;

  await pool.query(`UPDATE bookings SET status = ? WHERE id = ?`, [status, booking_id]);
  const [after] = await pool.query(`SELECT * FROM bookings WHERE id = ?`, [booking_id]);
  return after[0];
}

module.exports = {
  hasOverlap,
  createBooking,
  listMyBookings,
  listBookingsForOwner,
  updateBookingStatus,
};

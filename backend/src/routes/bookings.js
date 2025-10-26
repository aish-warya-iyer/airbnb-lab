// src/routes/bookings.js

const { Router } = require('express');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const { pool } = require('../db');

const bookingModel = require('../models/booking.model'); // import the whole module
if (process.env.NODE_ENV !== 'production') {
  console.log('booking.model exports:', Object.keys(bookingModel));
}

const {
  hasOverlap,
  createBooking,
  listMyBookings,
  listBookingsForOwner,
  updateBookingStatus,
  getPropertyBasics,
} = bookingModel;

const router = Router();


/**
 * GET /bookings/check
 * Query availability for a property and date range
 * query: ?property_id=123&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
 * Returns: { available: boolean }
 */
router.get('/check', async (req, res) => {
  try {
    let { property_id, start_date, end_date } = req.query || {};
    property_id = Number(property_id);

    if (!property_id || !start_date || !end_date) {
      return res.status(400).json({ error: 'property_id, start_date, end_date are required' });
    }

    const sd = new Date(start_date);
    const ed = new Date(end_date);
    if (Number.isNaN(sd.getTime()) || Number.isNaN(ed.getTime())) {
      return res.status(400).json({ error: 'Invalid date format (use YYYY-MM-DD)' });
    }
    if (sd >= ed) {
      return res.status(400).json({ error: 'start_date must be before end_date' });
    }

    const overlap = await hasOverlap({ property_id, start_date, end_date });
    return res.json({ available: !overlap });
  } catch (e) {
    console.error('availability check error', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /bookings
 * Traveler creates a booking request
 * body: { property_id, start_date: 'YYYY-MM-DD', end_date: 'YYYY-MM-DD', guests }
 */
router.post('/', requireAuth, requireRole('traveler'), async (req, res) => {
  try {
    let { property_id, start_date, end_date, guests = 1 } = req.body || {};

    // coerce types early
    property_id = Number(property_id);
    guests = Number(guests);

    if (!property_id || !start_date || !end_date) {
      return res.status(400).json({ error: 'property_id, start_date, end_date are required' });
    }
    if (!Number.isInteger(guests) || guests < 1) {
      return res.status(400).json({ error: 'guests must be a positive integer' });
    }

    // date validation using Date objects (handles bad strings safely)
    const sd = new Date(start_date);
    const ed = new Date(end_date);
    if (Number.isNaN(sd.getTime()) || Number.isNaN(ed.getTime())) {
      return res.status(400).json({ error: 'Invalid date format (use YYYY-MM-DD)' });
    }
    if (sd >= ed) {
      return res.status(400).json({ error: 'start_date must be before end_date' });
    }

    // property existence + self-booking block + capacity check
  const [props] = await pool.query(
  `SELECT id, owner_id, capacity, bedrooms FROM properties WHERE id = ? LIMIT 1`,
  [property_id]
);
const prop = props[0];
if (!prop) return res.status(404).json({ error: 'Property not found' });
if (prop.owner_id === req.user.id) {
  return res.status(400).json({ error: 'Owners cannot book their own property' });
}
// capacity rule: guests ≤ max(capacity, bedrooms*2) but never exceed bedrooms*3
const bedrooms = Number(prop.bedrooms || 0);
const hardMax = bedrooms > 0 ? bedrooms * 3 : 2;
const logical = bedrooms <= 1 ? 2 : bedrooms * 2;
const declared = Number(prop.capacity || 0);
const effectiveCap = Math.min(Math.max(declared || logical, logical), hardMax);
if (Number(guests) > effectiveCap) {
  return res.status(400).json({ error: 'Guest count exceeds property capacity' });
}


    // overlap check
    const overlap = await hasOverlap({
      property_id,
      start_date,
      end_date,
    });
    if (overlap) {
      return res.status(409).json({ error: 'Dates overlap with an existing booking' });
    }

    // create
    const booking = await createBooking({
      traveler_id: req.user.id,
      property_id,
      start_date,
      end_date,
      guests,
    });
    res.status(201).json({ booking });
  } catch (e) {
    console.error('create booking error', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/** Public: accepted bookings for a property (for availability calendar) */
router.get('/property/:id', async (req, res) => {
  try {
    const propId = Number(req.params.id);
    if (!Number.isFinite(propId) || propId <= 0) return res.status(400).json({ error: 'Invalid property id' });
    const [rows] = await pool.query(
      `SELECT start_date, end_date
       FROM bookings
       WHERE property_id = ? AND status = 'ACCEPTED'
       ORDER BY start_date ASC`,
      [propId]
    );
    res.json({ bookings: rows });
  } catch (e) {
    console.error('GET /bookings/property/:id error', e);
    res.status(500).json({ error: 'Failed to fetch property bookings' });
  }
});


/** GET /bookings/my — traveler's own bookings */
router.get('/my', requireAuth, requireRole('traveler'), async (req, res) => {
  try {
    const rows = await listMyBookings(req.user.id);
    if (!rows) {
      return res.json({ bookings: [] });
    }
    console.log('Bookings found:', rows); // Debug log
    res.json({ bookings: rows });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

/** GET /bookings/owner — owner sees bookings across their properties */
router.get('/owner', requireAuth, requireRole('owner'), async (req, res) => {
  const rows = await listBookingsForOwner(req.user.id);
  res.json({ bookings: rows });
});

/**
 * PATCH /bookings/:id/status
 * Owner sets status to ACCEPTED or CANCELLED
 * body: { status: 'ACCEPTED' | 'CANCELLED' }
 */
router.patch('/:id/status', requireAuth, requireRole('owner'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body || {};

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid booking id' });
    }
    if (!['ACCEPTED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ error: 'status must be ACCEPTED or CANCELLED' });
    }

    const updated = await updateBookingStatus({
      booking_id: id,
      owner_id: req.user.id,
      status,
    });

    // updateBookingStatus throws on 400/403/404/409 now; null would only happen if you keep the older version
    if (!updated) {
      return res.status(404).json({ error: 'Booking not found for this owner' });
    }

    return res.json({ booking: updated });
  } catch (e) {
    return res.status(e.status || 500).json({ error: e.message || 'Internal server error' });
  }
});

module.exports = router;

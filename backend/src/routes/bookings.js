// src/routes/bookings.js
const { Router } = require('express');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const { hasOverlap, createBooking, listMyBookings, listBookingsForOwner, updateBookingStatus } =
  require('../models/booking.model');

const router = Router();

/**
 * POST /bookings
 * Traveler creates a booking request
 * body: { property_id, start_date: 'YYYY-MM-DD', end_date: 'YYYY-MM-DD', guests }
 */
router.post('/', requireAuth, requireRole('traveler'), async (req, res) => {
  try {
    const { property_id, start_date, end_date, guests = 1 } = req.body || {};
    if (!property_id || !start_date || !end_date) {
      return res.status(400).json({ error: 'property_id, start_date, end_date are required' });
    }
    if (start_date >= end_date) {
      return res.status(400).json({ error: 'start_date must be before end_date' });
    }

    const overlap = await hasOverlap({ property_id, start_date, end_date });
    if (overlap) {
      return res.status(409).json({ error: 'Dates overlap with an existing booking' });
    }

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

/** GET /bookings/my — traveler’s own bookings */
router.get('/my', requireAuth, requireRole('traveler'), async (req, res) => {
  const rows = await listMyBookings(req.user.id);
  res.json({ bookings: rows });
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
  const { status } = req.body || {};
  if (!['ACCEPTED', 'CANCELLED'].includes(status)) {
    return res.status(400).json({ error: 'status must be ACCEPTED or CANCELLED' });
  }
  const updated = await updateBookingStatus({
    booking_id: req.params.id,
    owner_id: req.user.id,
    status,
  });
  if (!updated) return res.status(404).json({ error: 'Booking not found for this owner' });
  res.json({ booking: updated });
});

module.exports = router;

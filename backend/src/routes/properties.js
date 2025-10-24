// backend/src/routes/properties.js
const { Router } = require('express');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const propertyModel = require('../models/property.model'); // single import

const router = Router();

// One-time debug: confirm we see the functions
// eslint-disable-next-line no-console
console.log('[router sees model keys]', Object.keys(propertyModel));

/** Public: list/search */
router.get('/', async (req, res) => {
  try {
    const { city, country } = req.query;
    const rows = await propertyModel.listProperties({ city, country });
    res.json({ properties: rows });
  } catch (err) {
    console.error('GET /properties error:', err);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

/** Owner-only: list my properties (place before :id) */
router.get('/me/mine', requireAuth, requireRole('owner'), async (req, res) => {
  try {
    const rows = await propertyModel.listMyProperties(req.user.id);
    res.json({ properties: rows });
  } catch (err) {
    console.error('GET /properties/me/mine error:', err);
    res.status(500).json({ error: 'Failed to fetch your properties' });
  }
});

/** Public: get by id */
router.get('/:id', async (req, res) => {
  try {
    const prop = await propertyModel.getProperty(req.params.id);
    if (!prop) return res.status(404).json({ error: 'Not found' });
    res.json({ property: prop });
  } catch (err) {
    console.error('GET /properties/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch property' });
  }
});

/** Owner-only: create */
router.post('/', requireAuth, requireRole('owner'), async (req, res) => {
  try {
    const { name, type, location_city, country, price_per_night } = req.body || {};
    if (!name || !type || !location_city || !country || !price_per_night) {
      return res.status(400).json({ error: 'name, type, location_city, country, price_per_night required' });
    }
    const data = { ...req.body, owner_id: req.user.id };
    const prop = await propertyModel.createProperty(data);
    res.status(201).json({ property: prop });
  } catch (err) {
    console.error('POST /properties error:', err);
    res.status(500).json({ error: 'Failed to create property' });
  }
});

module.exports = router;

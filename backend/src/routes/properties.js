// src/routes/properties.js
const { Router } = require('express');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const { createProperty, listProperties, getProperty, listMyProperties } = require('../models/property.model');

const router = Router();

/** Public: list/search */
router.get('/', async (req, res) => {
  const { city, country } = req.query;
  const rows = await listProperties({ city, country });
  res.json({ properties: rows });
});

/** Public: get by id */
router.get('/:id', async (req, res) => {
  const prop = await getProperty(req.params.id);
  if (!prop) return res.status(404).json({ error: 'Not found' });
  res.json({ property: prop });
});

/** Owner-only: create */
router.post('/', requireAuth, requireRole('owner'), async (req, res) => {
  const { name, type, location_city, country, price_per_night } = req.body || {};
  if (!name || !type || !location_city || !country || !price_per_night) {
    return res.status(400).json({ error: 'name, type, location_city, country, price_per_night required' });
  }
  const data = { ...req.body, owner_id: req.user.id };
  const prop = await createProperty(data);
  res.status(201).json({ property: prop });
});

/** Owner-only: list my properties */
router.get('/me/mine', requireAuth, requireRole('owner'), async (req, res) => {
  const rows = await listMyProperties(req.user.id);
  res.json({ properties: rows });
});

module.exports = router;

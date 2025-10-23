// src/routes/favourites.js
const { Router } = require('express');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const { toggleFavourite, listMyFavourites } = require('../models/favourite.model');

const router = Router();

/** POST /favourites/:propertyId/toggle  (traveler) */
router.post('/:propertyId/toggle', requireAuth, requireRole('traveler'), async (req, res) => {
  const propertyId = Number(req.params.propertyId);
  if (!Number.isInteger(propertyId)) {
    return res.status(400).json({ error: 'Invalid property id' });
  }
  const result = await toggleFavourite(req.user.id, propertyId);
  res.json({ ok: true, ...result });
});

/** GET /favourites/my  (traveler) */
router.get('/my', requireAuth, requireRole('traveler'), async (req, res) => {
  const favs = await listMyFavourites(req.user.id);
  res.json({ favourites: favs });
});

module.exports = router;

const { Router } = require('express');
const router = Router();

const AMENITIES = [
  { key: 'wifi', label: 'Wifi' },
  { key: 'kitchen', label: 'Kitchen' },
  { key: 'washer', label: 'Washer' },
  { key: 'tv', label: 'TV' },
  { key: 'workspace', label: 'Dedicated workspace' },
  { key: 'ac', label: 'Air conditioning' },
  { key: 'heating', label: 'Heating' },
  { key: 'parking', label: 'Free parking' },
  { key: 'pool', label: 'Pool' },
  { key: 'hot_tub', label: 'Hot tub' },
  { key: 'ev_charger', label: 'EV charger' },
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'pet_friendly', label: 'Pets allowed' },
  { key: 'self_checkin', label: 'Self check-in' },
];

router.get('/amenities', (_req, res) => {
  res.json({ amenities: AMENITIES });
});

// Minimal static data; extend as needed
const countries = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
];

const usStates = [
  { code: 'AL', name: 'Alabama' },
  { code: 'CA', name: 'California' },
  { code: 'FL', name: 'Florida' },
  { code: 'NY', name: 'New York' },
  { code: 'TX', name: 'Texas' },
];

router.get('/countries', (_req, res) => res.json({ countries }));
router.get('/us-states', (_req, res) => res.json({ states: usStates }));

module.exports = router;



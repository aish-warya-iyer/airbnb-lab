const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const requireAuth = require('../middleware/requireAuth');
const { getProfile, upsertProfile } = require('../models/profile.model');

const router = Router();
// Use backend/public/images/avatars (not backend/src/public/...)
const uploadDir = path.join(__dirname, '..', '..', 'public', 'images', 'avatars');
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  },
});
const upload = multer({ storage });

router.get('/me', requireAuth, async (req, res) => {
  const profile = await getProfile(req.user.id);
  res.json({ profile });
});

router.put('/me', requireAuth, async (req, res) => {
  const updated = await upsertProfile(req.user.id, req.body || {});
  res.json({ profile: updated });
});

module.exports = router;

// avatar upload
router.post('/avatar', requireAuth, upload.single('avatar'), async (req, res) => {
  const rel = `/images/avatars/${req.file.filename}`;
  const updated = await upsertProfile(req.user.id, { avatar_url: rel });
  res.json({ avatar_url: rel, profile: updated });
});

// remove avatar (revert to placeholder)
router.delete('/avatar', requireAuth, async (req, res) => {
  const updated = await upsertProfile(req.user.id, { avatar_url: null });
  res.json({ ok: true, profile: updated });
});

// remove avatar
router.delete('/avatar', requireAuth, async (req, res) => {
  const updated = await upsertProfile(req.user.id, { avatar_url: null });
  res.json({ ok: true, profile: updated });
});



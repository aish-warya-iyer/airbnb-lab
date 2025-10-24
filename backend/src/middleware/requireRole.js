// src/middleware/requireRole.js
module.exports = function requireRole(role) {
  return (req, res, next) => {
    const user = req.user; // set by attachUser middleware below
    if (!user || user.role !== role) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

const express = require('express');
const session = require('express-session');
const MySQLStoreFactory = require('express-mysql-session'); // new
const cors = require('cors');
require('dotenv').config();
const { pool } = require('./db');

const app = express();
if (process.env.NODE_ENV !== 'production') {
  console.log("[BOOT] entry:", __filename);
  console.log("[BOOT] CORS_ORIGIN:", process.env.CORS_ORIGIN);
}


  const rawOrigins = process.env.CORS_ORIGIN || 'http://localhost:3001';
  const allowedOrigins = rawOrigins.split(',').map(s => s.trim());
  app.use(cors({
    origin(origin, cb) {
      // allow same-origin/no-origin (curl, Postman) and explicit allowed origins
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  }));
  app.options(/.*/, cors()); // (optional) ensure preflight handled
app.use(express.json());

// Disable ETag + enforce no-store to avoid 304 interfering with client state
app.set('etag', false);
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// Static images under /images
const path = require('path');
const fs = require('fs');
// ensure image directories exist
['avatars', 'properties', 'hotels'].forEach((dir) => {
  const full = path.join(__dirname, '..', 'public', 'images', dir);
  try { fs.mkdirSync(full, { recursive: true }); } catch (_) {}
});
app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')));

// build MySQL session store
const MySQLStore = MySQLStoreFactory(session);
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  createDatabaseTable: true, // auto-create sessions table
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { sameSite: 'lax', secure: false },
    store: sessionStore,
  })
);

const attachUser = require('./middleware/attachUser');
app.use(attachUser); // <-- place AFTER app.use(session(...)) and BEFORE mounting routes


// generic error handler
app.use((err, req, res, next) => {
  console.error(err);
  const code = err.status || 500;
  res.status(code).json({ error: err.message || 'Internal Server Error' });
});

// normalize user: make req.user always available if session exists
app.use((req, _res, next) => {
  if (req.session?.user && !req.user) req.user = req.session.user;
  next();
});



// routes
const healthRouter = require('./routes/health');
const authRouter = require('./routes/auth');
const propertiesRouter = require('./routes/properties');
const bookingsRouter = require('./routes/bookings');
const profileRouter = require('./routes/profile');
const metaRouter = require('./routes/meta');


// Try to resolve and require favourites explicitly (will log on success/fail)
try {
  require.resolve('./routes/favourites');
  if (process.env.NODE_ENV !== 'production') console.log('[server] favourites route module resolvable ✅');
} catch (e) {
  console.error('[server] favourites route module NOT found ❌', e);
}

const favouritesRouter = require('./routes/favourites');
if (process.env.NODE_ENV !== 'production') console.log('[server] favourites router loaded:', !!favouritesRouter);

app.use('/auth', authRouter);
app.use('/properties', propertiesRouter);
app.use('/favourites', favouritesRouter);
app.use('/bookings', bookingsRouter);
app.use('/profile', profileRouter);
app.use('/meta', metaRouter);

// Quick probes to prove the prefix is mounted
if (process.env.NODE_ENV !== 'production') {
  app.get('/favourites/__probe_get', (req, res) => res.json({ ok: true, where: 'server probe GET' }));
  app.post('/favourites/__probe_post', (req, res) => res.json({ ok: true, where: 'server probe POST' }));
}

// Debug endpoint to list mounted routes
app.get('/__routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((m) => {
    if (m.route && m.route.path) {
      const methods = Object.keys(m.route.methods).join(',').toUpperCase();
      routes.push({ path: m.route.path, methods });
    }
    if (m.name === 'router' && m.handle.stack) {
      m.handle.stack.forEach((h) => {
        const r = h.route;
        if (r) {
          const methods = Object.keys(r.methods).join(',').toUpperCase();
          routes.push({ path: (m.regexp?.fast_slash ? '' : (m.regexp?.toString() || '')) + r.path, methods });
        }
      });
    }
  });
  res.json(routes);
});

// Health last among normal routers (ensure it doesn't contain a catch-all)
app.use('/', healthRouter);

// 🔴 ERROR HANDLER MUST BE LAST
app.use((err, req, res, next) => {
  console.error(err);
  const code = err.status || 500;
  res.status(code).json({ error: err.message || 'Internal Server Error' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));

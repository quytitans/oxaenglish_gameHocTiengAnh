require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

require('./db'); // ensure DB + schema + seed run on boot

const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const flashcardsRoutes = require('./routes/flashcards.routes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// iOS Safari in particular will silently reuse a cached GET response (e.g. a
// stale /auth/me from before login) unless told not to, which can make an
// otherwise-valid session look logged out after the app resumes from background.
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/flashcard-sets', flashcardsRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// In production, this process also serves the built React app so a single
// Node instance + one Nginx reverse-proxy entry is enough on the VPS.
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

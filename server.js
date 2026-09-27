const express = require('express');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const careerRoutes = require('./routes/careerRoutes');
const courseRoutes = require('./routes/courseRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const contactRoutes = require('./routes/contactRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust reverse proxy for live deployment environments (e.g. Render, Railway, Glitch, Heroku)
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'icgwb_super_secret_session_key_2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true if running behind forced HTTPS
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days session
    }
  })
);

// Serve static frontend assets
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/careers', careerRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/stats', statsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    portal: 'Intelligent Career Guidance Web Portal',
    timestamp: new Date().toISOString()
  });
});

// Single Page Fallback for standard routes
app.get('/careers', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'careers.html'));
});

app.get('/courses', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'courses.html'));
});

app.get('/favorites', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'favorites.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Fallback for non-API routes to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'An unexpected internal error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Express Server listening on all interfaces (0.0.0.0 for live cloud deployment)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 INTELLIGENT CAREER GUIDANCE WEB PORTAL is LIVE!`);
  console.log(`🌐 Server running at: http://localhost:${PORT}`);
  console.log(`👨‍🎓 Student Portal:    http://localhost:${PORT}`);
  console.log(`🛠️ Admin Dashboard:   http://localhost:${PORT}/admin.html`);
  console.log(`=======================================================`);
});

module.exports = app;

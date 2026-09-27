const db = require('../config/database');
const bcrypt = require('bcryptjs');

// Register a new student
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    // Check if user already exists
    const existing = await db.getAsync('SELECT id FROM users WHERE email = ?', [trimmedEmail]);
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.runAsync(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [trimmedName, trimmedEmail, hashedPassword, 'student']
    );

    const user = {
      id: result.lastID,
      name: trimmedName,
      email: trimmedEmail,
      role: 'student'
    };

    // Save into session
    req.session.user = user;

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to Intelligent Career Guidance.',
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
};

// Login (Student or Admin)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = await db.getAsync('SELECT * FROM users WHERE email = ?', [trimmedEmail]);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    // Set session
    req.session.user = sessionUser;

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      user: sessionUser
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
};

// Get current session user
exports.getCurrentUser = async (req, res) => {
  if (req.session && req.session.user) {
    return res.json({
      success: true,
      user: req.session.user
    });
  }
  res.json({
    success: false,
    user: null
  });
};

// Logout
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Could not log out. Try again.' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Logged out successfully.' });
  });
};

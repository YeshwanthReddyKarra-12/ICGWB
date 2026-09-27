// Session Authentication and Role-Based Access Control Middleware

function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
  }
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Administrator privileges required.' });
  }
  next();
}

// Optional auth to attach user if session exists
function optionalAuth(req, res, next) {
  next();
}

module.exports = {
  requireAuth,
  requireAdmin,
  optionalAuth
};

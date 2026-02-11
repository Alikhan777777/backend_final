const jwt = require('jsonwebtoken');

// Verify Token
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) return res.status(401).json({ message: 'Access Denied. No token provided.' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Attach user payload to request
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid Token' });
  }
};

// Check for Admin Role
const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access Denied. Admins only.' });
  }
  next();
};

module.exports = { authenticate, authorizeAdmin };


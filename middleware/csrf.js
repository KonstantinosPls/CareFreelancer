const crypto = require('crypto');

// Generate a random CSRF token
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// CSRF protection middleware
const csrfProtection = (req, res, next) => {
  // Generate token if not exists in session
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateToken();
  }

  // Make token available to all templates
  res.locals.csrfToken = req.session.csrfToken;

  // Skip validation for GET, HEAD, OPTIONS requests (safe methods)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // For POST/PUT/DELETE, validate the token
  const token = req.body._csrf || req.headers['x-csrf-token'];

  if (!token || token !== req.session.csrfToken) {
    return res.status(403).render('403', {
      title: 'Forbidden',
      message: 'Invalid or missing CSRF token. Please try again.'
    });
  }

  next();
};

module.exports = csrfProtection;

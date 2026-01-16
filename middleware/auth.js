/**
 * Authentication Middleware
 * Protects routes and checks user roles
 */

// Check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  // Store the URL they were trying to access for redirect after login
  req.session.returnTo = req.originalUrl;
  res.redirect('/auth/login');
};

// Check if user is a freelancer
const isFreelancer = (req, res, next) => {
  if (!req.session.user) {
    req.session.returnTo = req.originalUrl;
    return res.redirect('/auth/login');
  }

  if (req.session.user.role === 'freelancer' || req.session.user.role === 'both') {
    return next();
  }

  res.status(403).render('403', {
    title: 'Access Denied - CareFreelancer',
    message: 'This action is only available to freelancers. Your current role is "client".',
    user: req.session?.user || null
  });
};

// Check if user is a client
const isClient = (req, res, next) => {
  if (!req.session.user) {
    req.session.returnTo = req.originalUrl;
    return res.redirect('/auth/login');
  }

  if (req.session.user.role === 'client' || req.session.user.role === 'both') {
    return next();
  }

  res.status(403).render('403', {
    title: 'Access Denied - CareFreelancer',
    message: 'This action is only available to clients. Your current role is "freelancer".',
    user: req.session?.user || null
  });
};

module.exports = {
  isAuthenticated,
  isFreelancer,
  isClient
};

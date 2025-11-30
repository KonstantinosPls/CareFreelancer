// Authentication middleware
// These will be fully implemented in Phase 2

// Check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.redirect('/auth/login');
};

//checks if user is a freelancer
const isFreelancer = (req, res, next) => {
  if (req.session.user && (req.session.user.role === 'freelancer' || req.session.user.role === 'both')) {
    return next();
  }
  res.status(403).send('Access denied. Freelancers only.');
};

//checks if user is a client
const isClient = (req, res, next) => {
  if (req.session.user && (req.session.user.role === 'client' || req.session.user.role === 'both')) {
    return next();
  }
  res.status(403).send('Access denied. Clients only.');
};

module.exports = {
  isAuthenticated,
  isFreelancer,
  isClient
};

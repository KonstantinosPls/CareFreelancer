require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const rateLimit = require('express-rate-limit');
const methodOverride = require('method-override');
const connectDB = require('./config/database');
const csrfProtection = require('./middleware/csrf');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// Connect to MongoDB
connectDB();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method')); // Allow PUT/DELETE via form _method field
app.use(cookieParser());

// Session configuration with secure cookie settings
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    httpOnly: true, // Prevents client-side JS from reading the cookie
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict' // Prevents CSRF attacks via cross-site requests
  }
}));

// Rate limiting for authentication routes (prevents brute force attacks)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login attempts per windowMs
  message: 'Too many login attempts. Please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).render('429', {
      title: 'Too Many Requests',
      message: 'Too many login attempts. Please try again after 15 minutes.',
      user: req.session?.user || null
    });
  }
});

// General rate limiter for all routes (prevents DoS)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false
});

// Apply general rate limiting to all routes
app.use(generalLimiter);

// Apply stricter rate limiting to auth routes
app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);

// CSRF protection (must be after session middleware)
app.use(csrfProtection);

// Make user available in all templates
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/profile', require('./routes/profile'));
app.use('/gigs', require('./routes/gigs'));
app.use('/orders', require('./routes/orders'));

// 404 Error handler - catches undefined routes
app.use(notFoundHandler);

// Global error handler - catches all errors from routes
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

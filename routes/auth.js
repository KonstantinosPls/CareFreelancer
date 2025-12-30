const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// Validation rules as middleware
// These run BEFORE the route handler and check the incoming data
// Each rule is a function that returns an error if validation fails

const registerValidation = [
  // Check username: must exist, be 3-30 chars, alphanumeric only
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),

  // Check email: must be valid email format
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),

  // Check password: minimum 8 characters
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),

  // Check confirmPassword: must match password
  // Custom validator allows us to access other fields
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),

  // Check role: must be one of the allowed values
  body('role')
    .isIn(['freelancer', 'client', 'both'])
    .withMessage('Please select a valid role')
];

const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
];


// GET /auth/register - Display registration form
router.get('/register', (req, res) => {
  // If user is already logged in, redirect to home
  if (req.session.user) {
    return res.redirect('/');
  }

  res.render('auth/register', {
    title: 'Register - CareFreelancer'
  });
});


// POST /auth/register - Handle registration form submission
router.post('/register', registerValidation, async (req, res) => {
  try {
    // Get validation errors from express-validator
    const errors = validationResult(req);

    // If there are validation errors, re-render form with errors
    if (!errors.isEmpty()) {
      return res.render('auth/register', {
        title: 'Register - CareFreelancer',
        errors: errors.array(),
        formData: req.body  // Send back form data to preserve user input
      });
    }

    // Destructure the validated data from request body
    const { username, email, password, role } = req.body;

    // Check if username already exists in database
    const existingUsername = await User.findOne({ username: username });
    if (existingUsername) {
      return res.render('auth/register', {
        title: 'Register - CareFreelancer',
        errors: [{ msg: 'Username is already taken' }],
        formData: req.body
      });
    }

    // Check if email already exists in database
    const existingEmail = await User.findOne({ email: email });
    if (existingEmail) {
      return res.render('auth/register', {
        title: 'Register - CareFreelancer',
        errors: [{ msg: 'Email is already registered' }],
        formData: req.body
      });
    }

    // Create new user object
    // Password will be hashed automatically by the pre-save hook in User model
    const newUser = new User({
      username,
      email,
      password,  // Plain text here, but hashed before saving
      role
    });

    // Save to database
    await newUser.save();

    // Redirect to login with success message
    res.redirect('/auth/login?registered=true');

  } catch (error) {
    console.error('Registration error:', error);
    res.render('auth/register', {
      title: 'Register - CareFreelancer',
      errors: [{ msg: 'An error occurred during registration. Please try again.' }],
      formData: req.body
    });
  }
});


// GET /auth/login - Display login form
router.get('/login', (req, res) => {
  // If user is already logged in, redirect to home
  if (req.session.user) {
    return res.redirect('/');
  }

  // Check for success message from registration
  const success = req.query.registered === 'true'
    ? 'Account created successfully. Please login.'
    : null;

  res.render('auth/login', {
    title: 'Login - CareFreelancer',
    success
  });
});


// POST /auth/login - Handle login form submission
router.post('/login', loginValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render('auth/login', {
        title: 'Login - CareFreelancer',
        error: errors.array()[0].msg,
        formData: req.body
      });
    }

    const { email, password, rememberMe } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email });

    // If user not found
    if (!user) {
      return res.render('auth/login', {
        title: 'Login - CareFreelancer',
        error: 'Invalid email or password',
        formData: req.body
      });
    }

    // Compare passwords using the method defined in User model
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.render('auth/login', {
        title: 'Login - CareFreelancer',
        error: 'Invalid email or password',
        formData: req.body
      });
    }

    // Create session
    // Store user data in session (excluding password)
    req.session.user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage
    };

    // If "remember me" is checked, extend session to 30 days
    if (rememberMe) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    }

    // Save session and redirect
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
      }
      res.redirect('/');
    });

  } catch (error) {
    console.error('Login error:', error);
    res.render('auth/login', {
      title: 'Login - CareFreelancer',
      error: 'An error occurred during login. Please try again.',
      formData: req.body
    });
  }
});


// GET /auth/logout - Handle logout
router.get('/logout', (req, res) => {
  // Destroy the session
  // This removes all session data including the user object
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    // Clear the session cookie from browser
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});


module.exports = router;

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

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

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new user object with verification fields
    // Password will be hashed automatically by the pre-save hook in User model
    const newUser = new User({
      username,
      email,
      password,  // Plain text here, but hashed before saving
      role,
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: tokenExpiry
    });

    // Save to database
    await newUser.save();

    // Send verification email
    const emailResult = await sendVerificationEmail(newUser, verificationToken);

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      // User created but email failed - they can resend later
    }

    // Redirect to verification pending page
    res.redirect('/auth/verification-sent?email=' + encodeURIComponent(email));

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

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.render('auth/login', {
        title: 'Login - CareFreelancer',
        error: 'Please verify your email before logging in.',
        showResendLink: true,
        userEmail: email,
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


// GET /auth/verification-sent - Show "check your email" page
router.get('/verification-sent', (req, res) => {
  const email = req.query.email || '';
  res.render('auth/verification-sent', {
    title: 'Verify Your Email - CareFreelancer',
    email
  });
});


// GET /auth/verify-email/:token - Verify email with token
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Find user with matching token that hasn't expired
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.render('auth/email-verified', {
        title: 'Verification Failed - CareFreelancer',
        success: false,
        message: 'Invalid or expired verification link. Please request a new one.'
      });
    }

    // Mark email as verified and clear token
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    res.render('auth/email-verified', {
      title: 'Email Verified - CareFreelancer',
      success: true,
      message: 'Your email has been verified successfully!'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.render('auth/email-verified', {
      title: 'Verification Error - CareFreelancer',
      success: false,
      message: 'An error occurred during verification. Please try again.'
    });
  }
});


// GET /auth/resend-verification - Show resend form
router.get('/resend-verification', (req, res) => {
  const email = req.query.email || '';
  res.render('auth/resend-verification', {
    title: 'Resend Verification - CareFreelancer',
    email
  });
});


// POST /auth/resend-verification - Resend verification email
router.post('/resend-verification', [
  body('email').trim().isEmail().withMessage('Please enter a valid email').normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('auth/resend-verification', {
        title: 'Resend Verification - CareFreelancer',
        error: errors.array()[0].msg,
        email: req.body.email
      });
    }

    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always show success to prevent email enumeration
    if (!user || user.isEmailVerified) {
      return res.render('auth/resend-verification', {
        title: 'Resend Verification - CareFreelancer',
        success: 'If an unverified account exists with this email, a verification link has been sent.',
        email
      });
    }

    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    // Send new verification email
    await sendVerificationEmail(user, verificationToken);

    res.render('auth/resend-verification', {
      title: 'Resend Verification - CareFreelancer',
      success: 'A new verification link has been sent to your email.',
      email
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.render('auth/resend-verification', {
      title: 'Resend Verification - CareFreelancer',
      error: 'An error occurred. Please try again.',
      email: req.body.email
    });
  }
});


// GET /auth/forgot-password - Show forgot password form
router.get('/forgot-password', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }

  res.render('auth/forgot-password', {
    title: 'Forgot Password - CareFreelancer'
  });
});


// POST /auth/forgot-password - Handle forgot password request
router.post('/forgot-password', [
  body('email').trim().isEmail().withMessage('Please enter a valid email').normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('auth/forgot-password', {
        title: 'Forgot Password - CareFreelancer',
        error: errors.array()[0].msg,
        email: req.body.email
      });
    }

    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always show success to prevent email enumeration
    if (!user) {
      return res.render('auth/forgot-password', {
        title: 'Forgot Password - CareFreelancer',
        success: 'If an account exists with this email, a password reset link has been sent.',
        email
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send reset email
    const emailResult = await sendPasswordResetEmail(user, resetToken);

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error);
    }

    res.render('auth/forgot-password', {
      title: 'Forgot Password - CareFreelancer',
      success: 'If an account exists with this email, a password reset link has been sent.',
      email
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.render('auth/forgot-password', {
      title: 'Forgot Password - CareFreelancer',
      error: 'An error occurred. Please try again.',
      email: req.body.email
    });
  }
});


// GET /auth/reset-password/:token - Show reset password form
router.get('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Find user with valid token
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.render('auth/reset-password', {
        title: 'Reset Password - CareFreelancer',
        error: 'Password reset link is invalid or has expired.',
        invalidToken: true
      });
    }

    res.render('auth/reset-password', {
      title: 'Reset Password - CareFreelancer',
      token
    });

  } catch (error) {
    console.error('Reset password page error:', error);
    res.render('auth/reset-password', {
      title: 'Reset Password - CareFreelancer',
      error: 'An error occurred. Please try again.',
      invalidToken: true
    });
  }
});


// POST /auth/reset-password/:token - Handle password reset
router.post('/reset-password/:token', [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
], async (req, res) => {
  try {
    const { token } = req.params;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render('auth/reset-password', {
        title: 'Reset Password - CareFreelancer',
        error: errors.array()[0].msg,
        token
      });
    }

    // Find user with valid token
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.render('auth/reset-password', {
        title: 'Reset Password - CareFreelancer',
        error: 'Password reset link is invalid or has expired.',
        invalidToken: true
      });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = req.body.password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.render('auth/password-reset-success', {
      title: 'Password Reset Successful - CareFreelancer'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.render('auth/reset-password', {
      title: 'Reset Password - CareFreelancer',
      error: 'An error occurred. Please try again.',
      token: req.params.token
    });
  }
});


module.exports = router;

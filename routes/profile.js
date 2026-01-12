const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { isAuthenticated } = require('../middleware/auth');
const { deleteFile } = require('../utils/fileUtils');

// Configure Multer for file uploads
// Multer handles multipart/form-data (forms with files)

// Storage configuration tells Multer WHERE and HOW to save files
const storage = multer.diskStorage({
  // destination: folder where files will be saved
  destination: function(req, file, cb) {
    const uploadPath = 'public/uploads/profiles';

    // Create directory if it doesn't exist
    // recursive: true means it creates parent directories too
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },

  // filename: how to name the saved file
  // We use a unique name to prevent overwriting
  filename: function(req, file, cb) {
    // Create unique filename: timestamp-randomstring.extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext);
  }
});

// File filter: controls which files are accepted
const fileFilter = function(req, file, cb) {
  // Check if file type is allowed
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);  // Accept file
  } else {
    cb(new Error('Only JPG, JPEG, and PNG files are allowed'), false);
  }
};

// Create the Multer upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024  // 2MB max file size
  }
});


// GET /profile - View own profile
router.get('/', isAuthenticated, async (req, res) => {
  try {
    // Fetch fresh user data from database
    // The session might have outdated info
    const profileUser = await User.findById(req.session.user._id);

    if (!profileUser) {
      return res.redirect('/auth/login');
    }

    res.render('profile/index', {
      title: 'My Profile - CareFreelancer',
      profileUser
    });

  } catch (error) {
    console.error('Profile view error:', error);
    res.status(500).render('500', { title: 'Server Error' });
  }
});


// GET /profile/edit - Show edit profile form
router.get('/edit', isAuthenticated, async (req, res) => {
  try {
    // Get fresh user data
    const userData = await User.findById(req.session.user._id);

    if (!userData) {
      return res.redirect('/auth/login');
    }

    // Update session with fresh data
    req.session.user = {
      _id: userData._id,
      username: userData.username,
      email: userData.email,
      role: userData.role,
      profileImage: userData.profileImage,
      bio: userData.bio,
      skills: userData.skills
    };

    res.render('profile/edit', {
      title: 'Edit Profile - CareFreelancer'
    });

  } catch (error) {
    console.error('Edit profile view error:', error);
    res.status(500).render('500', { title: 'Server Error' });
  }
});


// POST /profile/edit - Handle profile update
// upload.single('profileImage') processes ONE file from input named 'profileImage'
router.post('/edit', isAuthenticated, upload.single('profileImage'), async (req, res) => {
  try {
    const { bio, skills } = req.body;
    const userId = req.session.user._id;

    // Build update object with only fields that should be updated
    const updateData = {};

    // Process bio
    if (bio !== undefined) {
      // Trim and limit to 500 characters
      updateData.bio = bio.trim().substring(0, 500);
    }

    // Process skills (only if user is freelancer)
    if (skills !== undefined &&
        (req.session.user.role === 'freelancer' || req.session.user.role === 'both')) {
      // Convert comma-separated string to array
      // filter(Boolean) removes empty strings
      updateData.skills = skills
        .split(',')
        .map(skill => skill.trim())
        .filter(Boolean);
    }

    // Process uploaded profile image
    if (req.file) {
      // Delete old profile image if it exists
      const currentUser = await User.findById(userId);
      if (currentUser && currentUser.profileImage) {
        await deleteFile(currentUser.profileImage);
      }

      // Save new image path (relative to public folder for web access)
      updateData.profileImage = '/uploads/profiles/' + req.file.filename;
    }

    // Update user in database
    // findByIdAndUpdate returns the OLD document by default
    // { new: true } makes it return the UPDATED document
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    // Update session with new data
    req.session.user = {
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      profileImage: updatedUser.profileImage,
      bio: updatedUser.bio,
      skills: updatedUser.skills
    };

    // Redirect to profile with success message
    res.redirect('/profile?success=true');

  } catch (error) {
    console.error('Profile update error:', error);

    // Handle Multer errors specifically
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.render('profile/edit', {
          title: 'Edit Profile - CareFreelancer',
          errors: [{ msg: 'File size must be less than 2MB' }]
        });
      }
    }

    res.render('profile/edit', {
      title: 'Edit Profile - CareFreelancer',
      errors: [{ msg: 'An error occurred while updating profile' }]
    });
  }
});


module.exports = router;

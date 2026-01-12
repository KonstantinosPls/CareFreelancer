const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const Gig = require('../models/Gig');
const { isAuthenticated } = require('../middleware/auth');
const { deleteFile, deleteFiles } = require('../utils/fileUtils');

// Configure Multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/gigs/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'gig-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only jpeg, jpg, png
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only .jpeg, .jpg, and .png files are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max per file
  fileFilter: fileFilter
});

// GET /gigs - List all gigs
router.get('/', async (req, res) => {
  try {
    const gigs = await Gig.find({ status: 'active' })
      .populate('freelancerId', 'username')
      .sort({ createdAt: -1 });

    res.render('gigs/list', {
      title: 'Browse Gigs',
      gigs: gigs
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('500', { title: 'Server Error', error: {} });
  }
});

// GET /gigs/search - Search results
router.get('/search', async (req, res) => {
  try {
    const query = (req.query.q || '').trim();
    const category = req.query.category || '';
    const tags = req.query.tags ? req.query.tags.split(',') : [];
    // Whitelist allowed sort fields to prevent injection
    const allowedSortFields = ['createdAt', 'price', 'deliveryTime', 'title', 'category'];
    const sortBy = allowedSortFields.includes(req.query.sort) ? req.query.sort : 'createdAt';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;
    const page = parseInt(req.query.page) || 1;
    const perPage = 10;

    // Build search filter
    let filter = { status: 'active' };

    if (query) {
      // Escape regex special characters to prevent regex injection
      // and ensure literal matching of special chars like . + * etc.
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      filter.$or = [
        { title: { $regex: escapedQuery, $options: 'i' } },
        { description: { $regex: escapedQuery, $options: 'i' } },
        { category: { $regex: escapedQuery, $options: 'i' } },
        { tags: { $regex: escapedQuery, $options: 'i' } }
      ];
    }

    if (category && category !== 'All Categories') {
      filter.category = category;
    }

    if (tags.length > 0) {
      filter.tags = { $in: tags };
    }

    // Count total results
    const totalResults = await Gig.countDocuments(filter);
    const totalPages = Math.ceil(totalResults / perPage);

    // Get paginated results
    const results = await Gig.find(filter)
      .populate('freelancerId', 'username')
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * perPage)
      .limit(perPage);

    res.render('gigs/search', {
      title: 'Search Results',
      results: results,
      query: query,
      category: category,
      tags: tags,
      sortBy: sortBy,
      sortOrder: req.query.order || 'desc',
      currentPage: page,
      totalPages: totalPages,
      totalResults: totalResults
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('500', { title: 'Server Error', error: {} });
  }
});

// GET /gigs/create - Show create gig form (protected)
router.get('/create', isAuthenticated, (req, res) => {
  const success = req.session.gigSuccess || false;
  req.session.gigSuccess = false;

  res.render('gigs/create', {
    title: 'Create Gig',
    success
  });
});

// Validation rules for gig creation/update
const gigValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 20, max: 5000 }).withMessage('Description must be between 20 and 5000 characters'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['Web Development', 'Graphic Design', 'Writing & Translation', 'Digital Marketing', 'Video & Animation'])
    .withMessage('Please select a valid category'),
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 5 }).withMessage('Price must be at least €5'),
  body('deliveryTime')
    .notEmpty().withMessage('Delivery time is required')
    .isInt({ min: 1, max: 90 }).withMessage('Delivery time must be between 1 and 90 days')
];

// POST /gigs - Create new gig (protected)
router.post('/', isAuthenticated, upload.array('images', 5), gigValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('gigs/create', {
        title: 'Create Gig',
        errors: errors.array(),
        formData: req.body
      });
    }

    const { title, description, category, price, deliveryTime, tags } = req.body;

    // Process tags (can be string or array)
    let tagsArray = [];
    if (tags) {
      tagsArray = Array.isArray(tags) ? tags : [tags];
    }

    // Get uploaded file paths
    const imagePaths = req.files ? req.files.map(file => '/uploads/gigs/' + file.filename) : [];

    // Create new gig
    const newGig = new Gig({
      title,
      description,
      category,
      price,
      deliveryTime,
      tags: tagsArray,
      images: imagePaths,
      freelancerId: req.session.user._id
    });

    await newGig.save();

    req.session.gigSuccess = true;
    res.redirect('/gigs/create');
  } catch (error) {
    console.error(error);
    res.status(500).render('500', { title: 'Server Error', error: {} });
  }
});

// GET /gigs/:id - Show gig details
router.get('/:id', async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id)
      .populate('freelancerId', 'username email bio');

    if (!gig) {
      return res.status(404).render('404', { title: 'Gig Not Found' });
    }

    // Check if current user owns this gig
    const isOwner = req.session.user &&
      req.session.user._id.toString() === gig.freelancerId._id.toString();

    res.render('gigs/detail', {
      title: gig.title,
      gig: gig,
      isOwner: isOwner
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('500', { title: 'Server Error', error: {} });
  }
});

// GET /gigs/:id/edit - Show edit gig form (protected)
router.get('/:id/edit', isAuthenticated, async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).render('404', { title: 'Gig Not Found' });
    }

    // Check if user owns this gig
    if (gig.freelancerId.toString() !== req.session.user._id.toString()) {
      return res.status(403).render('403', {
        title: 'Unauthorized - CareFreelancer',
        message: 'You do not have permission to modify this gig.'
      });
    }

    res.render('gigs/edit', {
      title: 'Edit Gig',
      gig: gig
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('500', { title: 'Server Error', error: {} });
  }
});

// PUT /gigs/:id - Update gig (protected)
router.put('/:id', isAuthenticated, upload.array('images', 5), gigValidation, async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).render('404', { title: 'Gig Not Found' });
    }

    // Check if user owns this gig
    if (gig.freelancerId.toString() !== req.session.user._id.toString()) {
      return res.status(403).render('403', {
        title: 'Unauthorized - CareFreelancer',
        message: 'You do not have permission to modify this gig.'
      });
    }

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('gigs/edit', {
        title: 'Edit Gig',
        gig: gig,
        errors: errors.array()
      });
    }

    const { title, description, category, price, deliveryTime, tags, deleteImages } = req.body;

    // Process tags
    let tagsArray = [];
    if (tags) {
      tagsArray = Array.isArray(tags) ? tags : [tags];
    }

    // Update fields
    gig.title = title;
    gig.description = description;
    gig.category = category;
    gig.price = price;
    gig.deliveryTime = deliveryTime;
    gig.tags = tagsArray;

    // Handle image deletion
    if (deleteImages) {
      const imagesToDelete = Array.isArray(deleteImages) ? deleteImages : [deleteImages];

      // Delete files from filesystem
      await deleteFiles(imagesToDelete);

      // Remove deleted images from the gig's images array
      gig.images = gig.images.filter(img => !imagesToDelete.includes(img));
    }

    // Add new images if uploaded
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => '/uploads/gigs/' + file.filename);
      gig.images = [...gig.images, ...newImages];
    }

    await gig.save();

    res.redirect('/gigs/' + gig._id);
  } catch (error) {
    console.error(error);
    res.status(500).render('500', { title: 'Server Error', error: {} });
  }
});

// DELETE /gigs/:id - Delete gig (soft delete)
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).render('404', { title: 'Gig Not Found' });
    }

    // Check if user owns this gig
    if (gig.freelancerId.toString() !== req.session.user._id.toString()) {
      return res.status(403).render('403', {
        title: 'Unauthorized - CareFreelancer',
        message: 'You do not have permission to modify this gig.'
      });
    }

    // Soft delete - change status to 'deleted'
    gig.status = 'deleted';
    await gig.save();

    res.redirect('/gigs');
  } catch (error) {
    console.error(error);
    res.status(500).render('500', { title: 'Server Error', error: {} });
  }
});

module.exports = router;

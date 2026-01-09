const express = require('express');
const router = express.Router();

//placeholder routes for gigs in phase 3 of the plan

//GET/gigs - List all gigs
router.get('/', (req, res) => {
  res.render('gigs/list', {
    title: 'Browse Gigs',
     gigs: []
  });
});

// GET /gigs/search - Search results in Phase 4 UI
router.get('/search', (req, res) => {
  res.render('gigs/search', {
    title: 'Search Results',
    results: [],
    query: req.query.q || ''
  });
});

//GET/gigs/create - Show create gig form
router.get('/create', (req, res) => {
  const success = req.session.gigSuccess || false;

  req.session.gigSuccess = false;

  res.render('gigs/create', {
    title: 'Create Gig',
    success
  });
});

//POST/gigs - Create new gig
router.post('/', (req, res) => {
  req.session.gigSuccess = true;
  res.redirect('/gigs/create');
});

//GET/gigs/:id - Show gig details
router.get('/:id', (req, res) => {
  res.send('Gig details page not implemented yet');
});

//GET/gigs/:id/edit - Show edit gig form
router.get('/:id/edit', (req, res) => {
  res.send('Edit gig form not implemented yet');
});

//POST/gigs/:id - Update gig
router.post('/:id', (req, res) => {
  res.send('Update gig functionality not implemented yet');
});

//POST/gigs/:id/delete - Delete gig
router.post('/:id/delete', (req, res) => {
  res.send('Delete gig functionality not implemented yet');
});

module.exports = router;

const express = require('express');
const router = express.Router();

//placeholder routes for gigs in phase 3 of the plan

//GET/gigs - List all gigs
router.get('/', (req, res) => {
  res.render('gigs/list', {
    title: 'Browse Gigs',
  });
});

//GET/gigs/create - Show create gig form
router.get('/create', (req, res) => {
  res.send('Create gig form not implemented yet');
});

//POST/gigs - Create new gig
router.post('/', (req, res) => {
  res.send('Create gig functionality not implemented yet');
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

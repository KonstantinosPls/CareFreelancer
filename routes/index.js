const express = require('express');
const router = express.Router();

//this is the homepage route
router.get('/', (req, res) => {
  res.render('index', { title: 'CareFreelancer - Home' });
});

module.exports = router;

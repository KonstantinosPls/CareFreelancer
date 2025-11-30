const express = require('express');
const router = express.Router();

//placeholder routes for authentication in phase 2 of the plan

//GET/auth/register
router.get('/register', (req, res) => {
  res.send('Register page not implemented yet');
});

//POST/auth/register
router.post('/register', (req, res) => {
  res.send('Register functionality not implemented yet');
});

//GET/auth/login
router.get('/login', (req, res) => {
  res.send('Login page not implemented yet');
});

//POST/auth/login
router.post('/login', (req, res) => {
  res.send('Login functionality not implemented yet');
});

//GET/auth/logout
router.get('/logout', (req, res) => {
  res.send('Logout functionality not implemented yet');
});

module.exports = router;

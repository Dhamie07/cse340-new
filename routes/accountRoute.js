// accountRoute.js

const express = require('express');
const utilities = require('../utilities');
const accountController = require('../controllers/accountController');

const router = express.Router();

// GET route for the login view (existing)
router.get('/login', utilities.handleErrors(accountController.buildLogin));

// GET route for the registration view ✨ NEW ROUTE HERE ✨
router.get('/registration', utilities.handleErrors(accountController.buildRegistration)); 

// GET route for "My Account" page (existing)
router.get('/', utilities.handleErrors(accountController.buildAccount));

// Export the router
// POST route for account registration ✨ NEW ROUTE HERE ✨
router.post('/register', utilities.handleErrors(accountController.registerAccount));

module.exports = router;
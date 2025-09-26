const express = require('express');
const accountController = require('../controllers/accountController');

const router = express.Router();

// Registration route
router.post('/register', accountController.register);

module.exports = router;
const accountValidate = require('../utilities/account-validation'); // Renamed for clarity, as it handles all account validation
const express = require('express');
const utilities = require('../utilities');
const accountController = require('../controllers/accountController');

const router = express.Router();

// GET route for the login view (existing)
router.get('/login', utilities.handleErrors(accountController.buildLogin));

// GET route for the registration view (existing)
router.get('/registration', utilities.handleErrors(accountController.buildRegistration)); 

// GET route for "My Account" page (existing)
router.get('/', utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement));

// GET route to deliver the Account Update View ✨ NEW ROUTE (Task 5) ✨
router.get(
    '/update/:account_id', 
    utilities.checkLogin, 
    utilities.handleErrors(accountController.buildUpdateView)
);

// Process the registration data (existing)
router.post(
    "/register",
    accountValidate.registationRules(),
    accountValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
);

// Process the login attempt (existing)
router.post(
    "/login",
    accountValidate.loginRules(),
    accountValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin)
);

// Process the Account Information Update ✨ NEW ROUTE (Task 5) ✨
router.post(
    "/update",
    utilities.checkLogin,
    accountValidate.updateAccountRules(),
    accountValidate.checkAccountUpdateData,
    utilities.handleErrors(accountController.updateAccount)
);

// Process the Password Change Request ✨ NEW ROUTE (Task 5) ✨
router.post(
    "/change-password",
    utilities.checkLogin,
    accountValidate.changePasswordRules(),
    accountValidate.checkPasswordData,
    utilities.handleErrors(accountController.updatePassword)
);

module.exports = router;

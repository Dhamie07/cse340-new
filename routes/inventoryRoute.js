// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
// Import validation middleware
const invValidate = require("../utilities/inv-validation")
const utilities = require("../utilities")

// Route to build the Inventory Management view (TASK 1)
// URL: /inv/
// PROTECTION ADDED: Requires login and Employee/Admin authorization
router.get(
    "/", 
    utilities.checkLogin,
    utilities.checkAuthorization,
    utilities.handleErrors(invController.buildManagement)
)

// Route to deliver the Add New Classification view (TASK 2 GET)
// URL: /inv/add-classification
// PROTECTION ADDED
router.get(
    "/add-classification", 
    utilities.checkLogin,
    utilities.checkAuthorization,
    utilities.handleErrors(invController.buildAddClassification)
)

// Route to process the new classification data (TASK 2 POST)
// URL: /inv/add-classification
// PROTECTION ADDED
router.post(
    "/add-classification",
    utilities.checkLogin,
    utilities.checkAuthorization,
    invValidate.classificationRules(),
    invValidate.checkClassificationData,
    utilities.handleErrors(invController.addClassification)
)

// Route to deliver the Add New Inventory view (TASK 3 GET)
// URL: /inv/add-inventory
// PROTECTION ADDED
router.get(
    "/add-inventory",
    utilities.checkLogin,
    utilities.checkAuthorization,
    utilities.handleErrors(invController.buildAddInventory)
)

// Route to process the new inventory data (TASK 3 POST)
// URL: /inv/add-inventory
// PROTECTION ADDED
router.post(
    "/add-inventory",
    utilities.checkLogin,
    utilities.checkAuthorization,
    invValidate.inventoryRules(),
    invValidate.checkInventoryData,
    utilities.handleErrors(invController.addInventory)
)

// New route to get inventory data for AJAX requests
// This route is typically public for front-end loading, so no protection added here.
router.get(
    "/getInventory/:classification_id", 
    utilities.handleErrors(invController.getInventoryJSON)
);

// Route to deliver the Edit Inventory view (TASK 6 GET)
// URL: /inv/edit/:invId
// PROTECTION ADDED
router.get(
    "/edit/:invId",
    utilities.checkLogin,
    utilities.checkAuthorization,
    utilities.handleErrors(invController.buildEditInventoryView)
)

// Route to process the Edit Inventory data (TASK 6 POST)
// URL: /inv/update
// PROTECTION ADDED
router.post(
    "/update/", 
    utilities.checkLogin,
    utilities.checkAuthorization,
    invValidate.inventoryRules(), // Runs the validation rules for all inventory fields
    invValidate.checkUpdateData,  // Checks for errors, and if found, returns to the edit view with sticky data
    utilities.handleErrors(invController.updateInventory) // Continues to the controller function if validation passes
)

// ******************************
// Route: Delete Confirmation View (GET)
// Path: /inv/delete/:invId
// PROTECTION ADDED
// ******************************
router.get(
    "/delete/:invId",
    utilities.checkLogin,
    utilities.checkAuthorization,
    utilities.handleErrors(invController.buildDeleteConfirmation) // Controller function to be built later
);

// ******************************
// Route: Handle Delete Process (POST)
// Path: /inv/delete/:invId
// PROTECTION ADDED
// ******************************
router.post(
    "/delete/:invId",
    utilities.checkLogin,
    utilities.checkAuthorization,
    utilities.handleErrors(invController.deleteInventoryItem) // Controller function to be built later
);

// Existing routes (These remain unprotected as they display public inventory):
// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// A new route to deliver a single inventory item view
router.get("/detail/:invId", invController.buildByInvId);

// Route to trigger a 500 error
router.get("/500", invController.trigger500Error)

module.exports = router;

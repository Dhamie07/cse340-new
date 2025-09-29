// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
// Import validation middleware
const invValidate = require("../utilities/inv-validation")
const utilities = require("../utilities")

// Route to build the Inventory Management view (TASK 1)
// URL: /inv/
router.get(
    "/", 
    utilities.handleErrors(invController.buildManagement)
)

// Route to deliver the Add New Classification view (TASK 2 GET)
// URL: /inv/add-classification
router.get(
    "/add-classification", 
    utilities.handleErrors(invController.buildAddClassification)
)

// Route to process the new classification data (TASK 2 POST)
// URL: /inv/add-classification
router.post(
    "/add-classification",
    invValidate.classificationRules(),
    invValidate.checkClassificationData,
    utilities.handleErrors(invController.addClassification)
)

// Route to deliver the Add New Inventory view (TASK 3 GET)
// URL: /inv/add-inventory
router.get(
    "/add-inventory",
    utilities.handleErrors(invController.buildAddInventory)
)

// Route to process the new inventory data (TASK 3 POST)
// URL: /inv/add-inventory
router.post(
    "/add-inventory",
    invValidate.inventoryRules(),
    invValidate.checkInventoryData,
    utilities.handleErrors(invController.addInventory)
)

// New route to get inventory data for AJAX requests
router.get(
    "/getInventory/:classification_id", 
    utilities.handleErrors(invController.getInventoryJSON)
);

// Route to deliver the Edit Inventory view (TASK 6 GET)
// URL: /inv/edit/:invId
router.get(
    "/edit/:invId",
    utilities.handleErrors(invController.buildEditInventoryView)
)

// Route to process the Edit Inventory data (TASK 6 POST)
// URL: /inv/update
router.post(
    "/update/", 
    invValidate.inventoryRules(), // Runs the validation rules for all inventory fields
    invValidate.checkUpdateData,  // Checks for errors, and if found, returns to the edit view with sticky data
    utilities.handleErrors(invController.updateInventory) // Continues to the controller function if validation passes
)

// Existing routes:
// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// A new route to deliver a single inventory item view
router.get("/detail/:invId", invController.buildByInvId);

// Route to trigger a 500 error
router.get("/500", invController.trigger500Error)

module.exports = router;


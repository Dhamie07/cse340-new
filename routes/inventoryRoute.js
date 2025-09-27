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


// Existing routes:
// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// A new route to deliver a single inventory item view
router.get("/detail/:invId", invController.buildByInvId);

// Route to trigger a 500 error
router.get("/500", invController.trigger500Error)

module.exports = router;
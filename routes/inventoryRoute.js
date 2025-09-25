// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// A new route to deliver a single inventory item view
router.get("/detail/:invId", invController.buildByInvId);

// Route to trigger a 500 error
router.get("/500", invController.trigger500Error)

module.exports = router;
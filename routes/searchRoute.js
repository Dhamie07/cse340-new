const express = require('express')
const router = new express.Router() 
const searchController = require("../controllers/searchController")
const utilities = require("../utilities") // For handleErrors

// Route to handle the search results (GET request for display)
// URL: /search/results?search_term=...
router.get(
    "/results", 
    utilities.handleErrors(searchController.buildSearchResults)
)

module.exports = router;
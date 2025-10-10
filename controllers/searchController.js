const invModel = require("../models/inventory-model") 
const utilities = require("../utilities/")
// Removed 'const pool = require('../database/')' as it's not used in this function

/* ****************************************
 * Controller to build search results view
 * *************************************** */
async function buildSearchResults(req, res, next) {
    const search_term = req.query.search_term // Get the term from the URL query string
    
    // Fetch the navigation variable early and await it
    let nav = await utilities.getNav() 

    // 0. Input validation
    if (!search_term || search_term.trim() === "") {
        req.flash("notice", "Please enter a search term.")
        // Ensure 'nav' is also passed if redirect fails or if you want to render a proper page
        return res.render("errors/error", {
            title: "Search Error",
            message: "Please enter a search term.",
            nav, 
            errors: null 
        })
    }
    
    // 1. Call the model function to get data
    let searchResults = await invModel.searchInventory(search_term)

    // 2. Build the result view HTML
    let inventoryDisplay = ""
    let resultCount = searchResults.length
    
    // Note: This requires utilities.buildClassificationGrid to be renamed or aliased to utilities.buildInventoryGrid
    if (resultCount > 0) {
        // Using the function you specified:
        inventoryDisplay = await utilities.buildClassificationGrid(searchResults)
    } else {
        inventoryDisplay = `<p class="notice">Sorry, no vehicles matched "${search_term}".</p>`
    }

    // 3. Render the search results view
    res.render("inventory/search-results", {
        title: `Search Results for "${search_term}" (${resultCount})`,
        nav, // <-- Pass the fetched nav variable
        inventoryDisplay: inventoryDisplay,
        search_term: search_term,
        errors: null,
    })
}

module.exports = { 
    buildSearchResults 
}

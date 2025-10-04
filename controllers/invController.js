/* **************************************
 * Filename: invController.js
 * Description: Controller for inventory routes
 * ************************************ */

const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 * Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = utilities.handleErrors(async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
})

/* ***************************
 * Build inventory by invId view
 * ************************** */ 
const buildByInvId = async function (req, res, next) {
  const invId = req.params.invId
  const invData = await invModel.getInventoryByInvId(invId)
  
  if (!invData) {
    req.flash("notice", "Sorry, no vehicle information could be found.")
    res.render("inventory/detail", {
      title: "Vehicle Not Found",
      nav: await utilities.getNav(),
      invDetail: "<h1>Vehicle Not Found</h1>"
    })
    return
  }
  
  const invDetailHtml = await utilities.buildInvDetailHtml(invData)
  const itemName = `${invData.inv_make} ${invData.inv_model}`
  res.render("inventory/detail", {
    title: itemName,
    nav: await utilities.getNav(),
    invDetail: invDetailHtml,
  })
}

/* ****************************************
* Deliver Inventory Management view (TASK 1 GET)
* URL: /inv/
* *************************************** */
invCont.buildManagement = utilities.handleErrors(async function (req, res, next) {
    let nav = await utilities.getNav()
    const message = req.flash("notice")
    
    // --- START: Added code to build and include classification list ---
    const classificationSelect = await utilities.buildClassificationList()

    res.render("inventory/management", {
        title: "Inventory Management",
        nav,
        errors: null,
        message,
        classificationSelect, // Added the select list to the render data object
    })
    // --- END: Added code to build and include classification list ---
})

/* ****************************************
* Deliver Add New Classification view (TASK 2 GET)
* URL: /inv/add-classification
* *************************************** */
invCont.buildAddClassification = utilities.handleErrors(async function (req, res, next) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: null,
        classification_name: null,
    })
})

/* ****************************************
* Process Add New Classification (TASK 2 POST)
* *************************************** */
invCont.addClassification = utilities.handleErrors(async function (req, res, next) {
    const { classification_name } = req.body

    const classResult = await invModel.createClassification(classification_name)

    let nav = await utilities.getNav()
    
    if (classResult) {
        // Success: New classification added. 
        req.flash("notice", `The ${classification_name} classification was successfully created.`)
        
        // Re-fetch nav to show the new classification immediately
        nav = await utilities.getNav() 
        
        res.status(201).redirect("/inv") // Redirect back to management
    } else {
        // Failure: Render the add classification view with an error message
        req.flash("notice", "Sorry, adding the classification failed.")
        res.status(501).render("inventory/add-classification", {
            title: "Add New Classification",
            nav,
            errors: null,
            classification_name, // Make field sticky
        })
    }
})

/* ****************************************
* Deliver Add New Inventory view (TASK 3 GET)
* URL: /inv/add-inventory
* *************************************** */
invCont.buildAddInventory = utilities.handleErrors(async function (req, res, next) {
    let nav = await utilities.getNav()
    // Pass the dynamically built classification select list to the view
    let classificationList = await utilities.buildClassificationList()
    res.render("inventory/add-inventory", {
        title: "Add New Inventory",
        nav,
        classificationList,
        errors: null,
    })
})

/* ****************************************
* Process Add New Inventory (TASK 3 POST)
* *************************************** */
invCont.addInventory = utilities.handleErrors(async function (req, res, next) {
    const { 
        inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, 
        inv_price, inv_miles, inv_color, classification_id 
    } = req.body

    const invResult = await invModel.addInventory(
        inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, 
        inv_price, inv_miles, inv_color, classification_id 
    )
    
    if (invResult) {
        // Success: New inventory item added. Redirect to management view.
        req.flash("notice", `${inv_make} ${inv_model} was successfully added to inventory.`)
        
        res.status(201).redirect("/inv") // Redirect to management view
    } else {
        // Failure: Render the add inventory view with a failure message
        req.flash("notice", "Sorry, adding the new inventory item failed.")
        
        // Rebuild classification list, marking the selected one for stickiness
        const classificationList = await utilities.buildClassificationList(classification_id)
        let nav = await utilities.getNav()

        res.status(501).render("inventory/add-inventory", {
            title: "Add New Inventory",
            nav,
            classificationList,
            errors: null,
            // Pass all form values back for stickiness
            inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, 
            inv_price, inv_miles, inv_color,
        })
    }
})

/* ***************************
 * Trigger intentional 500 error
 * ************************** */
invCont.trigger500Error = utilities.handleErrors(async function (req, res, next) {
  // Intentionally trigger a 500 error
  throw new Error("This is an intentional 500 error.")
})

// All controller functions must be exported as an object to be seen by the routes.
invCont.buildByInvId = utilities.handleErrors(buildByInvId)

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 * Build edit inventory view
 * ************************** */
invCont.buildEditInventoryView = utilities.handleErrors(async function (req, res, next) {
  const inv_id = parseInt(req.params.invId) // Note: using req.params.invId from the route definition
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryByInvId(inv_id) // Assumes a model function named getInventoryByInvId exists
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
})

/* ***************************
 * Update Inventory Data
 * ************************** */
invCont.updateInventory = utilities.handleErrors(async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body

  // Parse inv_id to an integer, as database IDs are typically integers
  const inv_id_int = parseInt(inv_id)

  // Call the model function with the correct parameter order (matching the model's SQL $1 to $11)
  const updateResult = await invModel.updateInventory(
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
    inv_id_int
  )

  if (updateResult) {
    // updateResult is the rowCount (1) on success. Use req.body to build the name.
    const itemName = inv_make + " " + inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    // Failure to update in the database
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id, // Pass back the original ID for stickiness
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
  }
})

/* ***************************
 * Build Delete Confirmation View
 * ************************** */
invCont.buildDeleteConfirmation = utilities.handleErrors(async function (req, res, next) {
    const inv_id = parseInt(req.params.invId); 
    let nav = await utilities.getNav();
    const itemData = await invModel.getInventoryByInvId(inv_id); // Fetch item details

    if (!itemData) {
        req.flash("notice", "Sorry, the inventory item could not be found for deletion.");
        return res.redirect("/inv/");
    }

    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
    // Render the confirmation view, passing item data for display and form stickiness
    res.render("./inventory/delete-confirm", { 
        title: "Delete " + itemName,
        nav,
        errors: null,
        inv_id: itemData.inv_id,
        inv_make: itemData.inv_make,
        inv_model: itemData.inv_model,
        inv_year: itemData.inv_year,
        inv_price: itemData.inv_price,
    });
});

/* ***************************
 * Delete Inventory Item
 * ************************** */
invCont.deleteInventoryItem = utilities.handleErrors(async function (req, res, next) {
    // Get data from the hidden form fields
    const { inv_id, inv_make, inv_model } = req.body;
    const inv_id_int = parseInt(inv_id);

    // Call the model function to delete the item
    // NOTE: The deleteInventoryItem model function must be created next.
    const deleteResult = await invModel.deleteInventoryItem(inv_id_int); 

    if (deleteResult) {
        const itemName = inv_make + " " + inv_model;
        req.flash("notice", `The ${itemName} was successfully deleted.`);
        res.redirect("/inv/"); // Redirect back to management view
    } else {
        // Deletion failed: Re-render the confirmation view with an error message
        const nav = await utilities.getNav();
        const itemName = `${inv_make} ${inv_model}`;
        
        req.flash("notice", "Sorry, the deletion failed.");
        
        // Pass necessary data back for display
        res.status(501).render("inventory/delete-confirm", {
            title: "Delete " + itemName,
            nav,
            errors: null,
            inv_id,
            inv_make,
            inv_model,
            inv_year: req.body.inv_year || null,
            inv_price: req.body.inv_price || null,
        });
    }
});

module.exports = invCont

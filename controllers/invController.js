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
    res.render("inventory/management", {
        title: "Inventory Management",
        nav,
        errors: null,
        message,
    })
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

module.exports = invCont
const { body, validationResult } = require("express-validator")
const utilities = require(".")
// We need the model to call the utility function for the sticky dropdown
const invModel = require("../models/inventory-model") 

const validate = {}

/* ****************************************
 * Classification Data Validation Rules (Task 2)
 * *************************************** */
validate.classificationRules = () => {
  return [
    // Classification name is required and must not contain spaces or special chars
    body("classification_name")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Classification name is required.")
      .custom(async (classification_name) => {
        // Check for spaces and special characters (allows only letters and numbers)
        if (!/^[a-zA-Z0-9]+$/.test(classification_name)) {
            throw new Error("Classification name cannot contain spaces or special characters.")
        }
      }),
  ]
}

/* ****************************************
 * Check Classification Data and return errors or continue (Task 2)
 * *************************************** */
validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body
  let errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      errors,
      title: "Add New Classification",
      nav,
      classification_name, // Make field sticky
    })
    return
  }
  next()
}

/* ****************************************
 * Inventory Data Validation Rules (Task 3 / Task 6)
 * *************************************** */
validate.inventoryRules = () => {
  return [
    // Classification ID is required
    body("classification_id")
      .trim()
      .notEmpty()
      .withMessage("Please select a classification."),

    // Make is required and must be at least 3 characters
    body("inv_make")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Make is required and must be at least 3 characters."),

    // Model is required and must be at least 3 characters
    body("inv_model")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Model is required and must be at least 3 characters."),

    // Description is required
    body("inv_description")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Description is required."),

    // Image path is required
    body("inv_image")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Image path is required."),

    // Thumbnail path is required
    body("inv_thumbnail")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Thumbnail path is required."),

    // Price is required and must be a number/currency format
    body("inv_price")
      .trim()
      .isNumeric()
      .withMessage("Price is required and must be a valid number."),

    // Year is required and must be a 4-digit number
    body("inv_year")
      .trim()
      .isLength({ min: 4, max: 4 })
      .isNumeric()
      .withMessage("Year is required and must be a 4-digit number."),

    // Miles is required and must be a number
    body("inv_miles")
      .trim()
      .isNumeric()
      .withMessage("Miles is required and must be a number."),

    // Color is required and must be alphabetic
    body("inv_color")
      .trim()
      .isAlpha()
      .withMessage("Color is required and must contain only letters."),
  ]
}

/* ****************************************
 * Check Inventory Data and return errors or continue (Task 3)
 * *************************************** */
validate.checkInventoryData = async (req, res, next) => {
  const { 
    inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, 
    inv_price, inv_miles, inv_color, classification_id 
  } = req.body
  
  // Build the list with the selected classification_id to maintain stickiness
  let classificationList = await utilities.buildClassificationList(classification_id)
  let errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/add-inventory", {
      errors,
      title: "Add New Inventory",
      nav,
      classificationList: classificationList,
      // Pass individual sticky values
      inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, 
      inv_price, inv_miles, inv_color,
    })
    return
  }
  next()
}

/* ****************************************
 * Check Update Data and return errors or direct to edit view (Task 6)
 * *************************************** */
validate.checkUpdateData = async (req, res, next) => {
  const { 
    inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, 
    inv_price, inv_miles, inv_color, classification_id, inv_id // inv_id added
  } = req.body
  
  // Build the list with the selected classification_id to maintain stickiness
  let classificationSelect = await utilities.buildClassificationList(classification_id)
  let errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    // Render the EDIT view
    res.render("./inventory/edit-inventory", {
      errors,
      // Dynamic title for stickiness
      title: "Edit " + inv_make + " " + inv_model, 
      nav,
      classificationSelect: classificationSelect,
      // Pass individual sticky values, including inv_id
      inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, 
      inv_price, inv_miles, inv_color, inv_id
    })
    return
  }
  next()
}

module.exports = validate
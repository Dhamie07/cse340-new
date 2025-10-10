const pool = require("../database/")

/* ***************************
 * Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 * Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      // FIXED: Consolidated query to a single line to prevent syntax errors
      `SELECT * FROM public.inventory AS i JOIN public.classification AS c ON i.classification_id = c.classification_id WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    // Corrected error message to be more specific
    console.error("getInventoryByClassificationId error: " + error)
  }
}

/* *****************************
* Get inventory by inventory id
* **************************** */
async function getInventoryByInvId(inv_id) { // Renamed parameter to inv_id for consistency
  try {
    const data = await pool.query(
      "SELECT * FROM inventory AS i JOIN classification AS c ON i.classification_id = c.classification_id WHERE i.inv_id = $1",
      [inv_id]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getInventoryByInvId error: " + error)
  }
}

/* ***************************
 * Add new classification (TASK 2)
 * ************************** */
async function createClassification(classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
    const data = await pool.query(sql, [classification_name])
    // Returning the inserted row data
    return data.rows[0] 
  } catch (error) {
    // Return the error message on failure
    return error.message
  }
}

/* ***************************
 * Add new inventory item (TASK 3)
 * ************************** */
async function addInventory(
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
) {
  try {
    const sql = 
      "INSERT INTO inventory (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *"
    const data = await pool.query(sql, [
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
    ])
    // Returning the inserted row data
    return data.rows[0]
  } catch (error) {
    // Return the error message on failure
    return error.message
  }
}

/* ***************************
 * Update Inventory Data
 * ************************** */
async function updateInventory(
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
  classification_id) {
  try {
    // Note: Parameter order in SQL must match array order below.
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
      inv_make, // $1
      inv_model, // $2
      inv_description, // $3
      inv_image, // $4
      inv_thumbnail, // $5
      inv_price, // $6
      inv_year, // $7
      inv_miles, // $8
      inv_color, // $9
      classification_id, // $10
      inv_id // $11 (Used in the WHERE clause)
    ])
    // Returning rowCount (1 on success, 0 on failure) for consistent controller logic
    return data.rowCount 
  } catch (error) {
    console.error("updateInventory error: " + error)
    // Return 0 on failure
    return 0 
  }
}

/* ***************************
 * Delete Inventory Item
 * ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = 'DELETE FROM inventory WHERE inv_id = $1'
    const data = await pool.query(sql, [inv_id])
    // Returning rowCount (1 on success, 0 on failure)
    return data.rowCount 
  } catch (error) {
    console.error("deleteInventoryItem error: " + error)
    return 0 // Return 0 on failure
  }
}

/* ***************************************
 * Get Inventory Items based on Search Query (NEW FUNCTION)
 * *************************************** */
async function searchInventory(search_term) {
  try {
    const sql = `
      SELECT 
        inv_id, inv_make, inv_model, inv_year, inv_price, inv_thumbnail, classification_name
      FROM 
        inventory i
      JOIN 
        classification c ON i.classification_id = c.classification_id
      WHERE 
        inv_make ILIKE $1 OR 
        inv_model ILIKE $1 OR 
        inv_description ILIKE $1 OR
        classification_name ILIKE $1
    `
    // Use the % wildcard for partial matching
    const searchParam = `%${search_term}%` 
    const data = await pool.query(sql, [searchParam])
    return data.rows
  } catch (error) {
    console.error("searchInventory error: " + error)
    // Throw an error to be caught by the controller's handleErrors utility
    throw new Error("Could not perform inventory search.")
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryByInvId,
  createClassification,
  addInventory,
  updateInventory,
  deleteInventoryItem, 
  searchInventory // <--- EXPORT THE NEW FUNCTION
};
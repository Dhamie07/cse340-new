// utilities/index.js
const jwt = require("jsonwebtoken")
require("dotenv").config()
// Import the inventory model to access classification data
const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=   '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* ****************************************
 * Build the classification select list (TASK 3)
 * *************************************** */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += `<option value="${row.classification_id}"`
    if (
      classification_id != null &&
      Number(row.classification_id) === Number(classification_id)
    ) {
      classificationList += " selected"
    }
    classificationList += `>${row.classification_name}</option>`
  })
  classificationList += "</select>"
  return classificationList
}


/* ****************************************
* Build inventory detail HTML
* *************************************** */
Util.buildInvDetailHtml = async function(invData) {
  const priceFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invData.inv_price)
  const mileageFormatted = new Intl.NumberFormat('en-US', { style: 'decimal', useGrouping: true }).format(invData.inv_miles)

  let html = '<div id="inv-detail-wrapper">'
  html += '<div class="image-container">'
  html += `<img src="${invData.inv_image}" alt="Image of a ${invData.inv_make} ${invData.inv_model}">`
  html += '</div>'
  html += '<div class="content-container">'
  html += `<h2>${invData.inv_make} ${invData.inv_model} Details</h2>`
  html += '<ul>'
  html += `<li><span class="detail-label">Price:</span> ${priceFormatted}</li>`
  html += `<li><span class="detail-label">Mileage:</span> ${mileageFormatted} miles</li>`
  html += `<li><span class="detail-label">Year:</span> ${invData.inv_year}</li>`
  html += `<li><span class="detail-label">Make:</span> ${invData.inv_make}</li>`
  html += `<li><span class="detail-label">Model:</span> ${invData.inv_model}</li>`
  html += `<li><span class="detail-label">Description:</span> ${invData.inv_description}</li>`
  html += `<li><span class="detail-label">Color:</span> ${invData.inv_color}</li>`
  html += '</ul>'
  html += '</div>'
  html += '</div>'
  return html
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 * **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
  jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
    if (err) {
      // REMOVED req.flash("notice", "Please log in") to fix repeated message on home page
      res.clearCookie("jwt")
      // We still redirect to login if the JWT is invalid/expired
      return res.redirect("/account/login") 
    }
    res.locals.accountData = accountData
    res.locals.loggedin = 1
    next()
    })
  } else {
    // We are not logged in, but we still proceed to the next route/middleware
    next()
  }
}

/* ****************************************
 * Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    // This is the correct place to set the flash message for protected routes
    req.flash("notice", "Please log in.") 
    return res.redirect("/account/login")
  }
 }

/* ****************************************
 * Check Authorization (Employee/Admin)
 * ****************************************/
Util.checkAuthorization = (req, res, next) => {
    // 1. Check if the user is logged in (loggedin is set by checkJWTToken)
    // The checkJWTToken middleware should always run before a protected route.
    if (!res.locals.loggedin) {
        req.flash("notice", "You must be logged in to view administrative pages.");
        // We redirect to login. checkLogin will handle the flash message better.
        // If checkLogin runs first, this block won't be reached if not logged in.
        // Assuming this runs *after* checkLogin/checkJWTToken:
        return res.redirect("/account/login");
    }

    // 2. Check if the account type is Admin or Employee
    const accountType = res.locals.accountData.account_type;

    if (accountType === 'Admin' || accountType === 'Employee') {
        // Authorized: continue to the next middleware or controller
        next();
    } else {
        // Not Authorized: Redirect to home with a message
        req.flash("notice", "You do not have the required authorization level to access this resource.");
        return res.redirect("/"); 
    }
};

module.exports = Util

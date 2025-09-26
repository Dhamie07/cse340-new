/* **************************************
 * Filename: index.js
 * Description: All general utilities for the application
 * ************************************ */
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
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
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

module.exports = Util
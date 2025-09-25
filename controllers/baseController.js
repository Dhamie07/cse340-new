const utilities = require("../utilities")
const invModel = require("../models/inventory-model")
const baseController = {}

baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  res.render("index", {title: "Home", nav})
}

module.exports = baseController
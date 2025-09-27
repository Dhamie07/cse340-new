// accountController.js

const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")

/* ****************************************
*  Deliver login view
* *************************************** */
// 🔑 MISSING CODE: Add the function declaration for buildLogin
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null, // Added to ensure view can safely check for errors
    })
}



/* ****************************************
*  Deliver registration view
* *************************************** */
// 🔑 MISSING CODE: Add the function declaration for buildRegistration
async function buildRegistration(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/registration", {
        title: "Registration",
        nav,
        // 👇 CHANGE MADE HERE: Added 'errors: null'
        errors: null,
    })
}


/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res, next) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    // Hash the password before storing
    let hashedPassword
    try {
        hashedPassword = await bcrypt.hash(account_password, 10)
    } catch (error) {
        req.flash("notice", 'Sorry, there was a processing error.')
        res.status(500).render("account/registration", {
            title: "Registration",
            nav,
            // Note: It's good practice to also include errors: null here if not present
        })
        return
    }

    // Pass the HASHED password to the model
    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword
    )

    if (regResult) {
        req.flash(
            "notice",
            `Congratulations, you\'re registered ${account_firstname}. Please log in.`
        )
        res.status(201).render("account/login", {
            title: "Login",
            nav,
            errors: null, // Added to ensure view can safely check for errors
        })
    } else {
        req.flash("notice", "Sorry, the registration failed.")
        res.status(501).render("account/registration", {
            title: "Registration",
            nav,
        })
    }
}

// All functions are now correctly defined and exported.
module.exports = { buildLogin, buildRegistration, registerAccount }
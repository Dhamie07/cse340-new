// accountController.js

const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null,
    })
}


/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegistration(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/registration", {
        title: "Registration",
        nav,
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
        // User's superior asynchronous hashing function (No change needed here)
        hashedPassword = await bcrypt.hash(account_password, 10)
    } catch (error) {
        // IMPROVEMENT HERE: Ensuring form data is passed back to keep fields sticky on a hashing error
        req.flash("notice", 'Sorry, there was a processing error during registration.')
        res.status(500).render("account/registration", {
            title: "Registration",
            nav,
            account_firstname,
            account_lastname,
            account_email,
            errors: null,
        })
        return
    }

    // Pass the HASHED password to the model
    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword // Correctly passes the hashed password
    )

    if (regResult) {
        req.flash(
            "notice",
            `Congratulations, you\'re registered ${account_firstname}. Please log in.`
        )
        res.status(201).render("account/login", {
            title: "Login",
            nav,
            errors: null,
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
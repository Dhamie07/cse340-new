// Import necessary modules
const jwt = require("jsonwebtoken")
require("dotenv").config()
// Importing utilities and models
const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")

/* ****************************************
* Deliver login view
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
* Deliver registration view
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
* Process Registration
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
            // The flash message will now be displayed when the user is redirected to /account/login
            `Congratulations, you\'re registered ${account_firstname}. Please log in.`
        )
        // FIX: Changed res.render() to res.redirect() to trigger the PRG pattern
        res.status(201).redirect("/account/login") 
    } else {
        req.flash("notice", "Sorry, the registration failed.")
        res.status(501).render("account/registration", {
            title: "Registration",
            nav,
        })
    }
}

/* ****************************************
* Process login request
* ************************************ */
async function accountLogin(req, res) {
    let nav = await utilities.getNav()
    const { account_email, account_password } = req.body
    const accountData = await accountModel.getAccountByEmail(account_email)
    if (!accountData) {
        req.flash("notice", "Please check your credentials and try again.")
        res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
        })
        return
    }
    try {
        if (await bcrypt.compare(account_password, accountData.account_password)) {
            delete accountData.account_password
            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
            if(process.env.NODE_ENV === 'development') {
                res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
            } else {
                res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
            }
            // Successful login redirects to the account management route
            return res.redirect("/account/")
        }
        else {
            req.flash("message notice", "Please check your credentials and try again.")
            res.status(400).render("account/login", {
                title: "Login",
                nav,
                errors: null,
                account_email,
            })
        }
    } catch (error) {
        throw new Error('Access Forbidden')
    }
}

/* ****************************************
* Deliver account management view
* This is the new function to deliver the post-login landing page.
* *************************************** */
async function buildAccountManagement(req, res, next) {
    let nav = await utilities.getNav()
    const pageTitle = "Account Management"
    res.render("account/account-management", {
        title: pageTitle,
        nav,
        errors: null, // Pass null for no express-validator errors
    })
}


// All functions are now correctly defined and exported.
module.exports = { buildLogin, buildRegistration, registerAccount, accountLogin, buildAccountManagement }
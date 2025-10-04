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
        hashedPassword = await bcrypt.hash(account_password, 10)
    } catch (error) {
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
        hashedPassword
    )

    if (regResult) {
        req.flash(
            "notice",
            `Congratulations, you\'re registered ${account_firstname}. Please log in.`
        )
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
* *************************************** */
async function buildAccountManagement(req, res, next) {
    let nav = await utilities.getNav()
    const pageTitle = "Account Management"
    res.render("account/account-management", {
        title: pageTitle,
        nav,
        errors: null,
    })
}

// ----------------------------------------------------
// FUNCTIONS FOR ACCOUNT UPDATE (TASK 5)
// ----------------------------------------------------

/* ****************************************
* Deliver Account Update view
* *************************************** */
async function buildUpdateView(req, res, next) {
    let nav = await utilities.getNav()
    const title = "Account Update"
    
    // accountData is already available via res.locals from checkJWTToken middleware
    res.render("account/account-update", {
        title: title,
        nav,
        errors: null,
        // The view will use res.locals.accountData to pre-populate fields
    })
}

/* ****************************************
* Process Account Information Update
* *************************************** */
async function updateAccount(req, res, next) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_id } = req.body

    const updateResult = await accountModel.updateAccount(
        account_firstname,
        account_lastname,
        account_email,
        account_id
    )

    if (updateResult) {
        const updatedAccountData = await accountModel.getAccountById(account_id)
        
        req.flash("notice", `Your account information was successfully updated.`)
        
        // Check if email changed, if so, a new JWT is required for the user's session
        if (account_email !== res.locals.accountData.account_email) {
             // 1. Re-issue JWT with new data
            delete updatedAccountData.account_password
            const accessToken = jwt.sign(updatedAccountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
            
            // 2. Set new cookie
            if(process.env.NODE_ENV === 'development') {
                res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
            } else {
                res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
            }
            
            // 3. Update res.locals for the immediate response (to show new greeting)
            res.locals.accountData = updatedAccountData
        }

        res.redirect("/account/")

    } else {
        req.flash("notice", "Sorry, the update failed. Please try again.")
        res.status(501).render("account/account-management", {
            title: "Account Management",
            nav,
            errors: null,
        })
    }
}

/* ****************************************
* Process Password Change
* *************************************** */
async function updatePassword(req, res, next) {
    let nav = await utilities.getNav()
    const { account_password, account_id } = req.body

    // Hash the password
    let hashedPassword
    try {
        hashedPassword = await bcrypt.hash(account_password, 10)
    } catch (error) {
        req.flash("notice", 'Sorry, there was a processing error during password change.')
        // Redirect to management and rely on flash message
        res.status(500).redirect("/account/")
        return
    }

    const updateResult = await accountModel.updatePassword(
        hashedPassword,
        account_id
    )

    if (updateResult) {
        req.flash("notice", `Your password was successfully updated.`)
        res.redirect("/account/")
    } else {
        req.flash("notice", "Sorry, the password change failed. Please try again.")
        res.status(501).redirect("/account/")
    }
}

/* ****************************************
* Process Logout Request (Task 6)
* *************************************** */
async function accountLogout(req, res) {
    // 1. Clear the JWT cookie
    res.clearCookie("jwt");
    
    // 2. Redirect the client to the home view
    req.flash("notice", "You have been logged out.");
    res.redirect("/");
}


// ----------------------------------------------------
// EXPORTING ALL FUNCTIONS
// ----------------------------------------------------

module.exports = { 
    buildLogin, 
    buildRegistration, 
    registerAccount, 
    accountLogin, 
    buildAccountManagement,
    buildUpdateView,
    updateAccount,
    updatePassword,
    accountLogout // New function exported
}

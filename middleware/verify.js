const asynHandler = require("./async");
const bcrypt = require("bcrypt");
const GlobalModel = require("../models/Global");
const UserModel = require("../models/User");
const { sendResponse, CatchHistory } = require("../helper/utilfunc");
const systemDate = new Date().toISOString().slice(0, 19).replace("T", " ");

exports.verifyAccountActivate = asynHandler(async (req, res, next) => {
    let email = req.body.email;
    let token = req.body.token;

    //check if email exist and resetPeriod is within 30minutes

    let findemail = await UserModel.ActivateOrResetAccount(email, 0);
    //if email exist
    if (!findemail) {
        CatchHistory({ api_response: `Sorry we failed to identify ${email}--activation time expired or email does not exist`, function_name: 'verifyAccountReset', date_started: systemDate, sql_action: "SELECT", event: "User Account Activate", actor: email }, req)
        return sendResponse(res, 0, 500, "Sorry we failed to identify you, please try later")
    }

    if (findemail) {
        //check for password
        const match = await bcrypt.compare(token, findemail?.resetToken)
        console.log(match);
        if (!match) {
            CatchHistory({ api_response: `Sorry, no record exist,token mismatch for ${email}`, function_name: 'verifyAccountReset', date_started: systemDate, sql_action: "SELECT", event: "User Account Activate", actor: email }, req)
            return sendResponse(res, 0, 500, 'Sorry we failed to verify you, please try later')
        }
    }


    req.date = systemDate
    req.user = findemail
    return next();
});

exports.verifyAccountReactivate = asynHandler(async (req, res, next) => {
    let email = req.body.email;

    //check if email exist and and status is deactivated or 0

    let findemail = await UserModel.ReActivateAccount(email, 0);
    //if email exist
    if (!findemail) {
        CatchHistory({ api_response: `Sorry ${email} already exist or has already been activated`, function_name: 'verifyAccountReset', date_started: systemDate, sql_action: "SELECT", event: "User Account Activate", actor: email }, req)
        return sendResponse(res, 0, 500, "Sorry account does not exist or has already been activated")
    }


    req.date = systemDate
    req.user = findemail
    return next();
});

exports.verifyResetAccount = asynHandler(async (req, res, next) => {
    let email = req.body.email;

    //check if email exist and and status is deactivated or 0

    let findemail = await UserModel.ReActivateAccount(email, 1);
    //if email exist
    if (!findemail) {
        CatchHistory({ api_response: `Sorry we failed to identify ${email}--activation time expired or email does not exist`, function_name: 'verifyResetAccount', date_started: systemDate, sql_action: "SELECT", event: "User Account Reset", actor: email }, req)
        return sendResponse(res, 0, 500, "Sorry we failed to identify you, please try later")
    }


    req.date = systemDate
    req.user = findemail
    return next();
});

exports.verifyAccountReset = asynHandler(async (req, res, next) => {
    let email = req.body.email;
    let token = req.body.token;

    //check if email exist and resetPeriod is within 30minutes

    let findemail = await UserModel.ActivateOrResetAccount(email, 1);
    //if email exist
    if (!findemail) {
        CatchHistory({ api_response: `Sorry we failed to identify ${email}--activation time expired or email does not exist`, function_name: 'verifyAccountReset', date_started: systemDate, sql_action: "SELECT", event: "User Account Activate", actor: email }, req)
        return sendResponse(res, 0, 500, "Sorry we failed to identify you, please try later")
    }

    if (findemail) {
        //check for password
        const match = await bcrypt.compare(token, findemail?.resetToken)
        if (!match) {
            CatchHistory({ api_response: `Sorry, no record exist,token mismatch for ${email}`, function_name: 'verifyAccountReset', date_started: systemDate, sql_action: "SELECT", event: "User Account Activate", actor: email }, req)
            return sendResponse(res, 0, 500, 'Sorry we failed to verify you, please try later')
        } else {
            req.date = systemDate
            req.user = findemail
            return next();
        }
    }



});
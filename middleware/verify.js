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

exports.verifyUser = asynHandler(async (req, res, next) => {
    let userId = req.body.userId;
  
    //check if user table if userId exist
  
    let finduser = await GlobalModel.Find('users','userId',userId);
    //if user exist
    if (!finduser) {
      CatchHistory({ api_response: `Sorry, user does not exist :${userId}`, function_name: 'verifyUser/middleware', date_started: systemDate, sql_action: "INSERT", event: "User Verify", actor: userId }, req)
      return sendResponse(res, 0, 200, "Sorry, user does not exist")
  
    }
  
 
  
     req.date = systemDate
     return next();
  });

exports.findBanner = asynHandler(async (req, res, next) => {
    let bannerId = req.body.bannerId;
  
    //check if banner table if bannerId exist
  
    let findbanner = await GlobalModel.Find('banner','bannerId',bannerId);
    //if banner exist
    if (!findbanner) {
      CatchHistory({ api_response: `Sorry, banner does not exist :${bannerId}`, function_name: 'findBanner/middleware', date_started: systemDate, sql_action: "UPDATE", event: "Find and update banner", actor: userId }, req)
      return sendResponse(res, 0, 200, "Sorry, banner does not exist")
  
    }
    req.date = systemDate
    req.banner = findbanner
     return next();
  });
  exports.findJob = asynHandler(async (req, res, next) => {
    let jobId = req.body.jobId;
  
    //check if banner table if jobId exist
  
    let findjob = await GlobalModel.Find('job_info','jobId',jobId);
    //if banner exist
    if (!findjob) {
      CatchHistory({ api_response: `Sorry, job does not exist :${jobId}`, function_name: 'findjob/middleware', date_started: systemDate, sql_action: "UPDATE", event: "Find and create questions", actor: userId }, req)
      return sendResponse(res, 0, 200, "Sorry, job does not exist")
  
    }
    req.date = systemDate
    req.job = findjob
     return next();
  });
  
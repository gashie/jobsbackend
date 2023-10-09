const bcyrpt = require("bcrypt");
const crypto = require("crypto");
const uuidV4 = require('uuid');
const { OAuth2Client } = require('google-auth-library')
const USERS = require("../../models/User");
const GlobalModel = require("../../models/Global");
const COMPANY = require("../../models/Company");
const dotenv = require("dotenv");
const asynHandler = require("../../middleware/async");
const { sendResponse, CatchHistory } = require("../../helper/utilfunc");
const { autoSaveUser, autoSaveCompany } = require("../../helper/autoSavers");
const { SendEmailApi } = require("../../sevices/comm");
dotenv.config({ path: "./config/config.env" });
const systemDate = new Date().toISOString().slice(0, 19).replace("T", " ");

exports.CreateUser = asynHandler(async (req, res, next) => {
  payload = req.body
  payload.roleid = payload.userType === 'jobseeker' ? 2 : 3
  payload.userId = uuidV4.v4()
  let rawResetToken = crypto.randomBytes(32).toString("hex");
  const salt = await bcyrpt.genSalt(10);
  payload.password = await bcyrpt.hash(payload.password, salt);
  payload.resetToken = await bcyrpt.hash(rawResetToken, salt);
  payload.resetPeriod = req.date
  console.log(req?.files);
  //find company in db
  if (payload.userType === 'employer') {
    //find company
    let companyResult = await COMPANY.FindCompany(payload.companyName);
    if (companyResult) {
      //set user status to pending and respond
      // let userPayload = {
      //   userId: uuidV4.v4(),
      //   email: payload.email,
      //   username: payload.username,
      //   userType: payload.userType,
      //   fullName: payload.fullName,
      //   password: payload.password,
      //   phone: payload.phone,
      //   address: payload.address,
      //   country: payload.country,
      //   birthDate: payload.birthDate,
      //   maritalStatus: payload.maritalStatus,
      //   gender: payload.gender,
      //   highestEducation: payload.highestEducation,
      //   status: 0,
      //   roleid: 3,

      // }
      // return await autoSaveUser(userPayload, req, res, rawResetToken)
      return sendResponse(res, 0, 200, 'Sorry, this company already exist')


    } else {
      return autoSaveCompany(payload, req, res)

    }

  } else {
    return await autoSaveUser(payload, req, res, rawResetToken)

  }


})
exports.GetAllUsers = asynHandler(async (req, res, next) => {
  let { viewAction } = req.body
  let actor = req.user.userInfo
  let results = await USERS.all(viewAction);
  if (results.length == 0) {
    CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} user's`, functionName: 'GetAllUsers', response: `No Record Found`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 0, 200, 'No Record Found')
  }
  CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} user's`, functionName: 'GetAllUsers', response: `Record Found`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);

  return sendResponse(res, 1, 200, 'Record Found', results)

});



exports.UpdateUser = asynHandler(async (req, res, next) => {
  const { reset, blockUser, allow, userId, patch, profile, deleterecord, restore } = req.body;
  const salt = await bcyrpt.genSalt(10);
  let actor = req.user.userInfo
  let rawResetToken = crypto.randomBytes(32).toString("hex");
  console.log(rawResetToken);
  let resetUserPayload = {
    updatedAt: req.date,
    resetToken: await bcyrpt.hash(rawResetToken, salt),
    resetPeriod: req.date,
  };
  let blockUserPayload = {
    updatedAt: req.date,
    status: allow,
  };
  let deleteUserPayload = {
    updatedAt: req.date,
    deletedAt: !restore ? req.date : null,
  };
  let patchUserPayload = {
    updatedAt: req.date,
    ...profile,
  };

  let switchActionPayload = reset ? resetUserPayload : blockUser ? blockUserPayload : deleterecord ? deleteUserPayload : patch ? patchUserPayload : ''

  let result = await GlobalModel.Update('users', switchActionPayload, 'userId', userId);

  if (result.affectedRows === 1) {
    CatchHistory({ event: 'UPDATE ADMIN USER', functionName: 'UpdateUser', response: `Record Updated`, dateStarted: req.date, state: 1, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 1, 200, 'Record Updated')

  } else {
    CatchHistory({ event: 'UPDATE ADMIN USER', functionName: 'UpdateUser', response: `Error Updating Record`, dateStarted: req.date, state: 0, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 0, 200, 'Error Updating Record')
  }

})

exports.ActivateAccount = asynHandler(async (req, res, next) => {
  let user = req.user;
  let { email } = req.body
  let payload = {};

  payload.updatedAt = req.date;
  payload.resetToken = null
  payload.resetPeriod = null
  payload.status = 1

  let result = await GlobalModel.Update('users', payload, 'userId', user.userId);

  if (result.affectedRows === 1) {
    CatchHistory({ api_response: `Account activated successfully :${email}`, function_name: 'ActivateAccount', date_started: req.date, sql_action: "UPDATE", event: "User Account Activate", actor: email }, req)
    return sendResponse(res, 1, 200, 'Account activated successfully')

  } else {
    CatchHistory({ api_response: `Sorry, no record exist,token mismatch for  :${email}`, function_name: 'ActivateAccount', date_started: req.date, sql_action: "UPDATE", event: "User Account Activate", actor: email }, req)
    return sendResponse(res, 0, 200, 'Failed to activate, please try again later')
  }

})
exports.SendActivation = asynHandler(async (req, res, next) => {
  let user = req.user;
  const salt = await bcyrpt.genSalt(10);

  let { email } = req.body
  let payload = {};
  let rawResetToken = crypto.randomBytes(32).toString("hex");
  console.log(rawResetToken);
  payload.updatedAt = req.date;
  payload.resetToken = await bcyrpt.hash(rawResetToken, salt);
  payload.resetPeriod = req.date
  // payload.status = 1

  let result = await GlobalModel.Update('users', payload, 'userId', user.userId);

  if (result.affectedRows === 1) {
    SendEmailApi("gashie@asimeglobal.com",
      `Hi,

    You have created an account on the Jobsinghana web site. To fully enjoy our services, please confirm activation by clicking the link below:
    http://localhost:3000/passwordaction?token=${rawResetToken}&email=${email}

    
    If the link above does not work, please copy and paste it into your browser's address bar and press the Enter key.
    
    After successful confirmation, you can login and enjoy all the features of Jobsinghana.`
      , "Confirm your Account Details", email)
    CatchHistory({ api_response: `Activation token sent to ${email}`, function_name: 'ActivateAccount', date_started: req.date, sql_action: "UPDATE", event: "User Account Activate", actor: email }, req)
    return sendResponse(res, 1, 200, 'Activation token has been sent to your email successfully')

  } else {
    CatchHistory({ api_response: `Failed to update record or save activation code for  :${email}`, function_name: 'ActivateAccount', date_started: req.date, sql_action: "UPDATE", event: "User Account Activate", actor: email }, req)
    return sendResponse(res, 0, 200, 'Failed to activation code, please try again later')
  }

})
exports.ReSendActivation = asynHandler(async (req, res, next) => {
  let user = req.user;
  const salt = await bcyrpt.genSalt(10);

  let { email } = req.body
  let payload = {};
  let rawResetToken = crypto.randomBytes(32).toString("hex");
  console.log(rawResetToken);
  payload.updatedAt = req.date;
  payload.resetToken = await bcyrpt.hash(rawResetToken, salt);
  payload.resetPeriod = req.date
  // payload.status = 1

  let result = await GlobalModel.Update('users', payload, 'userId', user.userId);

  if (result.affectedRows === 1) {
    SendEmailApi("gashie@asimeglobal.com",
      `Hi,

    You have created an account on the Jobsinghana web site. To fully enjoy our services, please confirm activation by clicking the link below:
    http://localhost:3000/emailaction?token=${rawResetToken}&email=${email}

    
    If the link above does not work, please copy and paste it into your browser's address bar and press the Enter key.
    
    After successful confirmation, you can login and enjoy all the features of Jobsinghana.`
      , "Confirm your Account Details", email)
    CatchHistory({ api_response: `Activation token sent to ${email}`, function_name: 'ActivateAccount', date_started: req.date, sql_action: "UPDATE", event: "User Account Activate", actor: email }, req)
    return sendResponse(res, 1, 200, 'Activation token has been sent to your email successfully')

  } else {
    CatchHistory({ api_response: `Failed to update record or save activation code for  :${email}`, function_name: 'ActivateAccount', date_started: req.date, sql_action: "UPDATE", event: "User Account Activate", actor: email }, req)
    return sendResponse(res, 0, 200, 'Failed to activation code, please try again later')
  }

})

exports.PasswordReset = asynHandler(async (req, res, next) => {
  let user = req.user;
  let email = req.body.email;
  const salt = await bcyrpt.genSalt(10);
  let payload = req.body

  let newPayload = {
    password: await bcyrpt.hash(payload.password, salt),
    updatedAt: req.date,
    resetPeriod: null,
    resetToken: null
  }

  let result = await GlobalModel.Update('users', newPayload, 'userId', user.userId);

  if (result.affectedRows === 1) {
    CatchHistory({ api_response: `Password has been changed successfully for ${email}`, function_name: 'ActivateAccount', date_started: req.date, sql_action: "UPDATE", event: "User Account Activate", actor: email }, req)
    return sendResponse(res, 1, 200, 'Password has been changed successfully')

  } else {
    CatchHistory({ api_response: `Failed to update record or save new password for  :${email}`, function_name: 'ActivateAccount', date_started: req.date, sql_action: "UPDATE", event: "User Account Activate", actor: email }, req)
    return sendResponse(res, 0, 200, 'Failed to save new password, please try again later')
  }

})


exports.GoogleAuth = asynHandler(async (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://loclahost:5050')
  res.header('Referrer-Policy', 'no-referrer-whendowngrade');

  const redirectUrl = 'http://localhost:3000';

  const oAuth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUrl

  )

  const authroizeUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: 'https://www.googleapis.com/auth/userinfo.profile',
    prompt: 'consent'
  })

  res.json({ authroizeUrl })
})

exports.GoogleAuthFetchUser = asynHandler(async (req, res, next) => {
  async function getUserData(access_token) {

    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);

    //console.log('response',response);
    const data = await response.json();
    console.log('data', data);
  }

  const code = req.query.code;

  console.log(code);
  try {
    const redirectURL = "http://127.0.0.1:3000/oauth"
    const oAuth2Client = new OAuth2Client(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      redirectURL
    );
    const r = await oAuth2Client.getToken(code);
    // Make sure to set the credentials on the OAuth2 client.
    await oAuth2Client.setCredentials(r.tokens);
    console.info('Tokens acquired.');
    const user = oAuth2Client.credentials;
    console.log('credentials', user);
    await getUserData(oAuth2Client.credentials.access_token);

  } catch (err) {
    console.log('Error logging in with OAuth2 user', err);
  }


  res.redirect(303, 'http://localhost:5050/');
})

exports.AdminCreateUser = asynHandler(async (req, res, next) => {
  payload = req.body
  payload.userId = uuidV4.v4()
  let rawResetToken = crypto.randomBytes(32).toString("hex");
  const salt = await bcyrpt.genSalt(10);
  payload.password = await bcyrpt.hash(payload.password, salt);
  payload.resetToken = await bcyrpt.hash(rawResetToken, salt);
  payload.resetPeriod = req.date
  //set user status to pending and respond
  let userPayload = {
    userId: uuidV4.v4(),
    email: payload.email,
    username: payload.username,
    userType: payload.userType,
    fullName: payload.fullName,
    password: payload.password,
    phone: payload.phone,
    address: payload.address,
    country: payload.country,
    birthDate: payload.birthDate,
    maritalStatus: payload.maritalStatus,
    gender: payload.gender,
    highestEducation: payload.highestEducation,
    status: payload.status || 0,
    roleid: 1,

  }
  return await autoSaveUser(userPayload, req, res, rawResetToken)


})
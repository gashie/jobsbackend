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

  let finduser = await GlobalModel.Find('users', 'userId', userId);
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

  let findbanner = await GlobalModel.Find('banner', 'bannerId', bannerId);
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

  let findjob = await GlobalModel.Find('job_info', 'jobId', jobId);
  //if banner exist
  if (!findjob) {
    CatchHistory({ api_response: `Sorry, job does not exist :${jobId}`, function_name: 'findjob/middleware', date_started: systemDate, sql_action: "UPDATE", event: "Find and create questions", actor: userId }, req)
    return sendResponse(res, 0, 200, "Sorry, job does not exist")

  }
  req.date = systemDate
  req.job = findjob
  return next();
});
exports.findResume = asynHandler(async (req, res, next) => {
  let resumeId = req.body.resumeId;
  let actor = req.user.userInfo

  //check if resume table if file exist

  let objectExist = await GlobalModel.Find('resume', 'resumeId', resumeId);
  //if resumeo exist
  if (!objectExist) {
    CatchHistory({ api_response: `Sorry, job does not exist :${resumeId}`, function_name: 'findResume/middleware', date_started: systemDate, sql_action: "UPDATE", event: "Find and update resume", actor: actor.userId }, req)
    return sendResponse(res, 0, 200, "Sorry, job does not exist")

  }
  req.date = systemDate
  req.resume = objectExist
  return next();
});
exports.findFeed = asynHandler(async (req, res, next) => {
  let feedId = req.body.feedId;
  let actor = req.user.userInfo

  //check if record table if file exist

  let objectExist = await GlobalModel.Find('generated_feeds', 'feedId', feedId);
  //if record exist
  if (!objectExist) {
    CatchHistory({ api_response: `Sorry, record does not exist :${feedId}`, function_name: 'findFeed/middleware', date_started: systemDate, sql_action: "UPDATE", event: "Find and update feed", actor: actor.userId }, req)
    return sendResponse(res, 0, 200, "Sorry, record does not exist")

  }
  req.date = systemDate
  req.genfeeds = objectExist
  return next();
});

exports.findCourse = asynHandler(async (req, res, next) => {
  let courseId = req.body.courseId;
  let actor = req.user.userInfo

  //check if record table if file exist

  let objectExist = await GlobalModel.Find('course', 'courseId', courseId);
  //if record exist
  if (!objectExist) {
    CatchHistory({ api_response: `Sorry, record does not exist :${courseId}`, function_name: 'findFeed/middleware', date_started: systemDate, sql_action: "UPDATE", event: "Find and update feed", actor: actor.userId }, req)
    return sendResponse(res, 0, 200, "Sorry, record does not exist")

  }
  req.date = systemDate
  req.course = objectExist
  return next();
});
exports.findCourseContent = asynHandler(async (req, res, next) => {
  let contentId = req.body.contentId;
  let actor = req.user.userInfo

  //check if record table if file exist

  let objectExist = await GlobalModel.Find('course_content', 'contentId', contentId);
  //if record exist
  if (!objectExist) {
    CatchHistory({ api_response: `Sorry, record does not exist :${contentId}`, function_name: 'findCourseContent/middleware', date_started: systemDate, sql_action: "UPDATE", event: "Find course content and update content", actor: actor.userId }, req)
    return sendResponse(res, 0, 200, "Sorry, record does not exist")

  }
  req.date = systemDate
  req.content = objectExist
  return next();
});
exports.findCoursePartnerships = asynHandler(async (req, res, next) => {
  let partnerId = req.body.partnerId;
  let actor = req.user.userInfo

  //check if record table if file exist

  let objectExist = await GlobalModel.Find('course_partners', 'partnerId', partnerId);
  //if record exist
  if (!objectExist) {
    CatchHistory({ api_response: `Sorry, record does not exist :${partnerId}`, function_name: 'findCoursePartnerships/middleware', date_started: systemDate, sql_action: "UPDATE", event: "Find course partnerships and update partnerships", actor: actor.userId }, req)
    return sendResponse(res, 0, 200, "Sorry, record does not exist")

  }
  req.date = systemDate
  req.partnership = objectExist
  return next();
});

exports.findSettings = asynHandler(async (req, res, next) => {
  let actor = req.user.userInfo
  //check if resume table if file exist

  let objectExist = await GlobalModel.Findall('app_settings');
  //if resumeo exist
  if (objectExist) {
    CatchHistory({ api_response: `Sorry, you can only update the settings`, function_name: 'findSettings/middleware', date_started: systemDate, sql_action: "UPDATE", event: "Find all settings", actor: actor.userId }, req)
    return sendResponse(res, 0, 200, "Sorry, you can only update the settings")

  }
  req.date = systemDate
  return next();
});


exports.findAppSettings = asynHandler(async (req, res, next) => {
  let actor = req.user.userInfo
  //check if resume table if file exist

  let objectExist = await GlobalModel.Findall('app_settings');
  //if resumeo exist
  if (!objectExist) {
    CatchHistory({ api_response: `Sorry, please create settings before updating`, function_name: 'findAppSettings/middleware', date_started: systemDate, sql_action: "UPDATE", event: "Find all settings", actor: actor.userId }, req)
    return sendResponse(res, 0, 200, "Sorry, please create settings before updating")

  }
  req.date = systemDate
  req.app_settings = objectExist
  return next();
});
exports.findFeedBedoreApprove = asynHandler(async (req, res, next) => {
  let actor = req.user.userInfo
  let {feedId} = req.body
  //check if resume table if file exist
  // Define your dynamic query parameters
  const tableName = 'generated_feeds';
  const columnsToSelect = ['feedId', 'status']; // Replace with your desired columns

  // Define an array of conditions (each condition is an object with condition and value)
  // const conditions = [
  //   { condition: 'feedId = ?', value: feedId },
  //   { condition: 'status = ?', value: 'approved' },
  //   // Add more conditions as needed
  // ];
  const conditions = [
    { condition: 'feedId = ?', value: '357a6524-e872-4de8-8f2a-8c40aab94a61' },
    { condition: 'status = ?', value: 'approved' },
    // Add more conditions as needed
  ];
  let objectExist = await GlobalModel.QueryDynamic(tableName,columnsToSelect,conditions);
  //if resumeo exist
  if (objectExist) {
    CatchHistory({ api_response: `Sorry, this feed has already been approved`, function_name: 'findFeedBedoreApprove/middleware', date_started: systemDate, sql_action: "UPDATE", event: "Find feed before approving", actor: actor.userId }, req)
    return sendResponse(res, 0, 200, "Sorry, this feed has already been approved")

  }
  req.date = systemDate
  req.genfeeds = objectExist
  return next();
});
exports.findCourseBedoreApprove = asynHandler(async (req, res, next) => {
  let actor = req.user.userInfo
  let {courseId} = req.body
  //check if resume table if file exist
  // Define your dynamic query parameters
  const tableName = 'course';
  const columnsToSelect = ['courseId', 'courseStatus']; // Replace with your desired columns

  // Define an array of conditions (each condition is an object with condition and value)
  const conditions = [
    { condition: 'courseId = ?', value: courseId },
    { condition: 'courseStatus > ?', value: 'approved' },
    // Add more conditions as needed
  ];

  let objectExist = await GlobalModel.QueryDynamic(tableName,columnsToSelect,conditions);
  //if resumeo exist
  if (objectExist) {
    CatchHistory({ api_response: `Sorry, this record has already been approved`, function_name: 'findCourseBedoreApprove/middleware', date_started: systemDate, sql_action: "UPDATE", event: "Find course before approving", actor: actor.userId }, req)
    return sendResponse(res, 0, 200, "Sorry, this record has already been approved")

  }
  req.date = systemDate
  req.course = objectExist
  return next();
});

exports.findRateCardBedoreApprove = asynHandler(async (req, res, next) => {
  let actor = req.user.userInfo
  let {rateId} = req.body
  //check if resume table if file exist
  // Define your dynamic query parameters
  const tableName = 'rate_card';
  const columnsToSelect = ['rateId', 'rateStatus']; // Replace with your desired columns

  // Define an array of conditions (each condition is an object with condition and value)
  const conditions = [
    { condition: 'rateId = ?', value: rateId },
    { condition: 'rateStatus > ?', value: 'approved' },
    // Add more conditions as needed
  ];

  let objectExist = await GlobalModel.QueryDynamic(tableName,columnsToSelect,conditions);
  //if resumeo exist
  if (objectExist) {
    CatchHistory({ api_response: `Sorry, this record has already been approved`, function_name: 'findRateCardBedoreApprove/middleware', date_started: systemDate, sql_action: "UPDATE", event: "Find rate card before approving", actor: actor.userId }, req)
    return sendResponse(res, 0, 200, "Sorry, this record has already been approved")

  }
  req.date = systemDate
  req.ratecard = objectExist
  return next();
});

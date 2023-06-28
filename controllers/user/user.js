const USERS = require("../../models/User");
const dotenv = require("dotenv");
const asynHandler = require("../../middleware/async");
const { sendResponse } = require("../../helper/utilfunc");
const { CatchHistory } = require("../../helper/global");
dotenv.config({ path: "./config/config.env" });
const systemDate = new Date().toISOString().slice(0, 19).replace("T", " ");

exports.CreateSystemUser = asynHandler(async (req, res, next) => {
  const { user, roleid, status } = req.body;

  let bigData = {
    username:user.SamAccountName,
    email:user.UserPrincipalName,
    fullname:user.Name,
    roleid,
    status,
    createdBy:req.kid.username
  };

  /**
   * check if user exist
   */

  let FindUsername = await USERS.FindMe("username", bigData.username);

  if (FindUsername) {
    CatchHistory({event:'CREATE ADMIN USER',functionName:'CreateSystemUser',response:`Sorry, User already exist`,dateStarted:systemDate,state:0,requestStatus:200,}, req);
   return sendResponse(res,0,200,'Sorry, User already exist')
  }

  let FindEmail = await USERS.FindMe("email", bigData.email);

  if (FindEmail) {
    CatchHistory({event:'CREATE ADMIN USER',functionName:'CreateSystemUser',response:`Sorry, User already exist`,dateStarted:systemDate,state:0,requestStatus:200,}, req);
    return sendResponse(res,0,200,'Sorry, User already exist')
  }

  let result = await USERS.Create(bigData);
  if (result.affectedRows === 1) {
    CatchHistory({event:'CREATE ADMIN USER',functionName:'CreateSystemUser',response:`Record Saved`,dateStarted:systemDate,state:1,requestStatus:200,}, req);
   return sendResponse(res,1,200,'Record Saved')
  } else {
    CatchHistory({event:'CREATE ADMIN USER',functionName:'CreateSystemUser',response:`Error Saving Record`,dateStarted:systemDate,state:0,requestStatus:200,}, req);
   return sendResponse(res,0,200,'Error Saving Record')
  }
});
exports.GetAllUsers = asynHandler(async (req, res, next) => {
    let results = await USERS.all();
    if (results.length == 0) {
      CatchHistory({event:'VIEW ADMIN USER',functionName:'GetAllUsers',response:`No Record Found`,dateStarted:systemDate,state:0,requestStatus:200,}, req);
      return sendResponse(res,0,200,'No Record Found')
    }
    CatchHistory({event:'VIEW ADMIN USER',functionName:'GetAllUsers',response:`Record Found`,dateStarted:systemDate,state:1,requestStatus:200,}, req);

    return sendResponse(res,1,200,'Record Found',results)

  });

exports.DeleteSystemUser = asynHandler(async (req, res, next) => {
    let id = req.body.id;
  
    if (!id) {
      return sendResponse(res,0,200,'Please provide id')
    }
    let result = await USERS.Delete(id);
  
    if (result.affectedRows === 1) {
      return sendResponse(res,1,200,'Record Deleted')
    } else {
      return sendResponse(res,0,200,'Error Removing Record')
    }
  });

exports.UpdateSystemUser = asynHandler(async (req, res, next) => {
    let id = req.body.id;
    const { roleid, status } = req.body;

    let payload = {
      roleid,
      status,
    };
  
    payload.updatedAt = new Date().toISOString().slice(0, 19).replace("T", " ");
    payload.updatedBy = req.kid.username
  
    if (!id) {
      return sendResponse(res,0,200,'Please provide id')
    }
    let result = await USERS.UpdateUser(payload, id);
  
    if (result.affectedRows === 1) {
      CatchHistory({event:'UPDATE ADMIN USER',functionName:'UpdateSystemUser',response:`Record Updated`,dateStarted:systemDate,state:1,requestStatus:200,}, req);
      return sendResponse(res,1,200,'Record Updated')

    } else {
      CatchHistory({event:'UPDATE ADMIN USER',functionName:'UpdateSystemUser',response:`Error Updating Record`,dateStarted:systemDate,state:0,requestStatus:200,}, req);
      return sendResponse(res,0,200,'Error Updating Record')
    }

  })
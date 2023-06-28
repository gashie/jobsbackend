const { CatchHistory } = require("../../helper/global");
const { sendResponse } = require("../../helper/utilfunc");
const asynHandler = require("../../middleware/async");
const Model = require("../../models/Role");
const RoleMenuModel = require("../../models/RoleMenu");
const systemDate = new Date().toISOString().slice(0, 19).replace("T", " ");

exports.SetupSystemRole = asynHandler(async (req, res, next) => {
  let title = req.body.title;
  let payload = req.body;
  payload.createdBy = req.kid.username
  if (!title) {
    CatchHistory({event:'SETUP SYSTEM ROLE',functionName:'SetupSystemRole',response:`Please enter title for role`,dateStarted:systemDate,state:0,requestStatus:200,}, req);
   return sendResponse(res,0,200,'Please enter title for role')
  }

  //find client
  let role = await Model.FindRole(title);

  if (role) {
    CatchHistory({event:'SETUP SYSTEM ROLE',functionName:'SetupSystemRole',response:`Record Already exist`,dateStarted:systemDate,state:0,requestStatus:200,}, req);
    return sendResponse(res,0,200,'Record Already exist')
  }

  let result = await Model.create(payload);
  if (result.affectedRows === 1) {
    CatchHistory({event:'SETUP SYSTEM ROLE',functionName:'SetupSystemRole',response:`Record Created Successfully`,dateStarted:systemDate,state:1,requestStatus:200,}, req);
   return sendResponse(res,1,200,'Record Created Successfully')
  } else {
    CatchHistory({event:'SETUP SYSTEM ROLE',functionName:'SetupSystemRole',response:`Error Saving Record`,dateStarted:systemDate,state:0,requestStatus:200,}, req);
   return sendResponse(res,0,200,'Error Saving Record')
  }
});

exports.AllRoles = asynHandler(async (req, res, next) => {
  let dbresult = await Model.allshow();
  if (dbresult.length == 0) {
    CatchHistory({event:'VIEW SYSTEM ROLE',functionName:'AllRoles',response:`No record found`,dateStarted:systemDate,state:0,requestStatus:200,}, req);
   return sendResponse(res,0,200,'No record found')
  }
  CatchHistory({event:'VIEW SYSTEM ROLE',functionName:'AllRoles',response:`${dbresult.length} found`,dateStarted:systemDate,state:1,requestStatus:200,}, req);
 return sendResponse(res,1,200,'Record found',dbresult)
});

exports.SingleRole = asynHandler(async (req, res, next) => {
  let id = req.body.id;
  let dbresult = await Model.FindRoleID(id);
  if (!dbresult) {
    CatchHistory({event:'SEARCH SYSTEM ROLE',functionName:'SingleRole',response:`No record found`,dateStarted:systemDate,state:0,requestStatus:200,}, req);
    return sendResponse(res,0,200,'No record found')

  }
  CatchHistory({event:'SEARCH SYSTEM ROLE',functionName:'SingleRole',response:`Record found`,dateStarted:systemDate,state:1,requestStatus:200,}, req);
 return sendResponse(res,1,200,'Record found')

});
exports.RemoveRole = asynHandler(async (req, res, next) => {
  let id = req.body.id;

  const newData = {
    status: 0,
    updatedBy : req.kid.username,
    deletedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
  };
  if (!id) {
    CatchHistory({event:'REMOVE SYSTEM ROLE',functionName:'RemoveRole',response:`Please provide id`,dateStarted:systemDate,state:0,requestStatus:200,}, req);
  return sendResponse(res,0,200,'Please provide id')
  }
  let result = await Model.update(newData, id);

  if (result.affectedRows === 1) {
    CatchHistory({event:'REMOVE SYSTEM ROLE',functionName:'RemoveRole',response:`Record Deleted`,dateStarted:systemDate,state:1,requestStatus:200,}, req);
   return sendResponse(res,1,200,'Record Deleted')
  } else {
    CatchHistory({event:'REMOVE SYSTEM ROLE',functionName:'RemoveRole',response:`Error Removing Record`,dateStarted:systemDate,state:0,requestStatus:200,}, req);
   return sendResponse(res,0,200,'Error Removing Record')
  }
});

exports.UpdateRole = asynHandler(async (req, res, next) => {
  let id = req.body.id;
  let payload = req.body;
  payload.updatedBy = req.kid.username
  payload.updatedAt = new Date().toISOString().slice(0, 19).replace("T", " ");

  if (!id) {
    CatchHistory({event:'UPDATE SYSTEM ROLE',functionName:'UpdateRole',response:`Please provide id`,dateStarted:systemDate,state:0,requestStatus:200,}, req);
   return sendResponse(res,0,200,'Please provide id')
  }
  let result = await Model.update(payload, id);

  if (result.affectedRows === 1) {
    CatchHistory({event:'UPDATE SYSTEM ROLE',functionName:'UpdateRole',response:`Record Updated`,dateStarted:systemDate,state:1,requestStatus:200,}, req);
   return sendResponse(res,1,200,'Record Updated')
  } else {
    CatchHistory({event:'UPDATE SYSTEM ROLE',functionName:'UpdateRole',response:`Error Updating Record`,dateStarted:systemDate,state:0,requestStatus:200,}, req);
  return sendResponse(res,0,200,'Error Updating Record')
  }
});

exports.DeleteSystemRole = asynHandler(async (req, res, next) => {
  let id = req.body.id;

  if (!id) {
    CatchHistory({event:'DELETE SYSTEM ROLE',functionName:'DeleteSystemRole',response:`Please provide id`,dateStarted:systemDate,state:0,requestStatus:200,}, req);
   return sendResponse(res,0,200,'Please provide id')
  }

  let menus = await RoleMenuModel.rolemenusnodistinctshowall(id);
  if (menus.length > 0) {
    CatchHistory({event:'DELETE SYSTEM ROLE',functionName:'DeleteSystemRole',response:`Sorry, this role has one or more modules assigned to it`,dateStarted:systemDate,state:0,requestStatus:200,}, req);
   return sendResponse(res,0,200,'Sorry, this role has one or more modules assigned to it')
  }
  let result = await Model.Delete(id);

  if (result.affectedRows === 1) {
    CatchHistory({event:'DELETE SYSTEM ROLE',functionName:'DeleteSystemRole',response:`Record Deleted`,dateStarted:systemDate,state:1,requestStatus:200,}, req);
    return sendResponse(res,1,200,'Record Deleted')
  } else {
    CatchHistory({event:'DELETE SYSTEM ROLE',functionName:'DeleteSystemRole',response:`Error Removing Record`,dateStarted:systemDate,state:0,requestStatus:200,}, req);
    return sendResponse(res,0,200,'Error Removing Record')
  }
});
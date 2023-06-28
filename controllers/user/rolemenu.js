const asynHandler = require("../../middleware/async");
const Model = require("../../models/RoleMenu");
const RoleModel = require("../../models/Role");
const MenuModel = require("../../models//Menu");
const { CatchHistory,sendResponse } = require("../../helper/utilfunc");
const systemDate = new Date().toISOString().slice(0, 19).replace("T", " ");

exports.SetupRoleMenu = asynHandler(async (req, res, next) => {
 
  let menuid = req.body.menuid;
  let roleid = req.body.roleid;
  let payload = req.body;
  if (!menuid && !roleid) {
    CatchHistory({event:'SETUP MODULES',functionName:'SetupRoleMenu',response:`Please select role and menu`,dateStarted:systemDate,state:0,requestStatus:200,}, req);
    return sendResponse(res,0,200,'Please select role and menu')
  }

  //find rolemenu
  let role = await Model.FindRoleMenu(roleid, menuid);

  if (role && role.deletedAt === null) {
    CatchHistory({event:'SETUP MODULES',functionName:'SetupRoleMenu',response:`Record Already exist`,dateStarted:systemDate,state:0,requestStatus:200,}, req);
   return sendResponse(res,0,200,'Record Already exist')
  }

  //  if deleted just update the rolemenu
  if (role && role.deletedAt !== null) {
    payload.updatedAt = new Date().toISOString().slice(0, 19).replace("T", " ");
    payload.deletedAt = null
    payload.status = 1
    let result = await Model.update(payload, role.id);
   if (result.affectedRows === 1) {
    CatchHistory({event:'SETUP MODULES',functionName:'SetupRoleMenu/update',response:`Record created`,dateStarted:systemDate,state:1,requestStatus:200,}, req);
    return sendResponse(res,1,200,'Record created')
    } else {
      CatchHistory({event:'SETUP MODULES',functionName:'SetupRoleMenu/update',response:`Error Saving Record`,dateStarted:systemDate,state:0,requestStatus:200,}, req);
    return sendResponse(res,0,200,'Error Saving Record')
    }
  }else{
    //  if the record does not exist , create new one
    let result = await Model.create(payload);
    if (result.affectedRows === 1) {
      CatchHistory({event:'SETUP MODULES',functionName:'SetupRoleMenu/create',response:`Record created`,dateStarted:systemDate,state:1,requestStatus:200,}, req);
     return sendResponse(res,1,200,'Record created')
    } else {
      CatchHistory({event:'SETUP MODULES',functionName:'SetupRoleMenu/create',response:`Error Saving Record`,dateStarted:systemDate,state:0,requestStatus:200,}, req);
    return sendResponse(res,0,200,'Error Saving Record')
    }
  }

 


});

exports.AllRoleMenu = asynHandler(async (req, res, next) => {

  let dbresult = await Model.allshow();
  if (dbresult.length == 0) {
    CatchHistory({event:'VIEW MODULES',functionName:'AllRoleMenu',response:`No Record Found`,dateStarted:systemDate,state:0,requestStatus:200,}, req);
   return sendResponse(res,0,200,'No Record Found')
  }

  let bigData = [];
  for (const iterator of dbresult) {
    let getrole = await RoleModel.FindRoleID(iterator.roleid);
    let menus = await Model.rolemenusnodistinctshowall(iterator.roleid);
    let role = {
      id: getrole.id,
      title: getrole.title,
      menus,
    };
    bigData.push(role);
  }
 CatchHistory({event:'VIEW MODULES',functionName:'AllRoleMenu',response:`${bigData.length} Record Found`,dateStarted:systemDate,state:0,requestStatus:200,}, req);
 return sendResponse(res,1,200,'Record Found',bigData)

});

exports.SingleRoleMenu = asynHandler(async (req, res, next) => {
  let id = req.body.id;
  let dbresult = await RoleModel.FindRoleID(id);
  if (!dbresult) {
    CatchHistory({event:'VIEW SINGLE MODULE',functionName:'AllRoleMenu',response:`No Record Found`,dateStarted:systemDate,state:0,requestStatus:200,}, req);
    return sendResponse(res,0,200,'No Record Found')

  }

  let menus = await Model.rolemenusnodistinctshowall(id);
  let role = {
    id: dbresult.id,
    title: dbresult.title,
    menus,
  };
  CatchHistory({event:'VIEW SINGLE MODULE',functionName:'SingleRoleMenu',response:`Record Found`,dateStarted:systemDate,state:1,requestStatus:200,}, req);
 return sendResponse(res,1,200,'Record Found',role)

});
exports.RemoveRoleMenu = asynHandler(async (req, res, next) => {
  let id = req.body.id;

  const newData = {
    status: 0,
    deletedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
  };
  if (!id) {
    return sendResponse(res,0,200,'Please provide id')
}
  let result = await Model.update(newData, id);

  if (result.affectedRows === 1) {
    return sendResponse(res,1,200,'Record Deleted')
  } else {
    return sendResponse(res,0,200,'Error Removing Record')

  }
});

exports.UpdateRoleMenu = asynHandler(async (req, res, next) => {
  let id = req.body.id;
  let payload = req.body;

  payload.updatedAt = new Date().toISOString().slice(0, 19).replace("T", " ");

  if (!id) {
    CatchHistory({event:'UPDATE MODULE',functionName:'UpdateRoleMenu',response:`Please provide id`,dateStarted:systemDate,state:0,requestStatus:200,}, req);
   return sendResponse(res,0,200,'Please provide id')

  }
  let result = await Model.update(payload, id);

  if (result.affectedRows === 1) {
    CatchHistory({event:'UPDATE MODULE',functionName:'UpdateRoleMenu',response:`Record Deleted`,dateStarted:systemDate,state:1,requestStatus:200,}, req);
   return sendResponse(res,1,200,'Record Updated')
  } else {
    CatchHistory({event:'UPDATE MODULE',functionName:'UpdateRoleMenu',response:`Error Updating Record`,dateStarted:systemDate,state:0,requestStatus:200,}, req);
  return sendResponse(res,0,200,'Error Updating Record')
  }
});
exports.AllMenus = asynHandler(async (req, res, next) => {
  let dbresult = await MenuModel.all();
  if (dbresult.length == 0) {
    CatchHistory({event:'VIEW MENUS',functionName:'AllMenus',response:`No Record Found`,dateStarted:systemDate,state:0,requestStatus:200,}, req);
    return sendResponse(res,0,200,'No Record Found')
}
CatchHistory({event:'VIEW MENUS',functionName:'AllMenus',response:`${dbresult.length} Record Found`,dateStarted:systemDate,state:1,requestStatus:200,}, req);
return sendResponse(res,1,200,'Record Found',dbresult)
});

exports.DeleteRoleMenu = asynHandler(async (req, res, next) => {
  let id = req.body.id;

  if (!id) {
    CatchHistory({event:'DELETE MODULE',functionName:'DeleteRoleMenu',response:`Please provide id`,dateStarted:systemDate,state:0,requestStatus:200,}, req);
   return sendResponse(res,0,200,'Please provide id')
  }
  let result = await Model.Delete(id);

  if (result.affectedRows === 1) {
    CatchHistory({event:'DELETE MODULE',functionName:'DeleteRoleMenu',response:`Record Deleted`,dateStarted:systemDate,state:1,requestStatus:200,}, req);
    return sendResponse(res,1,200,'Record Deleted')
  } else {
    CatchHistory({event:'DELETE MODULE',functionName:'DeleteRoleMenu',response:`Error Removing Record`,dateStarted:systemDate,state:0,requestStatus:200,}, req);
   return sendResponse(res,0,200,'Error Removing Record')
  }
});
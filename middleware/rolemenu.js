const asynHandler = require("./async");
const Model = require("../models/RoleMenu");
const UserMenu = require("../models/UserMenu");
const MenuModel = require("../models/Menu");
const { sendResponse } = require("../helper/utilfunc");
exports.checkBaseId = asynHandler(async (req, res, next) => {
  let menuid = req.body.menuid;
  let roleid = req.body.roleid;
  if (!menuid) {
    return sendResponse(res, 0, 200, "Please select role and menu")
  }
  //check if menu is a child and no parent exist

  let getbase = await MenuModel.FindMenuID(menuid);
  //if it parent, ignore and proceed
  if (getbase.isBaseId == 0) {
    console.log(getbase);
    return next();
  }

  //if child but no parent exist in the rolemenu insert parent

  //retrive baseID for the menu

  //check if parent exist
  //find rolemenu
  let role = await Model.FindRoleMenu(roleid, getbase.originatorBaseId);

  if (role) {
    return next();
  }

  let parentData = {
    menuid: getbase.originatorBaseId,
    roleid: roleid,
    status: 1,
  };
  let result = await Model.create(parentData);
  if (result.affectedRows === 1) {
    next();
  } else {
    return sendResponse(res, 0, 200, "Error Saving Parent Record")
  }
});
exports.checkOriginatorBaseId = asynHandler(async (req, res, next) => {
  let title = req.body.title;
  let id = req.body.id;
  let isBaseId = req.body.isBaseId;
  let url = req.body.url;

   if (isBaseId && id) {
    let menu = await MenuModel.FindMenuID(id);
   req.orign = menu.originatorBaseId;
   return next();
   }

   next();
});

exports.checkUserMenuBaseId = asynHandler(async (req, res, next) => {
  let menuid = req.body.menuid;
  let userID = req.body.userID;
  //check if menu is a child and no parent exist

  let getbase = await MenuModel.FindMenuID(menuid);
  //if it parent, ignore and proceed
  if (getbase.isBaseId == 0) {
    console.log(getbase);
    return next();
  }

  //if child but no parent exist in the rolemenu insert parent

  //retrive baseID for the menu

  //check if parent exist
  //find usermenu
  let userresult = await UserMenu.FindUserMenu(
    userID,
    getbase.originatorBaseId
  );

  if (userresult) {
    return next();
  }

  let parentData = {
    menuid: getbase.originatorBaseId,
    userID: userID,
    status: 1,
    accessType: 1,
  };
  let result = await UserMenu.create(parentData);
  if (result.affectedRows === 1) {
    next();
  } else {
    return sendResponse(res, 0, 200, "Error Saving Parent Record")
  }
});

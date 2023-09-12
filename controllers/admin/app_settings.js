const path = require("path");
const fs = require('fs').promises;
const asynHandler = require("../../middleware/async");
const GlobalModel = require("../../models/Global");
const { sendResponse, CatchHistory, removeFile } = require("../../helper/utilfunc");


exports.CreateSystemSettings = asynHandler(async (req, res, next) => {
    let payload = req.body;
    let actor = req.user.userInfo
    const appLogo = req.files.appLogo;
    if (!appLogo || !appLogo.mimetype.startsWith("image")) {
        return sendResponse(res, 0, 200, "Please make sure to upload an image", [])

    }

    //change filename
    console.log(appLogo);
    appLogo.name = `systemlogo_md_${appLogo.md5}_${path.parse(appLogo.name).ext}`;
    appLogo.mv(`./uploads/system/logos/${appLogo.name}`, async (err) => {
        if (err) {
            console.log(err);
            return sendResponse(res, 0, 200, "Problem with file upload", [])
        }
    });
    //   payload.createdById = actor.userId
    payload.appLogo = appLogo.name

    let results = await GlobalModel.Create('app_settings', payload);
    if (results.affectedRows === 1) {
        CatchHistory({ event: `user with id: ${actor.userId} added new logo `, functionName: 'CreateSystemSettings', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)

        return sendResponse(res, 1, 200, "Record saved", [])
    } else {
        CatchHistory({ event: `Sorry, error saving record for logo  with name :${payload.jobCategoryName}`, functionName: 'CreateSystemSettings', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)

        return sendResponse(res, 0, 200, "Sorry, error saving record", [])
    }

})

exports.UpdateSystemSettings = asynHandler(async (req, res, next) => {
    const { patch, bannerTitle,bannerStart,bannerEnd, deleterecord, restore, id } = req.body;
    let actor = req.user.userInfo
    const appLogo = req.files.appLogo;
    let oldsettings = req.app_settings
    if (patch && appLogo && !appLogo.mimetype.startsWith("image")) {
      return sendResponse(res, 0, 200, "Please make sure to upload an image", [])
  
    }
    if (patch && appLogo && appLogo.mimetype.startsWith("image")) {
  
      //change filename
      console.log(appLogo);
     let remove =  removeFile('./uploads/system/logos/',oldsettings.appLogo)
      appLogo.name = `systemlogo_md_${appLogo.md5}_${path.parse(appLogo.name).ext}`;
      appLogo.mv(`./uploads/system/logos/${appLogo.name}`, async (err) => {
        if (err) {
          console.log(err);
          return sendResponse(res, 0, 200, "Problem with file upload", [])
        }
      });
  
    }
  
    let deletePayload = {
    //   updatedAt: req.date,
    //   deletedById: actor.userId,
    //   deletedAt: !restore ? req.date : null,
    };
    let patchUserPayload = {
    //   updatedAt: req.date,
    //   updatedById: actor.userId,
      appLogo: appLogo.name,
    };
  
    let switchActionPayload = patch ? patchUserPayload : deletePayload
  
    let result = await GlobalModel.Update('app_settings', switchActionPayload, 'id', id);
  
    if (result.affectedRows === 1) {
      CatchHistory({ event: 'Update App Settings', functionName: 'UpdateSystemSettings', response: `App Settings record with id ${id} was updated by ${actor.userId}`, dateStarted: req.date, state: 1, requestStatus: 200, actor: actor.userId }, req);
      return sendResponse(res, 1, 200, 'Record Updated')
  
    } else {
      CatchHistory({ event: 'Update App Settings', functionName: 'UpdateSystemSettings', response: `Error Updating Record with id ${id}`, dateStarted: req.date, state: 0, requestStatus: 200, actor: actor.userId }, req);
      return sendResponse(res, 0, 200, 'Error Updating Record')
    }
  
})
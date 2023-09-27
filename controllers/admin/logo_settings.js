const path = require("path");
const fs = require('fs').promises;
const asynHandler = require("../../middleware/async");
const GlobalModel = require("../../models/Global");
const { sendResponse, CatchHistory, removeFile } = require("../../helper/utilfunc");

exports.UpdateLogoSettings = asynHandler(async (req, res, next) => {
    const { companyId } = req.body;
    let actor = req.user.userInfo
    const appLogo = req.files.appLogo;
    if (appLogo && !appLogo.mimetype.startsWith("image")) {
        return sendResponse(res, 0, 200, "Please make sure to upload an image", [])

    }
    if (appLogo && appLogo.mimetype.startsWith("image")) {

        //change filename
        // removeFile('./uploads/images/logos/', oldsettings.appLogo)
        appLogo.name = `logo_id_${companyId}_md_${appLogo.md5}_${path.parse(appLogo.name).ext}`;
        appLogo.mv(`./uploads/image/logos/${appLogo.name}`, async (err) => {
            if (err) {
                console.log(err);
                return sendResponse(res, 0, 200, "Problem with file upload", [])
            }
        });

    }


    let patchUserPayload = {
        updatedAt: req.date,
        updatedById: actor.userId,
        companyLogo: appLogo.name,
    };

    let result = await GlobalModel.Update('company', patchUserPayload, 'companyId', companyId);

    if (result.affectedRows === 1) {
        CatchHistory({ event: 'Update company logo', functionName: 'UpdateSystemSettings', response: `company logo record with id ${companyId} was updated by ${actor.userId}`, dateStarted: req.date, state: 1, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 1, 200, 'Record Updated')

    } else {
        CatchHistory({ event: 'Update company logo', functionName: 'UpdateSystemSettings', response: `Error Updating Record with id ${companyId}`, dateStarted: req.date, state: 0, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 0, 200, 'Error Updating Record')
    }

})
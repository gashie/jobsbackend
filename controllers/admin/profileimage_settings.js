const path = require("path");
const fs = require('fs').promises;
const asynHandler = require("../../middleware/async");
const GlobalModel = require("../../models/Global");
const { sendResponse, CatchHistory, removeFile } = require("../../helper/utilfunc");

exports.UpdateProfileImageSettings = asynHandler(async (req, res, next) => {
    let actor = req.user.userInfo
    const profileImage = req.files.profileImage;
    if (profileImage && !profileImage.mimetype.startsWith("image")) {
        return sendResponse(res, 0, 200, "Please make sure to upload an image", [])

    }
    if (profileImage && profileImage.mimetype.startsWith("image")) {

        //change filename
        // removeFile('./uploads/image/profile/', oldsettings.profileImage)
        profileImage.name = `profile_id_${actor.userId}_md_${profileImage.md5}_${path.parse(profileImage.name).ext}`;
        profileImage.mv(`./uploads/image/profile/${profileImage.name}`, async (err) => {
            if (err) {
                console.log(err);
                return sendResponse(res, 0, 200, "Problem with file upload", [])
            }
        });

    }


    let patchUserPayload = {
        updatedAt: req.date,
        updatedById: actor.userId,
        profileImage: profileImage.name,
    };

    let result = await GlobalModel.Update('users', patchUserPayload, 'userId', actor.userId);

    if (result.affectedRows === 1) {
        CatchHistory({ event: 'Update user profile', functionName: 'UpdateProfileImageSettings', response: `user profile record with id ${actor.userId} was updated by ${actor.userId}`, dateStarted: req.date, state: 1, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 1, 200, 'Record Updated')

    } else {
        CatchHistory({ event: 'Update user profile', functionName: 'UpdateProfileImageSettings', response: `Error Updating Record with id ${actor.userId}`, dateStarted: req.date, state: 0, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 0, 200, 'Error Updating Record')
    }

})
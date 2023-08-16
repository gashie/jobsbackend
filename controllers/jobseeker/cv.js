const path = require("path");
const fs = require('fs').promises;
const uuidV4 = require('uuid');
const asynHandler = require("../../middleware/async");
const GlobalModel = require("../../models/Global");
const { sendResponse, CatchHistory, removeFile } = require("../../helper/utilfunc");

exports.ViewMyCv = asynHandler(async (req, res, next) => {
    let { viewAction } = req.body
    let actor = req.user.userInfo
    let results = await GlobalModel.ViewWithActionById('resume', viewAction, 'userId', actor.userId);
    if (results.length == 0) {
        CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} resume`, functionName: 'ViewMyCv', response: `No Record Found For Resume`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 0, 200, 'No Record Found')
    }
    CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} resume`, functionName: 'ViewMyCv', response: `Record Found, resume contains ${results.length} record's`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);

    return sendResponse(res, 1, 200, 'Record Found', results[0])

});



exports.CreateCv = asynHandler(async (req, res, next) => {
    let payload = req.body;
    let actor = req.user.userInfo
    let resumeId = uuidV4.v4()
    const myCv = req.files.myCv;
    let searchResume = await GlobalModel.ViewWithActionById('resume', '', 'userId', actor.userId);
    if (searchResume.length == 0) {

        if (!myCv.mimetype.startsWith("application/pdf")) {
            return sendResponse(res, 0, 200, "Please make sure to upload a pdf file", [])

        }

        //change filename
        myCv.name = `resumeId_id_${resumeId}_md_${myCv.md5}_${path.parse(myCv.name).ext}`;
        myCv.mv(`./uploads/jobseeker/resume/${myCv.name}`, async (err) => {
            if (err) {
                console.log(err);
                return sendResponse(res, 0, 200, "Problem with file upload", [])
            }
        });
        payload.resumeId = resumeId
        payload.userId = actor.userId
        payload.fileName = myCv.name

        let results = await GlobalModel.Create('resume', payload);
        if (results.affectedRows === 1) {
            CatchHistory({ event: `user with id: ${actor.userId} added new resume `, functionName: 'CreateCv', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)

            return sendResponse(res, 1, 200, "Record saved", [])
        } else {
            CatchHistory({ event: `Sorry, error saving record for resume  with name :${myCv.name}`, functionName: 'CreateCv', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)

            return sendResponse(res, 0, 200, "Sorry, error saving record", [])
        }
    } else {
        return sendResponse(res, 0, 200, "Sorry, try updating. another record already exist", [])

    }

})

exports.UpdateCv = asynHandler(async (req, res, next) => {
    const { patch, restore, resumeId } = req.body;
    let actor = req.user.userInfo
    const myCv = req.files.myCv;
    let olbanner = req.resume
    if (patch && myCv && !myCv.mimetype.startsWith("application/pdf")) {
        return sendResponse(res, 0, 200, "Please make sure to upload a pdf file", [])

    }
    if (patch && myCv && myCv.mimetype.startsWith("application/pdf")) {

        //change filename

       removeFile('./uploads/jobseeker/resume/', olbanner?.fileName)
        myCv.name = `resumeId_id_${resumeId}_md_${myCv.md5}_${path.parse(myCv.name).ext}`;
        myCv.mv(`./uploads/jobseeker/resume/${myCv.name}`, async (err) => {
            if (err) {
                console.log(err);
                return sendResponse(res, 0, 200, "Problem with file upload", [])
            }
        });

    }

    let deletePayload = {
        updatedAt: req.date,
        deletedAt: !restore ? req.date : null,
    };
    let patchUserPayload = {
        updatedAt: req.date,
        fileName: myCv.name,
    };

    let switchActionPayload = patch ? patchUserPayload : deletePayload

    let result = await GlobalModel.Update('resume', switchActionPayload, 'resumeId', resumeId);

    if (result.affectedRows === 1) {
        CatchHistory({ event: 'Update Resume', functionName: 'UpdateCv', response: `Resume record with id ${resumeId} was updated by ${actor.userId}`, dateStarted: req.date, state: 1, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 1, 200, 'Record Updated')

    } else {
        CatchHistory({ event: 'Update Resume', functionName: 'UpdateCv', response: `Error Updating Record with id ${resumeId}`, dateStarted: req.date, state: 0, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 0, 200, 'Error Updating Record')
    }

})
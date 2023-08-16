const asynHandler = require("../../middleware/async");
const uuidV4 = require('uuid');
const GlobalModel = require("../../models/Global");
const { sendResponse, CatchHistory } = require("../../helper/utilfunc");



exports.ViewMyJobAlert = asynHandler(async (req, res, next) => {
    let { viewAction } = req.body
    let actor = req.user.userInfo
    let results = await GlobalModel.ViewWithActionById('job_alert', viewAction, 'userId', actor.userId);
    if (results.length == 0) {
        CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} job_alert`, functionName: 'ViewMyJobAlert', response: `No Record Found For job alert`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 0, 200, 'No Record Found')
    }
    CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} job_alert`, functionName: 'ViewMyJobAlert', response: `Record Found, job alert contains ${results.length} record's`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);

    return sendResponse(res, 1, 200, 'Record Found', results)

});

exports.CreateJobAlert = asynHandler(async (req, res, next) => {
    let payload = req.body;
    let actor = req.user.userInfo
    let alertId = uuidV4.v4();
    payload.userId = actor.userId
    payload.alertId = alertId;
    let results = await GlobalModel.Create('job_alert', payload);
    if (results.affectedRows === 1) {
        CatchHistory({ event: `user with id: ${actor.userId} added new job_alert `, functionName: 'CreateJobAlert', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)

        return sendResponse(res, 1, 200, "Record saved", [])
    } else {
        CatchHistory({ event: `Sorry, error saving record for user  with id :${actor.userId}`, functionName: 'CreateJobAlert', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)

        return sendResponse(res, 0, 200, "Sorry, error saving record", [])
    }

})

exports.UpdateJobAlert = asynHandler(async (req, res, next) => {
    const { patch, patchData, deleterecord, restore, alertId } = req.body;
    let actor = req.user.userInfo

    let deleteUserPayload = {
        updatedAt: req.date,
        deletedAt: !restore ? req.date : null,
    };
    let patchUserPayload = {
        updatedAt: req.date,
        ...patchData
    };

    let switchActionPayload = patch ? patchUserPayload : deleteUserPayload

    let result = await GlobalModel.Update('job_alert', switchActionPayload, 'alertId', alertId);

    if (result.affectedRows === 1) {
        CatchHistory({ event: `Job alert updated by user with id ${actor.userId}`, functionName: 'UpdateJobAlert', response: `Record Updated`, dateStarted: req.date, state: 1, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 1, 200, 'Record Updated')

    } else {
        CatchHistory({ event: `Sorry, error updating record for user  with id :${actor.userId}`, functionName: 'UpdateJobAlert', response: `Error Updating Record`, dateStarted: req.date, state: 0, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 0, 200, 'Error Updating Record')
    }

})
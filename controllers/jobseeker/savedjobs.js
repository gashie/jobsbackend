const asynHandler = require("../../middleware/async");
const uuidV4 = require('uuid');
const GlobalModel = require("../../models/Global");
const SavedJobsModel = require("../../models/SavedJobs");
const { sendResponse, CatchHistory } = require("../../helper/utilfunc");



exports.ViewMySavedJobs = asynHandler(async (req, res, next) => {
    let actor = req.user.userInfo
    let results = await SavedJobsModel.FindMySavedJobs(actor.userId);
    if (results.length == 0) {
        CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} saved_jobs`, functionName: 'ViewMySavedJobs', response: `No Record Found For job alert`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 0, 200, 'No Record Found')
    }
    CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} saved_jobs`, functionName: 'ViewMySavedJobs', response: `Record Found, job alert contains ${results.length} record's`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);

    return sendResponse(res, 1, 200, 'Record Found', results)

});

exports.SaveJob = asynHandler(async (req, res, next) => {
    let payload = req.body;
    let actor = req.user.userInfo
    payload.userId = actor.userId
    let results = await GlobalModel.Create('saved_jobs', payload);
    if (results.affectedRows === 1) {
        CatchHistory({ event: `user with id: ${actor.userId} added new saved_jobs `, functionName: 'SaveJob', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)

        return sendResponse(res, 1, 200, "Record saved", [])
    } else {
        CatchHistory({ event: `Sorry, error saving record for user  with id :${actor.userId}`, functionName: 'SaveJob', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)

        return sendResponse(res, 0, 200, "Sorry, error saving record", [])
    }

})

exports.UpdateSavedJob = asynHandler(async (req, res, next) => {
    const { patch, patchData, deleterecord, restore, savedJobsId } = req.body;
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

    let result = await GlobalModel.Update('saved_jobs', switchActionPayload, 'savedJobsId', savedJobsId);
      
    if (result.affectedRows === 1) {
        CatchHistory({ event: `Saved jobs updated by user with id ${actor.userId}`, functionName: 'UpdateSavedJob', response: `Record Updated`, dateStarted: req.date, state: 1, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 1, 200, 'Record Updated')

    } else {
        CatchHistory({ event: `Sorry, error updating record for user  with id :${actor.userId}`, functionName: 'UpdateSavedJob', response: `Error Updating Record`, dateStarted: req.date, state: 0, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 0, 200, 'Error Updating Record')
    }

})
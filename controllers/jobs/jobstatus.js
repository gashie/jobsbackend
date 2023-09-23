const asynHandler = require("../../middleware/async");
const GlobalModel = require("../../models/Global");
const { sendResponse, CatchHistory } = require("../../helper/utilfunc");

exports.ViewJobStatus = asynHandler(async (req, res, next) => {
    let { viewAction } = req.body
    let actor = req.user.userInfo

    let results = await GlobalModel.ViewWithAction('job_status', viewAction);
    if (results.length == 0) {
        CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} job_status`, functionName: 'ViewJobStatus', response: `No Record Found For Job Status`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 0, 200, 'No Record Found')
    }
    CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} job_status`, functionName: 'ViewJobStatus', response: `Record Found, Job Status contains ${results.length} record's`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);

    return sendResponse(res, 1, 200, 'Record Found', results)

});



exports.CreateJobStatus = asynHandler(async (req, res, next) => {
    let payload = req.body;
    let actor = req.user.userInfo
    payload.createdById = actor.userId
    let results = await GlobalModel.Create('job_status', payload);
    if (results.affectedRows === 1) {
        CatchHistory({ event: `user with id: ${actor.userId} added new job status `, functionName: 'CreateJobStatus', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)

        return sendResponse(res, 1, 200, "Record saved", [])
    } else {
        CatchHistory({ event: `Sorry, error saving record for job status  with name :${payload?.jobStatusTitle}`, functionName: 'CreateJobStatus', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)

        return sendResponse(res, 0, 200, "Sorry, error saving record", [])
    }

})

exports.UpdateJobStatus = asynHandler(async (req, res, next) => {
    const { patch, patchData, deleterecord, restore, jobStatusId } = req.body;
    let actor = req.user.userInfo

    let deletePayload = {
        updatedAt: req.date,
        deletedById: actor.userId,
        deletedAt: !restore ? req.date : null,
    };
    let patchUserPayload = {
        updatedAt: req.date,
        updatedById: actor.userId,
        jobStatusTitle: patchData.jobStatusTitle,
    };

    let switchActionPayload = patch ? patchUserPayload : deletePayload

    let result = await GlobalModel.Update('job_status', switchActionPayload, 'jobStatusId', jobStatusId);

    if (result.affectedRows === 1) {
        CatchHistory({ event: 'Update Job Status', functionName: 'UpdateJobStatus', response: `Job Status record with id ${jobStatusId} was updated by ${actor.userId}`, dateStarted: req.date, state: 1, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 1, 200, 'Record Updated')

    } else {
        CatchHistory({ event: 'Update Job Status', functionName: 'UpdateJobStatus', response: `Error Updating Record with id ${jobStatusId}`, dateStarted: req.date, state: 0, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 0, 200, 'Error Updating Record')
    }

})
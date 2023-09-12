const asynHandler = require("../../middleware/async");
const GlobalModel = require("../../models/Global");
const uuidV4 = require('uuid');
const { sendResponse, CatchHistory } = require("../../helper/utilfunc");

exports.ViewFeeds = asynHandler(async (req, res, next) => {
    let { viewAction } = req.body
    let actor = req.user.userInfo

    let results = await GlobalModel.ViewWithAction('system_feed', viewAction);
    if (results.length == 0) {
        CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} system_feed`, functionName: 'ViewFeeds', response: `No Record Found For system_feed`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 0, 200, 'No Record Found')
    }
    CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} system_feed`, functionName: 'ViewFeeds', response: `Record Found, system_feed contains ${results.length} record's`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 1, 200, 'Record Found', results)

});



exports.CreateFeed = asynHandler(async (req, res, next) => {
    let payload = req.body;
    let actor = req.user.userInfo
    payload.createdById = actor.userId
    payload.feedId = uuidV4.v4();
    let results = await GlobalModel.Create('system_feed', payload);
    if (results.affectedRows === 1) {
        CatchHistory({ event: `user with id: ${actor.userId} added new system_feed `, functionName: 'CreateFeed', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)

        return sendResponse(res, 1, 200, "Record saved", [])
    } else {
        CatchHistory({ event: `Sorry, error saving record for system_feed  with name :${payload.jobCategoryName}`, functionName: 'CreateFeed', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)

        return sendResponse(res, 0, 200, "Sorry, error saving record", [])
    }

})

exports.UpdateFeed = asynHandler(async (req, res, next) => {
    const { patch, patchData, deleterecord, restore, feedId } = req.body;
    let actor = req.user.userInfo

    let deletePayload = {
        updatedAt: req.date,
        deletedById: actor.userId,
        deletedAt: !restore ? req.date : null,
    };
    let patchUserPayload = {
        updatedAt: req.date,
        updatedById: actor.userId,
       ...patchData,
    };

    let switchActionPayload = patch ? patchUserPayload : deletePayload

    let result = await GlobalModel.Update('system_feed', switchActionPayload, 'feedId', feedId);

    if (result.affectedRows === 1) {
        CatchHistory({ event: 'Update Feed', functionName: 'UpdateFeed', response: `system_feed record with id ${feedId} was updated by ${actor.userId}`, dateStarted: req.date, state: 1, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 1, 200, 'Record Updated')

    } else {
        CatchHistory({ event: 'Update Feed', functionName: 'UpdateFeed', response: `Error Updating Record with id ${feedId}`, dateStarted: req.date, state: 0, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 0, 200, 'Error Updating Record')
    }

})